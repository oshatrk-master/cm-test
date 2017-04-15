/* global sails, User */
const crypto = require('crypto');
const CustomErrors = require('../CustomErrors');

/**
 * В этом модуле собраны функции аутентификации -
 * проверка имени и пароля, работа с хешированием паролей
 * и токенами подтверждения почты пользователя.
 *
 * @class AuthentificationService
 */
module.exports = {

  // Рекомендовано использовать соль длиной не менее 16 байт
  // (если длина еще и кратна 3, то в конце base64 строки не будет знаков '=')
  saltLength: 21,

  // Разделитель между солью и хешем пароля в поле password таблицы users,
  // а также между id и хешем в токене подтверждения почты.
  // Не должен быть символом Base64 (не A-Z, a-z, +, /).
  hashDelimiter: ':',

  // Максимальная длина части пароля, для которой будет сгенерирован хеш
  maxPasswordLength: 3333,

  /**
   * Новая соль создается при создании нового пароля пользователя
   * и затем будет храниться в базе данных вместе с хешем пароля
   * (в таблице users в начале поля password, соль и хеш разделены ':').
   *
   * @returns {string} Новая соль.
   */
  generateSaltSync: function () {
    return crypto.randomBytes(this.saltLength).toString('base64');
  },

  /**
   * @callback CreatePasswordSaltHashCallback
   * @param {Error|null} error
   * @param {string} [saltAndHash] Строка вида "cоль:хеш", где соль и хеш пароля -
   *                               это строки в base64.
   */
  /**
   * Создание хеша пароля с заданной солью.
   *
   * @param {object} options
   * @param {string} options.password Пароль, для которого будет создан хеш.
   * @param {string} options.salt Соль для добавления при хешировании.
   * @param {CreatePasswordSaltHashCallback} callback
   *
   */
  createPasswordSaltHash: function (options, callback) {
    let password = options.password;
    let salt = options.salt;

    if (!password) return callback(TypeError('Empty password'));
    if (!salt) return callback(TypeError('Empty salt'));

    // Расшифровываем пароль:
    try {
      password = crypto.privateDecrypt({
        key: sails.config.authentication.privateKey,
        padding: crypto.constants.RSA_PKCS1_PADDING
      }, Buffer.from(password, 'base64')).toString('utf8');
    } catch (error) {
      return callback(error);
    }

    // Ограничиваем длину пароля (запрет мегабайтных паролей)
    if (password.length > this.maxPasswordLength)
      password = password.substr(0, this.maxPasswordLength);

    // Генерирация хеша пароля замедлена до ~1 секунды (по сравнению
    // со слишком быстрой sha256):
    crypto.pbkdf2(password, salt, 500000, 64, 'sha512', (error, key) => {
      if (error)
        return callback(error);

      return callback(null, salt + this.hashDelimiter + key.toString('base64'));
    });
    // todo: вынести аутентификацию на отдельные ноды
    // (из-за того, что расчеты хешей паролей должны занимать продолжительное
    // время, процессы аутентификации являются удобным объектом для DOS-атак)
  },

  /**
   * Создание нового хеша пароля с новой солью. Выполняется
   * при регистрации пользователя, либо смене пароля.
   *
   * @param {object} options
   * @param {string} options.password Пароль, для которого будет создан хеш.
   * @param {CreatePasswordSaltHashCallback} callback
   *
   */
  createNewPasswordHash: function (options, callback) {
    this.createPasswordSaltHash({
      password: options.password,
      salt: this.generateSaltSync()
    }, callback);
  },

  /**
   * @callback CheckCredentialsCallback
   * @param {Error|null} error
   * @param {User} [user] Объект с данными пользователя, соответствующий
   *                      логину и паролю.
   */
  /**
   * Аутентификация - проверка имени и пароля. В случае успеха, коллбэк
   * получит объект user.
   *
   * @param {object} options
   * @param {string} options.username Логин.
   * @param {string} options.password Пароль.
   * @param {CheckCredentialsCallback} callback
   */
  authentificate: function (options, callback) {
    let username = options.username;
    let password = options.password;
    // todo: принимать только пароли, предаварительно хешированные в браузере

    if (!username) return callback(TypeError('Empty username'));
    if (!password) return callback(TypeError('Empty password'));

    // Найдем пользователя по логину:
    User.findOne({
      username
    }).exec((error, user) => {
      if (error) {
        sails.log.error(`(username=${username})`, error);
        return callback(error);
      }
      let salt;
      if (!user) {
        // В базе данных нет такого логина
        // (продолжим вычисление как будто такой пользователь есть - это сделает похожим
        // время ответов для существующего и несуществующего логина)
        salt = this.generateSaltSync();
      } else {
        salt = user.password.substr(0, user.password.indexOf(this.hashDelimiter));
      }
      this.createPasswordSaltHash({
        password,
        salt
      }, function (error, saltAndHash) {
        if (error) {
          sails.log.error(`(username=${username})`, error);
          return callback(error);
        }
        if (!user || user.password !== saltAndHash) {
          // Неверный логин или пароль:
          return callback(new CustomErrors.IncorrectLoginError());
        }
        return callback(null, user);
      });
    });
  },

  /**
   * Разлогинивание пользователя на стороне сервера - это
   * просто очистка сессии. Синхронная функция.
   *
   * @param {Express.Request} options.req
   */
  logoutSync: function (options) {
    let req = options.req;

    if (!req) throw TypeError('Empty req');

    if (!req.session) return;

    if (req.session.user)
      delete req.session.user;
  },

  /**
   * Возвращает токен для ссылки подтверждения почты.
   * Токен будет состоять из id в таблице users, разделителя
   * и MD5 от хеша пароля. Перед использованием в ссылке этот токен
   * должен быть проэкранирован функцией encodeURIComponent().
   *
   * @param {object} options
   * @param {number} options.id Id пользователя.
   * @param {string} options.saltAndHash Хэш пароля пользователя.
   * @returns {string} Токен для подтверждения email.
   */
  createEmailConfirmationTokenSync: function (options) {
    let id = options.id;
    let saltAndHash = options.saltAndHash;

    if (!id) throw TypeError('Empty id');
    if (!saltAndHash) throw TypeError('Empty saltAndHash');

    let hash = saltAndHash.split(this.hashDelimiter, 2)[1];

    return '' + id + this.hashDelimiter +
      crypto.createHash('md5').update(hash).digest('base64');

    // Примечание - MD5 здесь используется не для шифрования,
    // а лишь для того, чтобы уменьшить длину токена и ссылка с ним
    // могла влезть в 78 символов (чтобы было удобно брать эту ссылку
    // из текстовой части письма при работе с mail в терминале).

  },

  /**
   * @callback ConfirmEmailCallback
   * @param {Error|null} error
   * @param {User} [user] Объект с данными пользователя, соответствующий
   *                      указанному токену (т.е. с тем же id, что и в токене).
   */
  /**
   * Подтверждение почты по указанному токену. В случае успеха, коллбэк
   * получит объект user.
   *
   * @param {object} options
   * @param {string} options.token Токен из ссылки подтверждения почты.
   * @param {ConfirmEmailCallback} callback
   */
  confirmEmail: function (options, callback) {
    let token = options.token;

    if (!token) return callback(TypeError('Empty token'));

    let id = token.split(this.hashDelimiter, 2)[0];

    // Найдем пользователя по логину:
    User.findOne({
      id
    }).exec((error, user) => {

      if (error) {
        // Ошибка при работе с базой данных
        sails.log.error(`(id=${id})`, error);
        return callback(Error('При активации пользователя произошла ошибка.'));
      }

      if (!user) {
        // В базе данных нет такого id
        return callback(Error('При активации пользователя произошла ошибка.'));
      }

      if (token !== this.createEmailConfirmationTokenSync({
          id,
          saltAndHash: user.password
        })) {
        // Неверный токен
        return callback(Error('При активации пользователя произошла ошибка.'));
      }

      // Отмечаем в базе, что пользователь подтвердил свой email:
      User.update({
        id
      }, {
        active: true
      }).exec(function (error) {
        if (error) {
          sails.log.error(`(id=${id})`, error);
          return callback(Error('При активации пользователя произошла ошибка.'));
        }

        return callback(null, user);
      });
    });
  }

};
