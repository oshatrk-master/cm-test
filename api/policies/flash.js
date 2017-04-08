/**
 * @module      :: flash
 * @description :: Эта политика используется в качестве middleware для передачи
 *                 параметров в представления при редиректах на GET-ресурсы.
 *                 Обычно при редиректах после POST.
 */
module.exports = function (req, res, next) {


  if((!req.xhr) && req.method === 'GET' && req.session && req.session.flash) {
    // Переносим параметры из сессии в res.locals, которая доступна
    // в представлениях:
    res.locals.flash = req.session.flash;
    delete req.session.flash;
  }

  return next();
};

// todo: flash по-смыслу не является "политикой авторизации". Лучше сделать его отдельным middleware.
