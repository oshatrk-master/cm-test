/* global _, Friend, Request, User */

module.exports = function list(req, res) {
  
  if (req.xhr) {
    Friend.find({
      id_user: req.session.user.id
    }).exec(function(error, friends) {
      if (error)
        return res.negotiate(error);
      else {
        var exclude = _.map(friends, function(friend) {
          return friend.id_friend;
        });
        Request.find({
          id_requesting: req.session.user.id
        }).exec(function(error, requests) {
          if (error)
            return res.negotiate(error);
          else {
            exclude = exclude.concat(_.map(requests, function(request) {
              return request.id_requested;
            }));
            exclude.push(req.session.user.id);
            User.find({
              id: {
                '!': exclude
              }
            }).exec(function(error, list) {
              if (error)
                return res.negotiate(error);
              else {
                return res.view({
                  list: list
                });
              }
            });
          }
        });
      }
    });
  }
  else {
    return res.badRequest();
  }
  
};
