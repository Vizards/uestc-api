'use strict';

const { app, assert } = require('egg-mock/bootstrap');

describe('test/app/controller/home.test.js', () => {

  it('should assert', function* () {
    const pkg = require('../../../package.json');
    assert(app.config.keys.startsWith(pkg.name));

    // const ctx = app.mockContext({});
    // yield ctx.service.xx();
  });

  it('should get text response', () => {
    return app.httpRequest()
      .get('/')
      .expect(200);
  });

  it('should get json response', async () => {
    const res = await app.httpRequest()
      .get('/')
      .set('Accept', 'application/json')
      .expect(200);
    assert(res.body.data === 'hi, uestc');
  });
});
