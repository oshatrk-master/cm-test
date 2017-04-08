/* global AuthentificationService, sails, User */

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
  AuthentificationService.logoutSync({req});

  let username = req.param('username');
  let password = req.param('password');

  AuthentificationService.authentificate({username, password}, function (error, user) {
    if (error) {
      req.session.flash = {
        user: {
          username
        },
        error: error.message
      };
      return res.redirect(303, 'back');
    }
    // Аутентификация прошла успешно - перенаправляем на профиль
    // (при входе на профиль будет проверена авторизация с помощью политики sessionAuth):
    req.session.user = user;
    return res.redirect(303, '/user/profile/' + user.id);
  });
}

/**
 * Отображение формы регистрации
 */
function login_GET(req, res) {

  let session = req.session;
  if (session && session.user) {
    // Переходим на профиль, если пользователь уже авторизирован:
    return res.redirect(302, '/user/profile/' + session.user.id);
  }

  if (!res.locals.flash) {
    res.locals.flash = {
      user: {}
    };
  }
  return res.view();
}
