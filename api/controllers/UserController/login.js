/* global sails, User */

const crypto = require('crypto');

module.exports = function login(req, res) {

  if (req.method == 'POST') {
    return login_POST(req, res);
  }
  if (req.method == 'GET') {
    return login_GET(req, res);
  }

  return res.badRequest();
};


/**
 * Обработка данных формы входа в систему
 */
function login_POST(req, res) {

  // Разлогиним, если пользователь залогинен (например, для входа с другим логином):
  if (req.session.user) delete req.session.user;

  let username = req.param('username');
  User.findOne({
    username
  }).exec(function(error, user) {
    if (error) {
      sails.log.error(error);
      req.session.flash = {
        user: {
          username
        },
        error: {
          message: 'При проверке логина и пароля произошла ошибка.'
        }
      };
      return res.redirect(303, 'back');
    }
    if (!user || user.password != crypto.createHash('sha256').update(req.param('password')).digest('hex')) {
      req.session.flash = {
        user: {
          username
        },
        error: {
          message: 'Неверный логин или пароль.'
        }
      };
      return res.redirect(303, 'back');
    }
    if (!user.active) {
      // Если пользователь еще не активировал свой email,
      // направить его на страницу перехода на почтовик: 
      req.session.flash = {
        email: user.email
      };
      return res.redirect(303, '/after_register');
    }
    // Успешный вход - перенаправляем на профиль:
    req.session.user = user;
    return res.redirect(303, '/user/profile/' + user.id);
  });
}

/**
 * Отображение формы регистрации
 */
function login_GET(req, res) {

  if (req.session.user) {
    // Переходим на профиль, если пользователь уже авторизирован:
    return res.redirect('/user/profile/' + req.session.user.id);
  }

  if (!res.locals.flash) {
    res.locals.flash = {
      user: {}
    };
  }
  return res.view();
}
