'use strict';

const { app, assert } = require('egg-mock/bootstrap');
let token = '';

describe('test/app/controller/living.test.js', () => {
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

  it('should get ecard info', async () => {
    const res = await app.httpRequest()
      .get('/api/living/ecard')
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .expect('Content-Type', /json/)
      .expect(200);
    assert(res.body.code === 200);
    assert(res.body.data.id.toString().length === 6);
    assert(res.body.data.hasOwnProperty('status') === true);
  });

  it('report the loss of ecard', async () => {
    const res = await app.httpRequest()
      .post('/api/living/loss')
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .expect('Content-Type', /json/)
      .expect(200);
    assert(res.body.code === 201);
    assert(res.body.data.retcode === 0 || res.body.data.retcode === 100 || res.body.data.retcode === 110 || res.body.data.retcode === 120);
    assert(res.body.data.hasOwnProperty('retmsg') === true);
  });

  it('should get specified bill', async () => {
    const body = {
      day: 180,
      type: 'cost',
    };
    const res = await app.httpRequest()
      .post('/api/living/bill')
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .send(body)
      .expect('Content-Type', /json/)
      .expect(200);
    assert(res.body.code === 201);
    assert(res.body.data.hasOwnProperty('total_cost') === true);
    assert(res.body.data.hasOwnProperty('total_charge') === true);
  });

  it('should get electricity with room_id', async () => {
    const body = { room: app.config.living.roomId };
    const res = await app.httpRequest()
      .post('/api/living/electricity')
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .send(body)
      .expect('Content-Type', /json/)
      .expect(200);
    assert(res.body.code === 201);
    assert(res.body.data.roomName === app.config.living.roomId);
  });
});
