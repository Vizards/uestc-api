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

  it('should get school calendar', async () => {
    const body = {
      year: app.config.user.year,
      semester: app.config.user.semester,
    };
    const res = await app.httpRequest()
      .post('/api/home/calendar')
      .set('Accept', 'application/json')
      .send(body)
      .expect('Content-Type', /json/)
      .expect(200);
    assert(res.body.code === 201);
    assert(res.body.data.hasOwnProperty('startDate') === true);
    assert(res.body.data.hasOwnProperty('endDate') === true);
  });
});
