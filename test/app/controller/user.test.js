'use strict';

const { app, assert } = require('egg-mock/bootstrap');
let token = '';

describe('test/app/controller/user.test.js', () => {
  it('should login', async () => {
    const body = {
      username: app.config.user.username,
      password: app.config.user.password,
    };
    const res = await app.httpRequest()
      .post('/api/user/login')
      .set('Accept', 'application/json')
      .send(body)
      .expect('Content-Type', /json/)
      .expect(200);
    assert(res.body.code === 201);
    assert(res.body.data.token.length !== 0);
    token = res.body.data.token;
  });

  it('should get profile', async () => {
    const res = await app.httpRequest()
      .get('/api/user/profile')
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .expect('Content-Type', /json/)
      .expect(200);
    assert(res.body.code === 200);
    assert(res.body.data.length !== 0);
    assert(res.body.data.stuID === app.config.user.username);
  });

  it('should set profile', async () => {
    const body = {
      nickName: 'Vizards',
    };
    const res = await app.httpRequest()
      .post('/api/user/profile')
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .send(body)
      .expect('Content-Type', /json/)
      .expect(200);
    assert(res.body.code === 201);
    assert(res.body.data.length !== 0);
    assert(res.body.data.stuID === app.config.user.username);
  });

  it('should get course', async () => {
    const body = {
      year: app.config.user.year,
      semester: app.config.user.semester,
    };
    const res = await app.httpRequest()
      .post('/api/user/course')
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .send(body)
      .expect('Content-Type', /json/)
      .expect(200);
    assert(res.body.code === 201);
    assert(res.body.data.length !== 0);
    assert(res.body.data[0].hasOwnProperty('courseName') === true);
  });

  it('should get exam', async () => {
    const body = {
      year: app.config.user.year,
      semester: app.config.user.semester,
    };
    const res = await app.httpRequest()
      .post('/api/user/exam')
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .send(body)
      .expect('Content-Type', /json/)
      .expect(200);
    assert(res.body.code === 201);
    assert(res.body.data.length === 4);
    assert(res.body.data[0][0].examType === 1);
  });

  it('should get semester grade', async () => {
    const body = {
      year: app.config.user.year,
      semester: app.config.user.semester,
    };
    const res = await app.httpRequest()
      .post('/api/user/grade')
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .send(body)
      .expect('Content-Type', /json/)
      .expect(200);
    assert(res.body.code === 201);
    assert(res.body.data.length !== 0);
    assert(res.body.data[0].hasOwnProperty('gpa') === true);
  });

  it('should get semester usual grade', async () => {
    const body = {
      year: app.config.user.year,
      semester: app.config.user.semester,
    };
    const res = await app.httpRequest()
      .post('/api/user/usualGrade')
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .send(body)
      .expect('Content-Type', /json/)
      .expect(200);
    assert(res.body.code === 201);
    assert(res.body.data.length !== 0);
    assert(res.body.data[0].hasOwnProperty('grade') === true);
  });

  it('should get all grade', async () => {
    const res = await app.httpRequest()
      .get('/api/user/grade')
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .expect('Content-Type', /json/)
      .expect(200);
    assert(res.body.code === 200);
    assert(res.body.data.length !== 0);
    assert(res.body.data[0].hasOwnProperty('final') === true);
  });

  it('should get GPA', async () => {
    const res = await app.httpRequest()
      .get('/api/user/gpa')
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .expect('Content-Type', /json/)
      .expect(200);
    assert(res.body.code === 200);
    assert(res.body.data[0].year === 0);
    assert(res.body.data[0].semester === 0);
    assert(res.body.data[0].hasOwnProperty('gpa') === true);
  });

  it('should exit', async () => {
    const res = await app.httpRequest()
      .post('/api/user/exit')
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .expect('Content-Type', /json/)
      .expect(200);
    assert(res.body.code === 201);
    assert(res.body.data === '已成功退出统一身份认证系统');
  });

});
