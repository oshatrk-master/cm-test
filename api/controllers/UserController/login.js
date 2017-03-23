/* global User */

var crypto = require('crypto');

module.exports = function login(req, res) {

  if (req.method == 'POST') {
    User.findOne({
      username: req.param('username')
    }).exec(function(error, user) {
      if (error) {
        res.view('user/error', {
          message: 'При проверке логина и пароля произошла ошибка: ' + error.message
        });
      }
      else {
        if (user.password == crypto.createHash('sha256').update(req.param('password')).digest('hex')) {
          req.session.user = user;
          return res.redirect('/user/profile/' + user.id);
        }
        else {
          res.view('user/error', {
            message: 'Неверный логин или пароль'
          });
        }
      }
    });
  }
  else {
    if (typeof req.session.user == 'undefined') {
      return res.view();
    }
    else {
      return res.redirect('/user/profile/' + req.session.user.id);
    }
  }

};
