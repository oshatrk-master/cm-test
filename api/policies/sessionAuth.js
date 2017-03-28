/**
 * sessionAuth
 *
 * @module      :: Policy
 * @description :: Simple policy to allow any authenticated user
 *                 Assumes that your login action in one of your controllers sets `req.session.authenticated = true;`
 * @docs        :: http://sailsjs.org/#!/documentation/concepts/Policies
 *
 */
module.exports = function (req, res, next) {

  // User is allowed, proceed to the next policy,
  // or if this is the last policy, the controller
  if (req.session.user) {

    if (!req.session.user.active) {
      // Если email пользователя не активирован, то
      // направить его на страницу перехода на почтовик
      // (эта проверка, такая же как и в UserController/login.js, сработает
      // здесь, например, в случае, если администратор отменит подтверждение 
      // почты пользователя):
      req.session.flash = {
        email: req.session.user.email
      };
      return res.redirect(302, '/after_register');
    }

    return next();
  }

  // User is not allowed
  // redirect to login page
  return res.redirect(302, '/login');
};
