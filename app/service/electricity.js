'use strict';

const Service = require('egg').Service;
const request = require('request-promise-native').defaults({ simple: false, resolveWithFullResponse: true });
const bindRoomUrl = 'https://api.bionictech.cn/school/h5/electricity/bindRoom.action';
const getElectricityUrl = 'https://api.bionictech.cn/school/h5/electricity/getElectricityFeeBalance.action';

class electricityService extends Service {
  // 从数据库获取 sid
  async getSid() {
    const { ctx } = this;
    const username = ctx.locals.user.data.username;
    const query = ctx.model.Xifu.findOne({ username });
    await query.select('sid');
    const data = await query.exec();
    return data.sid;
  }

  async getElectricityFeeBalance(sid, type) {
    const { ctx } = this;
    const options = {
      url: getElectricityUrl,
      method: 'GET',
      headers: {
        Cookie: sid,
      },
    };
    try {
      const response = await request(options);
      if (JSON.parse(response.body).retcode === '000000') {
        return type === 'bind' ? Promise.resolve(response.headers['set-cookie'][0]) : Promise.resolve(JSON.parse(response.body).data);
      }
      return ctx.throw(403, JSON.parse(response.body).retmsg);
    } catch (err) {
      return Promise.reject(err);
    }
  }

  async bindRoom(payload, sid, JSESSIONID) {
    const { ctx } = this;
    const options = {
      url: bindRoomUrl,
      method: 'POST',
      form: {
        room: payload.room,
      },
      headers: {
        Cookie: `${sid};${JSESSIONID}`,
      },
    };

    try {
      const response = await request(options);
      if (JSON.parse(response.body).retcode === '000000') {
        return Promise.resolve(sid);
      }
      return ctx.throw(403, JSON.parse(response.body).retmsg);
    } catch (err) {
      return Promise.reject(err);
    }
  }

  async query(payload) {
    const { ctx } = this;
    try {
      const sid = await this.getSid();
      const JSESSIONID = await this.getElectricityFeeBalance(sid, 'bind');
      if (payload.room === '') {
        return await this.getElectricityFeeBalance(sid, 'get');
      }
      const bindRoom = await this.bindRoom(payload, sid, JSESSIONID);
      return await this.getElectricityFeeBalance(bindRoom, 'get');
    } catch (err) {
      ctx.throw(err);
    }
  }
}

module.exports = electricityService;
