/* global _, sails*/

module.exports = function avatar(req, res) {
  
    var fs = require('fs');
    var avatar_dir = sails.config.rootPath + '/avatars/';
    if (req.method == 'GET') {
      var avatar = avatar_dir + req.param('id') + '.jpg';
      fs.stat(avatar, function (error, stats) {
        if (error) {
          return res.sendfile(avatar_dir + 'default-avatar.jpg');
        }
        else if (stats.isFile()) {
          return res.sendfile(avatar);
        }
        else {
          return res.notFound();
        }
      });
    }
    else if (req.method == 'POST') {
      req.file('file').upload({}, function (error, files) {
        if (error)
          return res.negotiate(error);
        else {
          fs.rename(files[0].fd, avatar_dir + req.session.user.id + '.jpg', function (error) {
            if (error)
              return res.negotiate(error);
            else
              return res.ok();
          });
        }

      });
    }
    
  };