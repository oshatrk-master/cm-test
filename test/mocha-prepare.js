'use strict';

var prepare = require('mocha-prepare');
var sails = require('sails');

prepare(function (done) {
  // called before loading of test cases

  console.log("Sails lifting");

  sails.lift({
    // configuration for testing purposes
    port: 1338,

    log: {
      level: 'silent'
    },
    hooks: {
      grunt: false
    },
    models: {
      connection: 'testConnection',
      migrate: 'drop'
    },
    connections: {
      testConnection: {
        adapter: 'sails-disk'
      }
    }

  }, function(err) {
    //console.log("sails lifted");
    if (err) return done(err);
    // here you can load fixtures, etc.
    done(err, sails);
  });

}, function (done) {
  // called after all test completes (regardless of errors)


  // here you can clear fixtures, etc.
  sails.lower(done);
  console.log("Sails lowered");

});
