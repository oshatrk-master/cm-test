/* global AuthentificationService */

module.exports = function logout(req, res) {

  AuthentificationService.logoutSync({req});
  return res.redirect('/');

};
