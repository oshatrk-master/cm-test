/* global _ */

// Список известных почтовиков и обслуживаемых ими почтовых доменов:
let known_mailers = [
  ['https://mail.ru/', ['mail.ru', 'bk.ru', 'list.ru', 'inbox.ru']],
  ['https://mail.yandex.ru/', ['yandex.ru', 'ya.ru']],
  ['https://mail.google.com/', ['gmail.com', 'googlemail.com']],
  ['https://mail.live.com/', ['outlook.com', 'hotmail.com', 'live.ru', 'live.com']],
  ['https://www.icloud.com/', ['me.com', 'icloud.com']],
  ['https://mail.rambler.ru/', ['rambler.ru']],
  ['https://mail.yahoo.com/', ['yahoo.com']]
];

// Перестроим так, чтобы можно было сразу получать адрес по домену:
// domain2mailer == {
//   'mail.ru': 'https://mail.ru/',
//   'bk.ru': 'https://mail.ru/',
//   ...
// }
let domain2mailer = _.zipObject(_.flatten(
  known_mailers.map((mailer) =>
    mailer[1].map((d) => [d, mailer[0]]))
));


module.exports = function after_register(req, res) {
  let mailers = known_mailers.map((mailer) => mailer[0]);

  let email = _.head(req.flash('email'));
  if (email) {
    let emailDomain = email.slice(email.indexOf('@') + 1);
    let mailerUrl = domain2mailer[emailDomain];
    if (mailerUrl) {
      // Передвигаем найденный почтовик вверх списка:
      let i = mailers.indexOf(mailerUrl);
      if (i < 0) throw Error('ram error?');
      mailers = [mailers[i], ...mailers.slice(0, i), ...mailers.slice(i + 1)];
    }
    else {
      // Указываем вероятный адрес почтовика пользователя:
      res.locals.unknownMailer = 'https://' + encodeURIComponent(emailDomain);
    }
  }
  res.locals.mailers = mailers;
  return res.view();
};
