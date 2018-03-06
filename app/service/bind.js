'use strict';

const Service = require('egg').Service;
const request = require('request-promise-native').defaults({ simple: false, resolveWithFullResponse: true });
const xiFuLoginUrl = 'https://api.bionictech.cn/app/v4/login';

class bindService extends Service {

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
    const { ctx } = this;
    const _User = await ctx.AV.Object.createWithoutData('_User', ctx.locals.user.data.objectId);
    let Xifu = await new ctx.AV.Query('Xifu');
    await Xifu.equalTo('username', ctx.locals.user.data.username);
    const user = await Xifu.find({}).then(data => { return data; });
    if (user.length === 0) {
      // 创建用户
      Xifu = await ctx.AV.Object.extend('Xifu');
      const query = new Xifu();
      await query.set('username', ctx.locals.user.data.username);
      await query.set('sid', cookies);
      await query.set('dependent', _User);
      await query.set();
      await query.save();
      return `已将喜付账号与学号 ${ctx.locals.user.data.username} 绑定`;
    }
    // 更新用户 sid
    await user[0].set('sid', cookies);
    await user[0].set('dependent', _User);
    await user[0].save();
    return `已更新学号 ${ctx.locals.user.data.username} 的喜付账户`;
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
