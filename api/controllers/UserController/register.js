/* global _, AuthentificationService, sails, User */

module.exports = function register(req, res) {

  if (req.method == 'POST') {
    return register_POST(req, res);
  }

  if (req.method == 'GET') {
    return register_GET(req, res);
  }

  return res.badRequest();
};


/**
 * Обработка данных формы регистрации
 */
function register_POST(req, res) {

  // Разлогинить (на случай, если залогиненный пользователь регистрирует новый аккаунт):
  AuthentificationService.logoutSync({req});

  let model = req.allParams();
  delete model.id;
  // Создаем хэш пароля:
  AuthentificationService.createNewPasswordHash(
    {
      password: model.password
    },
    function (error, saltAndHash) {
      if (error) {
        sails.log.error(error);
        delete model.password;

        req.flash('error', {
          message: 'При регистрации пользователя произошла ошибка.',
          code: error.code
        });
        req.flash('user', {
          username: model.username,
          firstname: model.firstname,
          lastname: model.lastname,
          email: model.email
        });

        return res.redirect(303, 'back');
      }

      model.password = saltAndHash;

      // Создаем пользователя в базе данных:
      User.create(model, function (error, data) {
        if (error) {
          delete model.password;

          let err4flash = {
            message: 'При регистрации пользователя произошла ошибка.',
            code: error.code
          };
          if (error.code === 'E_VALIDATION') {
            err4flash.invalidAttributes = error.invalidAttributes;
          }
          else {
            sails.log.error(error);
          }
          req.flash('error', err4flash);

          req.flash('user', {
            username: model.username,
            firstname: model.firstname,
            lastname: model.lastname,
            email: model.email
          });

          return res.redirect(303, 'back');
        }

        // Подготавливаем письмо со ссылкой для активации email:
        const nodemailer = require('nodemailer');
        const smtpTransport = require('nodemailer-smtp-transport');
        const transporter = nodemailer.createTransport(smtpTransport({
          host: 'localhost',
          port: 25,
          ignoreTLS: true
        }));
        const activationLink = 'http://localhost:1337/confirm/' +
          encodeURIComponent(
            AuthentificationService.createEmailConfirmationTokenSync({id: data.id, saltAndHash})
          );
        const mailOptions = {
          // from: 'test@cloudmaps.ru',
          from: sails.config.cloudmapsEmails.confirmation,
          to: model.email,
          subject: 'User Activation Email',
          text: /**
           * @todo Желательно, чтобы строка со ссылкой не превышала
           *       78 символов (RFC 2822) и не содержала символов '='
           *       тогда ее можно сразу брать из mail (в терминале).
           */
          'Please activate Your account using this link:\n\n' + activationLink + '\n\n',
          /** @todo Вынести шаблон письма в отдельный файл, локализовать. */
          html: `<!DOCTYPE html>
<html lang="ru-RU">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
</head>
<body>
Пожалуйста, перейдите по предложенной ниже ссылке для активации Вашей учетной записи:<br>
<a href="${activationLink}">${activationLink}</a>
<br>${req.__('Developer Name')}
</body>
</html>`
        };

        // Отправляем письмо:
        transporter.sendMail(mailOptions, function (error, info) {
          if (error) {
            sails.log.error(error);
            delete model.password;

            req.flash('error', {
              message: 'При отправке почтового сообщения произошла ошибка.',
              code: error.code
            });
            req.flash('user', {
              username: model.username,
              firstname: model.firstname,
              lastname: model.lastname,
              email: model.email
            });

            // При ошибке нужно удалить только-что созданную запись:
            User.destroy({
              id: data.id
            }).exec(function (error) {
              if (error) {
                sails.log.error(error);
                delete model.password;

                req.flash('error', {
                  message: 'При регистрации пользователя произошла ошибка.',
                  code: error.code
                });
                req.flash('user', {
                  username: model.username,
                  firstname: model.firstname,
                  lastname: model.lastname,
                  email: model.email
                });

                return res.redirect(303, 'back');
              }
              return res.redirect(303, '/login');
            });
            return res.redirect(303, 'back');
          }

          // Все ОК, перенаправляем на страницу с просьбой подтверждить email:
          req.flash('email', model.email);
          return res.redirect(303, '/after_register');
        });
      });
    }
  );

}

/**
 * Отображение формы регистрации
 */
function register_GET(req, res) {

  res.locals({error: _.head(req.flash('error'))});
  res.locals({user: _.head(req.flash('user'))});

  if (!res.locals.user) {
    // В шаблоне используются выражения вида 'user.username'
    // Если res.locals.user не определена, то шаблон выдаст ошибку
    // при использовании 'user.username'. Чтобы в шаблоне не писать
    // везде "value=user?flash.user.username:''",
    // инициализируем res.locals.user пустым объектом. При неявном приведении
    // undefined к строковому типу получаем пустую строку, то есть можно
    // без проблем использовать в шаблоне 'user.username' (если только
    // не приводить к строке явно, например ''+user.username
    // станет "undefined" в этом случае).
    res.locals({user: {}});
  }
  return res.view();
}
