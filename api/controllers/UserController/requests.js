/* global _, Friend, Request */

module.exports = function requests(req, res) {
  
  if (req.xhr) {
    switch (req.method) {
      case 'GET':
        Request.find({
          id_requested: parseInt(req.param('id', 0))
        }).populate('id_requesting').exec(function(error, requests) {
          if (error) {
            return res.negotiate(error);
          }
          else {
            return res.view({
              requests: _.map(requests, function(request) {
                return request.id_requesting;
              })
            });
          }
        });
        break;
      case 'PUT':
        Friend.create([{
          id_user: req.session.user.id,
          id_friend: parseInt(req.param('id'))
        }, {
          id_friend: req.session.user.id,
          id_user: parseInt(req.param('id'))
        }]).exec(function(error, data) {
          if (error)
            return res.negotiate(error);
          else {
            Friend.publishCreate(data[0], req);
            Request.destroy({
              id_requesting: parseInt(req.param('id')),
              id_requested: req.session.user.id
            }).exec(function(error) {
              if (error)
                return res.negotiate(error);
              else {
                return res.ok();
              }
            });
          }
        });
        break;
      case 'DELETE':
        Request.destroy({
          id_requesting: parseInt(req.param('id')),
          id_requested: req.session.user.id
        }).exec(function(error) {
          if (error)
            return res.negotiate(error);
          else {
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
