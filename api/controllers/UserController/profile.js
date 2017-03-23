/* global _, User */

module.exports = function profile(req, res) {

  User.findOne(req.param('id')).exec(function(error, user) {
    if (error) {
      res.view('user/error', {
        message: 'Ошибка: ' + error.message
      });
    }
    else {
      res.view({
        user: _.omit(user, 'password')
      });
    }
  });

};
