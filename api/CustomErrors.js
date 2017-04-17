/**
 * В этом модуле собраны используемые классы ошибок.
 */

// http://stackoverflow.com/a/32749533
class ExtendableError extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, this.constructor);
    } else {
      this.stack = (new Error(message)).stack;
    }
  }
}

class IncorrectLoginError extends ExtendableError {}

/**
* @class CustomErrors
*/
module.exports = {
  IncorrectLoginError: function(...args) {return new IncorrectLoginError(...args);}
};
