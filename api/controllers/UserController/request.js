/* global _, Request */

module.exports = function request(req, res) {

  if (req.xhr) {
    var id_requested = req.param('id_requested');
    Request.count({
      id_requesting: req.session.user.id,
      id_requested: id_requested
    }).exec(function(error, count) {
      if (error)
        return res.negotiate(error);
      else {
        if (!count) {
          Request.create({
            id_requesting: req.session.user.id,
            id_requested: id_requested
          }).exec(function(error, request) {
            if (error) {
              return res.send({
                success: false,
                error: error
              });
            }
            else {
              Request.findOne(request.id).populateAll().exec(function(error, request) {
                request.id_requesting = _.omit(request.id_requesting, 'password');
                Request.publishCreate(request, req);
                return res.send({
                  success: true,
                  message: "Заявка успешно отправлена"
                });
              });
            }
          });
        }
        else {
          return res.send({
            success: true,
            message: "Заявка уже существует"
          });
        }
      }
    });
  }
  else {
    return res.badRequest();
  }

};
