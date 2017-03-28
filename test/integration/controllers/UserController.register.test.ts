import 'mocha';
import { assert } from 'chai';
//import * as supertest from 'supertest';
import * as sinon from 'sinon';

declare const sails: any;

describe('UserController.register()', function () {

  describe('GET /register', function () {

    // Пример теста - особого смысла не несет: проверяет, что контроллер вызывает представление
    it('вызывает view()', function (done) {
      // supertest(sails.hooks.http.app)
      //   .post('/user/register')
      //   .send({ name: 'test', password: 'test' })
      //   .expect(302)
      //   .expect('location','/mypage', done);

      let view = sinon.spy();
      sails.controllers.user.register({
        method: "GET",
        param: function () {
          return false;
        }
      }, {
        view: view,
        locals: {}
      });
      assert.ok(view.called);
      done();
    });
  });

});
