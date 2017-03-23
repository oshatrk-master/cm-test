/* global _, Friend, sails, User */

module.exports = function friends(req, res) {

  if (req.xhr) {
    switch (req.method) {
      case 'GET':
        User.findOne(parseInt(req.param('id', 0))).populate('friends').exec(function(error, user) {
          if (error)
            return res.negotiate(error);
          else {
            var friend_ids = _.map(user.friends, function(friend) {
              return friend.id_friend;
            });
            User.find(friend_ids).exec(function(error, friends) {
              if (error)
                return res.negotiate(error);
              else {
                return res.view({
                  friends: friends
                });
              }
            });
          }
        });
        break;
      case 'DELETE':
        var id = parseInt(req.param('id'));
        Friend.destroy({
          id_user: [id, req.session.user.id],
          id_friend: [id, req.session.user.id]
        }).exec(function(error) {
          if (error) {
            return res.negotiate(error);
          }
          else {
            sails.sockets.blast('delete_friend', {
              id_user: req.session.user.id,
              id_friend: id
            });
            return res.ok();
          }
        });
        break;
      default:
        return res.badRequest();
    }
  }
  else {
    return res.badRequest();
  }

};
