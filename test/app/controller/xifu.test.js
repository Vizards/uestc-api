'use strict';

const { app, assert } = require('egg-mock/bootstrap');
let token = '';

describe('test/app/controller/xifu.test.js', () => {
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

  it('should bind', async () => {
    const body = {
      mobile: app.config.xifu.mobile,
      password: app.config.xifu.password,
    };
    const res = await app.httpRequest()
      .post('/api/xifu/bind')
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .send(body)
      .expect('Content-Type', /json/)
      .expect(200);
    assert(res.body.code === 201);
    assert(res.body.data === `已更新学号 ${app.config.user.username} 的喜付账户` || `已将喜付账号与学号 ${app.config.user.username} 绑定`);
  });

  it('should set subscription', async () => {
    const body = {
      type: 'ecard',
      limit: 10,
      platform: 'ios',
      registration_id: '123123123123',
    };
    const res = await app.httpRequest()
      .post('/api/xifu/subscribe')
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .send(body)
      .expect('Content-Type', /json/)
      .expect(200);
    assert(res.body.code === 201);
    assert(res.body.data === '成功添加了定时任务');
  });

  it('should get ecard info', async () => {
    const res = await app.httpRequest()
      .get('/api/xifu/ecard')
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .expect('Content-Type', /json/)
      .expect(200);
    assert(res.body.code === 200);
    assert(res.body.data.student_no === app.config.user.username);
  });

  it('should get bill', async () => {
    const res = await app.httpRequest()
      .get('/api/xifu/bill')
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .expect('Content-Type', /json/)
      .expect(200);
    assert(res.body.code === 200);
    assert(res.body.data.total_consume.match(/^[0-9]+(.[0-9]{2})?$/)[1] !== undefined);
  });

  it('should cancel subscription', async () => {
    const body = {
      type: 'ecard',
    };
    const res = await app.httpRequest()
      .post('/api/xifu/unsubscribe')
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .send(body)
      .expect('Content-Type', /json/)
      .expect(200);
    assert(res.body.code === 201);
    assert(res.body.data === '成功取消了定时任务');
  });

  it('should get electricity with room_id', async () => {
    const body = { room: app.config.xifu.roomId };
    const res = await app.httpRequest()
      .post('/api/xifu/electricity')
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .send(body)
      .expect('Content-Type', /json/)
      .expect(200);
    assert(res.body.code === 201);
    assert(res.body.data.room === app.config.xifu.roomId);
  });

  it('should get electricity without room_id', async () => {
    const body = { room: '' };
    const res = await app.httpRequest()
      .post('/api/xifu/electricity')
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .send(body)
      .expect('Content-Type', /json/)
      .expect(200);
    assert(res.body.code === 201);
    assert(res.body.data.room === app.config.xifu.roomId);
  });
});
