/* global Friend, Request */

module.exports = function subscribe(req, res) {

  if (req.isSocket && req.session.user) {
    Request.watch(req);
    Friend.watch(req);
  }
  return res.ok();

};
