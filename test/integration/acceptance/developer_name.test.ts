import 'mocha';
import { expect } from 'chai';
import * as supertest from 'supertest';
declare const sails: any;

describe('#1 Главная страница содержит имя и фамилию разработчика', function () {

  describe('Имя и фамилия разработчика', function () {

    it('отобразится, если браузер потребует английский язык (en-US)', function (done) {
      supertest(sails.hooks.http.app)
        .get('/')
        .set('Accept', 'text/html')
        .set('Accept-Charset', 'utf-8')
        .set('Accept-Language', 'en-US')
        .expect(200)
        .end(function (err, res) {
          if (err) throw err;
          expect(res.text).contains('Oleg');
          expect(res.text).contains('Shchukin');
          done();
        });
    });

    it('отобразится, если браузер потребует русский язык (ru-RU)', function (done) {
      supertest(sails.hooks.http.app)
        .get('/')
        .set('Accept', 'text/html')
        .set('Accept-Charset', 'utf-8')
        .set('Accept-Language', 'ru-RU,ru')
        .expect(200)
        .end(function (err, res) {
          if (err) throw err;
          expect(res.text).contains('Олег');
          expect(res.text).contains('Щукин');
          done();
        });
    });
  });

});
