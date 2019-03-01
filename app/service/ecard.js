'use strict';

const Service = require('egg').Service;
const request = require('request-promise-native').defaults({ simple: false, resolveWithFullResponse: true });
const ecardIndexUrl = 'http://ecard.uestc.edu.cn';
const unionAuthUrl = 'http://idas.uestc.edu.cn/authserver/login?service=http%3A%2F%2Fecard.uestc.edu.cn%2Fcaslogin.jsp';
const ecardLoginUrl = 'http://ecard.uestc.edu.cn/c/portal/login';

class ecardService extends Service {
  async getCookies() {
    const option = await this.ctx.helper.options(ecardIndexUrl, 'GET');
    try {
      const res = await request(option);
      if (res.headers['set-cookie'].length === 3) {
        return res.headers['set-cookie'];
      }
      return this.ctx.throw(403, '一卡通网站未按预期返回 set-cookie 值');
    } catch (err) {
      return this.ctx.throw(403, '访问一卡通网站出现错误');
    }
  }

  async getTicketInfo(finalCookies) {
    const option = await this.ctx.helper.options(unionAuthUrl, 'GET', finalCookies);
    try {
      const res = await request(option);
      if (res.headers.location.includes('ticket')) {
        return { url: res.headers.location, setCookie: res.headers['set-cookie'] };
      }
      return this.ctx.throw(403, '统一身份认证系统认证失败，请检查 token 是否过期并尝试重新登录');
    } catch (err) {
      return this.ctx.throw(403, '获取统一身份认证系统交换登录凭据失败');
    }
  }

  async login(ticketInfo, ecardCookies) {
    const option = await this.ctx.helper.options(ticketInfo.url, 'GET', `${ecardCookies};${ticketInfo.setCookie}`);
    try {
      const res = await request(option);
      return res.headers;
    } catch (err) {
      return this.ctx.throw(403, '登录一卡通网站失败');
    }
  }

  async query() {
    const { ctx } = this;
    try {
      const finalCookies = ctx.locals.user.data.cookies;
      const ecardCookies = await this.getCookies(finalCookies);
      const ticketInfo = await this.getTicketInfo(finalCookies);
      return await this.login(ticketInfo, ecardCookies);
    } catch (err) {
      ctx.throw(err);
    }
  }
}

module.exports = ecardService;
