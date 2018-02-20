'use strict';

const Service = require('egg').Service;
const request = require('request-promise-native').defaults({ simple: false, resolveWithFullResponse: true });
const exitUrl = 'http://idas.uestc.edu.cn/authserver/logout?service=/authserver/login';

class UserService extends Service {

  // 当前用户不存在时, 调用注册
  static async databaseSignUp(payload, finalCookies, user) {
    await user.setUsername(payload.username);
    await user.setPassword(payload.password);
    await user.signUp(finalCookies);
  }

  // 用户存在时，更新数据库 Cookies
  static async databaseUpdateUser(loggedUser, finalCookies) {
    await loggedUser.set('finalCookies', finalCookies.finalCookies);
    return await loggedUser.save('finalCookies', finalCookies.finalCookies, { useMasterKey: true });
  }

  async genObjectId(payload) {
    const query = await new this.ctx.AV.Query('_User');
    await query.equalTo('username', payload.username);
    return await query.find({ useMasterKey: true }).then(todo => {
      return todo[0].get('objectId');
    });
  }

  // 尝试登录教务系统，判断当前用户是否已经存在
  async login(payload) {
    const { ctx, service } = this;
    const finalCookies = await ctx.service.idas.login(payload);
    const user = new ctx.AV.User();
    try {
      await this.constructor.databaseSignUp(payload, finalCookies, user);
      const objectId = await this.genObjectId(payload);
      return { token: await service.actionToken.apply(payload.username, objectId) };
    } catch (err) {
      if (err.code === 202) {
        const loggedUser = await ctx.AV.User.logIn(payload.username, payload.password);
        await this.constructor.databaseUpdateUser(loggedUser, finalCookies);
        const objectId = await this.genObjectId(payload);
        return { token: await service.actionToken.apply(payload.username, objectId) };
      }
      ctx.throw(err);
    }
  }

  async exit() {
    const { ctx } = this;
    const options = await ctx.helper.options(exitUrl, 'GET', ctx.locals.user.data.cookies);
    try {
      const res = await request(options);
      if (res.statusCode === 200 && res.body.includes('您已经成功退出统一身份认证系统')) {
        return Promise.resolve('已成功退出统一身份认证系统');
      }
    } catch (err) {
      return ctx.throw(403, '退出教务系统失败');
    }
  }

  async delete(payload) {
    const { ctx } = this;
    try {
      const user = await ctx.AV.User.logIn(payload.username, payload.password);
      const xifu = await new ctx.AV.Query('Xifu');
      await xifu.equalTo('username', payload.username);
      const queryResult = await xifu.find({}).then(data => {
        return data.length === 0 ? null : data[0];
      });
      if (queryResult !== null) await queryResult.destroy();
      await user.destroy({ useMasterKey: true });
      return `已删除账户 ${payload.username}`;
    } catch (err) {
      ctx.throw(err);
    }
  }
}

module.exports = UserService;
