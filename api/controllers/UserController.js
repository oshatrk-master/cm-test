/**
 * UserController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */


const requireAndBindActions = require('../requireAndBindActions')

const UserController = requireAndBindActions(__filename);

module.exports = UserController;

