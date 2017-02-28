import 'mocha';
import {assert} from 'chai';

describe('#1 Главная страница содержит имя и фамилию разработчика', function () {

  describe('Имя и фамилия разработчика', function () {

    it('отобразится в каком-то виде', function () {
      browser.url('/');

      // expect(browser.getText('body')).contains('Oleg');
      // expect(browser.getText('body')).contains('Shchukin');

      assert.match((browser.getText('body')), /(Oleg)|(Олег)/, 'Не найдено имя разработчика');
      assert.match((browser.getText('body')), /(Shchukin)|(Щукин)/, 'Не найдена фамилия разработчика');

    });

  });

});
