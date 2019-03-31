'use strict';

const Service = require('egg').Service;
const request = require('request-promise-native').defaults({ simple: false, resolveWithFullResponse: true });
const exitUrl = 'http://idas.uestc.edu.cn/authserver/logout?service=/authserver/login';

class UserService extends Service {

  // 当前用户不存在时, 调用注册
  async databaseSignUpUser(payload, finalCookies) {
    return await this.ctx.model.User.create({
      username: payload.username,
      finalCookies: finalCookies.finalCookies,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  }

  // 用户存在时，更新数据库 Cookies
  async databaseUpdateUser(loggedUser, finalCookies) {
    return await this.ctx.model.User.updateOne({ username: loggedUser.username }, { updatedAt: Date.now(), finalCookies: finalCookies.finalCookies });
  }

  // 尝试登录教务系统，判断当前用户是否已经存在
  async login(payload) {
    const { ctx, service } = this;
    const finalCookies = await ctx.service.idas.login(payload);
    try {
      await this.databaseSignUpUser(payload, finalCookies);
      return { token: await service.actionToken.apply(payload.username) };
    } catch (err) {
      if (err.code === 11000) {
        await this.databaseUpdateUser(payload, finalCookies);
        return { token: await service.actionToken.apply(payload.username) };
      }
      return ctx.throw(err);
    }
  }

  async exit() {
    const { ctx } = this;
    const finalCookies = ctx.helper.generateCookieString(ctx, [
      'iPlanetDirectoryPro',
      'JSESSIONID',
      'sto-id-20480',
    ]);
    const options = await ctx.helper.options(exitUrl, 'GET', finalCookies);
    try {
      const res = await request(options);
      if (res.statusCode === 200 && res.body.includes('注销成功')) {
        return Promise.resolve('已成功退出统一身份认证系统');
      }
    } catch (err) {
      return ctx.throw(403, '退出教务系统失败');
    }
  }

  async delete(payload) {
    const { ctx } = this;
    try {
      const finalCookies = await ctx.service.idas.login(payload);
      await this.databaseUpdateUser(payload, finalCookies);
      // 稳妥起见，根据 finalCookies 去删除用户
      await ctx.model.User.remove({ finalCookies: finalCookies.finalCookies });
      // 根据用户名删除喜付用户
      await ctx.model.Xifu.remove({ username: payload.username });
      return `已删除账户 ${payload.username}`;
    } catch (err) {
      ctx.throw(err);
    }
  }
}

module.exports = UserService;
