/**
 * UserController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 *
 */

// Подключение действий к контроллеру.

// Если выполнить подключение в таком-же неявном стиле, как это сделано в Sails,
// то автодополнение не будет работать в Ide:

const requireAndBindActions = require('../requireAndBindActions');

const UserController = requireAndBindActions(__filename);

module.exports = UserController;

// // Явное подключение будет работать в Ide, но требует ручного обновления
// // для добавления, удаления и переименования действий:
// /**
//  * @class sails.controllers.user
//  */
// module.exports = {
//   after_register: require('./UserController/after_register'),
//   avatar: require('./UserController/avatar'),
//   confirm: require('./UserController/confirm'),
//   friends: require('./UserController/friends'),
//   list: require('./UserController/list'),
//   login: require('./UserController/login'),
//   logout: require('./UserController/logout'),
//   profile: require('./UserController/profile'),
//   register: require('./UserController/register'),
//   request: require('./UserController/request'),
//   requests: require('./UserController/requests'),
//   subscribe: require('./UserController/subscribe')
// };
