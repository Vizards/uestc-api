'use strict';

const { app } = require('egg-mock/bootstrap');

describe('test/app/controller/extra.test.js', () => {
  it('should get traffic info', async () => {
    await app.httpRequest()
      .get('/api/extra/traffic')
      .set('Accept', 'text/html')
      .expect('Content-Type', /html/)
      .expect(200);
  });

  it('should get notification info', async () => {
    await app.httpRequest()
      .get('/api/extra/notification')
      .set('Accept', 'text/html')
      .expect(302);
  });

  it('should get department info', async () => {
    await app.httpRequest()
      .get('/api/extra/dept')
      .set('Accept', 'text/html')
      .expect(302);
  });

  it('should get contact info', async () => {
    await app.httpRequest()
      .get('/api/extra/contact')
      .set('Accept', 'text/html')
      .expect(302);
  });
});