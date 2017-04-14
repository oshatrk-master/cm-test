/* global AuthentificationService */

/**
 * Обработка подтверджения почты (пользователь перешел по ссылке из письма)
 */
module.exports = function confirm(req, res) {

  let token = req.params.token;
  AuthentificationService.confirmEmail({token}, function (error, user) {
    if (error) {
      return res.view('user/error', {
        message: error.message
      });
    }

    // После редиректа на форму входа, поле логина уже будет заполнено:
    req.flash('justactivated', true);
    req.flash('username', user.username);
    return res.redirect(302, '/login');
  });

};
