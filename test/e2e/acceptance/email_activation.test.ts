import 'mocha';
import {assert} from 'chai';
import PgNative = require('pg-native');

describe('#2 Подтверждение email', function () {

  describe('Вход в систему', function () {
    const connectionString = "postgresql://test:test@localhost:5432/test";
    const login = "testuser1";
    const password = "testuser1pass";
    const firstname = "testuser1firstname";
    const secondname = "testuser1secondname";
    const email = "testuser1@example.com";
    let pgdb = new PgNative();;
    
    before(function() {
      //console.log(browser.options);

      pgdb.connectSync(connectionString);
    });

    beforeEach(function() {
      // Удаляем пользователя, если есть:
      pgdb.querySync('DELETE FROM users WHERE username=$1::text', [login]);
    });

    it('запрещен без подтверждения email', function () {

      // Регистрируем нового пользователя:
      browser.url('/user/register');
      browser.element('#username').setValue(login);
      browser.element('#password').setValue(password);
      browser.element('#firstname').setValue(firstname);
      browser.element('#lastname').setValue(secondname);
      browser.element('#email').setValue(email);;
      browser.element('form').submitForm();

      // Проверяем, что зарегистрировались:      
      assert.match(browser.getUrl(),/^.*\/after_register$/, "Проблема при регистрации");
      
      // Входим в систему без подтверждения e-mail:
      browser.url('/login');
      browser.element('#login').setValue(login);
      browser.element('#password').setValue(password);
      browser.element('form').submitForm();

      // Проверяем, что не удалось войти:      
      assert.notMatch(browser.getUrl(),/^.*profile.*$/, "Пользователь зашел в систему без подтверждения e-mail");
      
    });

    it('разрешен после подтверждения email', function () {

      // Регистрируем нового пользователя:
      browser.url('/user/register');
      browser.element('#username').setValue(login);
      browser.element('#password').setValue(password);
      browser.element('#firstname').setValue(firstname);
      browser.element('#lastname').setValue(secondname);
      browser.element('#email').setValue(email);;
      browser.element('form').submitForm();

      // Проверяем, что зарегистрировались:      
      assert.match(browser.getUrl(),/^.*\/after_register$/, "Проблема при регистрации");
      
      // Подтверждаем e-mail:
      let {id, t} = pgdb.querySync('SELECT id, password as t FROM users WHERE username=$1::text', [login])[0];
      let activationLink = 'http://localhost:1337/user/register/?id=' +
          encodeURIComponent(id) + '&t=' + encodeURIComponent(t);

      browser.url(activationLink);
      assert.match(browser.getUrl(),/^.*login$/, "После подтверждения e-mail не было перехода на /login");
      
      // Входим в систему после подтверждения e-mail:
      //browser.element('#login').setValue(login); -- должно быть уже заполнено
      browser.element('#password').setValue(password);
      browser.element('form').submitForm();

      // Проверяем, что вошли в систему:      
      assert.match((browser.getUrl()),/^.*profile.*$/, "Пользователь не смог зайти в систему после подтверждения e-mail");
      assert.match((browser.getText('body')), /(firstname)/, 'Вероятно, пользователь не смог зайти в систему - не найдено имя пользователя на странице профиля.');

    });

    afterEach(async function() {
      // Удаляем пользователя:
      pgdb.querySync('DELETE FROM users WHERE username=$1::text', [login]);
    });

  });

});
