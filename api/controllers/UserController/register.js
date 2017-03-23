/* global User */

var crypto = require('crypto');

module.exports = function register(req, res) {
  
  if (req.method == 'POST') {
    var model = req.allParams();
    model.password = crypto.createHash('sha256').update(model.password).digest('hex');
    delete model.id;
    User.create(model, function(error, data) {
      if (error) {
        res.view('user/error', {
          message: 'При регистрации пользователя произошла ошибка: ' + error.message
        });
      }
      else {
        var nodemailer = require('nodemailer');
        var smtpTransport = require('nodemailer-smtp-transport');
        var transporter = nodemailer.createTransport(smtpTransport({
          host: 'localhost',
          port: 25,
          ignoreTLS: true
        }));
        var mailOptions = {
          from: 'test@cloudmaps.ru',
          to: model.email,
          subject: 'User Activation Email',
          text: 'http://localhost:1337/user/register/?id=' + data.id + '&t=' + model.password
        };
        transporter.sendMail(mailOptions, function(error, info) {
          if (error) {
            res.view('user/error', {
              message: 'При регистрации пользователя произошла ошибка: ' + error.message
            });
          }
          else res.view('user/after_register');
        });
      }
    });
  }
  else if (req.method == 'GET') {
    if (req.param('id') && req.param('t')) {
      var id = parseInt(req.param('id')),
        token = req.param('t');
      User.findOne(id).exec(function(error, user) {
        if (error) {
          res.view('user/error', {
            message: 'При активации пользователя произошла ошибка: ' + error.message
          });
        }
        else {
          if (user.password == token) {
            User.update(id, {
              active: true
            }).exec(function(error) {
              if (error) {
                res.view('user/error', {
                  message: 'При активации пользователя произошла ошибка: ' + error.message
                });
              }
              else {
                res.redirect('/login');
              }
            });
          }
          else {
            res.view('user/error', {
              message: 'При активации пользователя произошла ошибка: неверный ключ активации'
            });
          }
        }
      });
    }
    else {
      res.view();
    }
  }
  
};
