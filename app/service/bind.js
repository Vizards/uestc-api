'use strict';

const Service = require('egg').Service;
const request = require('request-promise-native').defaults({ simple: false, resolveWithFullResponse: true });
const xiFuLoginUrl = 'https://api.bionictech.cn/app/v4/login';

class bindService extends Service {

  // 当前喜付用户不存在时，调用注册
  async databaseSignUpXiFu(username, cookies) {
    return await this.ctx.model.Xifu.create({
      username,
      sid: cookies,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  }

  // 当前喜付用户存在时，更新 sid
  async databaseUpdateXiFu(username, cookies) {
    return await this.ctx.model.Xifu.updateOne({ username }, { updatedAt: Date.now(), sid: cookies });
  }

  // 登录喜付，成功返回 sid
  async xiFuLogin(payload) {
    const { ctx } = this;
    const options = {
      url: xiFuLoginUrl,
      method: 'POST',
      form: {
        mobile: payload.mobile,
        password: payload.password,
      },
    };
    try {
      const response = await request(options);
      if (JSON.parse(response.body).retcode === '0000') {
        return Promise.resolve(response.headers['set-cookie'][0]);
      }
      return ctx.throw(403, JSON.parse(response.body).retmsg);
    } catch (err) {
      return Promise.reject(err);
    }
  }

  // 将 sid 保存至数据库
  async saveData(cookies) {
    const username = this.ctx.locals.user.data.username;
    try {
      await this.databaseSignUpXiFu(username, cookies);
      return `已将喜付账号与学号 ${username} 绑定`;
    } catch (err) {
      if (err.code === 11000) {
        await this.databaseUpdateXiFu(username, cookies);
        return `已更新学号 ${username} 的喜付账户`;
      }
    }
  }

  async xiFu(payload) {
    const { ctx } = this;
    try {
      const cookies = await this.xiFuLogin(payload);
      return await this.saveData(cookies);
    } catch (err) {
      ctx.throw(err);
    }
  }
}

module.exports = bindService;
