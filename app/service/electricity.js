'use strict';

const Service = require('egg').Service;
const request = require('request-promise-native').defaults({ simple: false, resolveWithFullResponse: true });
const getElectricityUrl = 'http://wx.uestc.edu.cn/oneCartoon/list';

class electricityService extends Service {
  async getElectricityInfo(roomCode) {
    const option = await this.ctx.helper.options(
      getElectricityUrl,
      'POST',
      null,
      { roomCode }
    );

    try {
      const res = await request(option);
      return JSON.parse(res.body).data;
    } catch (e) {
      return this.ctx.throw(403, e);
    }
  }

  async query(payload) {
    const { ctx } = this;
    try {
      return await this.getElectricityInfo(payload.room);
    } catch (err) {
      ctx.throw(err);
    }
  }
}

module.exports = electricityService;
