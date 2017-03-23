/**
 * Загрузка и привязка модулей действий к контроллеру.
 * @module requireAndBindActions
 */

const path = require('path');
const fs = require('fs');

/**
 * Список расширений файлов действий, загружаемых requireAndBindActions():
 */
const filesToInclude = [
  /(.+)\.js$/,
  /(.+)\.jsx$/,
  /(.+)\.coffee$/,
  /(.+)\.ts$/,
  /(.+)\.tsx$/
];

/**
 * Синхронно загружает модули действий из директории, соответствующей имени контроллера.
 * Каждый модуль должен описывать отдельное действие и экспортировать
 * его как функцию, именованную аналогично названию файла
 * ([c/C]amelCase, dash-case и underscore_case считаются равными).
 * После загрузки, фукнция действия привязывается к объекту контроллера
 * и добавляется в него. Таким образом, this в коде действия будет указывать
 * на контроллер.
 * 
 * @param {string} controllerFileName Имя файла контроллера (абсолютное).
 * @param {object} [controller={}] Объект контроллера, если не задан, будет
 *                                 создан пустой объект.
 * @returns {object} Возвращает объект контроллера.
 * 
 * @example
 * // Создает контроллер с действиями из поддиректории './UserController/'
 * const UserController = requireAndBindActions(__filename);
 * module.exports = UserController;
 * 
 * @example
 * // Добавляет действия в контроллер, при этом this.counter доступно в действиях
 * let UserController = {counter: 0}; 
 * module.exports = requireAndBindActions(__filename, UserController);
 */
module.exports = function requireAndBindActions(
  controllerFileName,
  controller = {}
) {

  let extlen = path.extname(controllerFileName).length;
  let controllerName = path.basename(controllerFileName).slice(0, -extlen);
  let dir = controllerFileName.slice(0, -extlen);

  let filenames = fs.readdirSync(dir);
  filenames.forEach(filename => {

    filesToInclude.some(re => {
      let m = re.exec(filename);
      if (!m || !m[1]) return false;
      let actionname = m[1].toLowerCase();
      let actionFilename = path.join(dir, filename);

      let action = require(actionFilename);

      // todo: [c/C]amelCase, dash-case, underscore_case считать равными
      if (!action.name || action.name.toLowerCase() !== actionname) {
        throw Error(
          'The exported action function name must look like its file name.\n' +
          'Action name: ' +
          (action.name === '' ? action.name : 'empty string') + '\n' +
          'File: ' + actionFilename);
      }

      controller[action.name] = action.bind(controller);
      return true;
    });

  });

  return controller;
};
