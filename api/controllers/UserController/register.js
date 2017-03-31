/* global sails, User */

const crypto = require('crypto');

module.exports = function register(req, res) {

  if (req.method == 'POST') {
    return register_POST(req, res);
  }

  if (req.method == 'GET') {
    if (req.param('id') && req.param('t')) {
      return register_GET_confirm_email(req, res);
    }
    else {
      return register_GET(req, res);
    }
  }

  return res.badRequest();
};


/**
 * Обработка данных формы регистрации
 */
function register_POST(req, res) {
  
  // Разлогинить (на случай, если залогиненный пользователь регистрирует новый аккаунт):
  delete req.session.user;

  let model = req.allParams();
  model.password = crypto.createHash('sha256').update(model.password).digest('hex');
  delete model.id;
  User.create(model, function(error, data) {
    if (error) {
      delete model.password;
      req.session.flash = {
        user: model,
        error: {
          message: 'При регистрации пользователя произошла ошибка.',
          code: error.code
        }
      };
      if (error.code === 'E_VALIDATION') {
        req.session.flash.error.invalidAttributes = error.invalidAttributes;
      }
      else {
        sails.log.error(error);
      }
      return res.redirect(303, 'back');
    }
    const nodemailer = require('nodemailer');
    const smtpTransport = require('nodemailer-smtp-transport');
    const transporter = nodemailer.createTransport(smtpTransport({
      host: 'localhost',
      port: 25,
      ignoreTLS: true
    }));
    const activationLink = 'http://localhost:1337/user/register/?id=' +
      encodeURIComponent(data.id) + '&t=' + encodeURIComponent(model.password);
    const mailOptions = {
      // from: 'test@cloudmaps.ru',
      from: sails.config.cloudmapsEmails.confirmation,
      to: model.email,
      subject: 'User Activation Email',
      text:
      /**
       * @todo Желательно, чтобы строка со ссылкой не превышала 
       *       78 символов (RFC 2822) и не содержала символов '='
       *       тогда ее можно сразу брать из mail (в терминале).
       */
        'Please activate Your account using this link:\n' + activationLink,
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
    transporter.sendMail(mailOptions, function(error, info) {
      if (error) {
        delete model.password;
        req.session.flash = {
          user: model,
          error: {
            message: 'При отправке почтового сообщения произошла ошибка.',
            code: error.code
          }
        };
        sails.log.error(error);
        // Удаляем только-что созданную запись:
        User.destroy({
          id: data.id
        }).exec(function(error) {
          if (error) {
            delete model.password;
            req.session.flash = {
              user: model,
              error: {
                message: 'При регистрации пользователя произошла ошибка.',
                code: error.code
              }
            };
            sails.log.error(error);
            return res.redirect(303, 'back');
          }
          return res.redirect(303, '/login');
        });
        return res.redirect(303, 'back');
      }
      req.session.flash = {
        email: model.email
      };
      return res.redirect(303, '/after_register');
    });
  });
}

/**
 * Обработка подтверджения почты (пользователь перешел по ссылке из письма)
 */
function register_GET_confirm_email(req, res) {
  let id = parseInt(req.param('id')),
    token = req.param('t');
  User.findOne({
    id
  }).exec(function(error, user) {
    if (error || !user || user.password != token) {
      if (error) sails.log.error(error);
      return res.view('user/error', {
        message: 'При активации пользователя произошла ошибка.'
      });
    }
    User.update({
      id
    }, {
      active: true
    }).exec(function(error) {
      if (error) {
        sails.log.error(error);
        return res.view('user/error', {
          message: 'При активации пользователя произошла ошибка.'
        });
      }
      req.session.flash = {
        justactivated: true,
        user: {
          username: user.username
        }
      };
      return res.redirect(302, '/login');
    });
  });
}

/**
 * Отображение формы регистрации
 */
function register_GET(req, res) {

  if (!res.locals.flash) {
    // В шаблоне используются выражения вида 'flash.username'
    // Если res.locals.flash не определена, то шаблон выдаст ошибку
    // при использовании 'flash.user.username'. Чтобы в шаблоне не писать
    // везде "value=flash&&flash.user?flash.user.username:''", 
    // инициализируем flash.user пустым объектом. При неявном приведении 
    // undefined к строковому типу получаем пустую строку, то есть можно 
    // без проблем использовать в шаблоне 'flash.username' (если только 
    // не приводить к строке явно, например ''+flash.username 
    // станет 'undefined' в этом случае).
    res.locals.flash = {
      user: {}
    };
  }
  return res.view();
}
