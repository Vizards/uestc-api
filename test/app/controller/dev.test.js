'use strict';

const { app, assert } = require('egg-mock/bootstrap');

describe('test/app/controller/dev.test.js', () => {
  it('should get idas cookies', async () => {
    const body = {
      username: app.config.user.username,
      password: app.config.user.password,
    };

    const res = await app.httpRequest()
      .post('/api/dev/idas')
      .set('Accept', 'application/json')
      .send(body)
      .expect('Content-Type', /json/)
      .expect(200);
    assert(res.body.code === 201);
    assert(res.body.data.JSESSIONID !== undefined);
  });

  it('should get ecard cookies', async () => {
    const body = {
      username: app.config.user.username,
      password: app.config.user.password,
    };

    const res = await app.httpRequest()
      .post('/api/dev/ecard')
      .set('Accept', 'application/json')
      .send(body)
      .expect('Content-Type', /json/)
      .expect(200);
    assert(res.body.code === 201);
    assert(res.body.data.JSESSIONID !== undefined);
  });
});
