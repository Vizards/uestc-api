'use strict';

const { app } = require('egg-mock/bootstrap');

describe('test/app/controller/extra.test.js', () => {
  it('should get traffic info', async () => {
    await app.httpRequest()
      .get('/api/extra/traffic')
      .set('Accept', 'text/html')
      .expect(302);
  });

  it('should get department contact info', async () => {
    await app.httpRequest()
      .get('/api/extra/contact')
      .set('Accept', 'text/html')
      .expect(302);
  });

  it('should get info', async () => {
    await app.httpRequest()
      .get('/api/extra/info')
      .set('Accept', 'text/html')
      .expect(302);
  });

  it('should get student announcement', async () => {
    await app.httpRequest()
      .get('/api/extra/stu')
      .set('Accept', 'text/html')
      .expect(302);
  });

  it('should get education announcement', async () => {
    await app.httpRequest()
      .get('/api/extra/edu')
      .set('Accept', 'text/html')
      .expect(302);
  });

  it('should get communication announcement', async () => {
    await app.httpRequest()
      .get('/api/extra/communication')
      .set('Accept', 'text/html')
      .expect(302);
  });

  it('should get news', async () => {
    await app.httpRequest()
      .get('/api/extra/news')
      .set('Accept', 'text/html')
      .expect(302);
  });

  it('should get classroom info', async () => {
    await app.httpRequest()
      .get('/api/extra/room')
      .set('Accept', 'text/html')
      .expect(302);
  });

  it('should get today course info', async () => {
    await app.httpRequest()
      .get('/api/extra/today-course')
      .set('Accept', 'text/html')
      .expect(302);
  });

  it('should get search-course page', async () => {
    await app.httpRequest()
      .get('/api/extra/search-course')
      .set('Accept', 'text/html')
      .expect(302);
  });

  it('should get search-teacher page', async () => {
    await app.httpRequest()
      .get('/api/extra/search-teacher')
      .set('Accept', 'text/html')
      .expect(302);
  });
});
