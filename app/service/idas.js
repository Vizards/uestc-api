'use strict';

/**
 * @desc 登录统一身份认证系统，获取 Cookies
 * @param username [string] 学号
 * @param password [string] 密码
 * @type {Service}
 */

const Service = require('egg').Service;
const _ = require('underscore');
const request = require('request-promise-native').defaults({ simple: false, resolveWithFullResponse: true });
const cheerio = require('cheerio');
const loginUrl = 'http://idas.uestc.edu.cn/authserver/login?service=http://eams.uestc.edu.cn/eams/home.action';

class IdasService extends Service {
  // 获取登录参数和 Cookie
  async getParams() {
    try {
      const res = await request(loginUrl);
      const $ = await cheerio.load(res.body);
      const names = await $('#casLoginForm > input').map((i, el) => {
        return $(el).attr('name');
      }).get();

      const values = await $('#casLoginForm > input').map((i, el) => {
        return $(el).attr('value');
      }).get();

      const params = await _.object(names, values);
      return Promise.resolve(Object.assign(params, { Cookies1: `${res.headers['set-cookie'][0]};${res.headers['set-cookie'][1]}` }));
    } catch (err) {
      return this.ctx.throw(403, '暂时无法访问统一身份认证系统');
    }
  }

  // 获取重定向地址
  async getRedirectUrl(params, payload) {
    const option = await this.ctx.helper.options(loginUrl, 'POST', params.Cookies1, _.extend(_.omit(params, 'Cookies1'), payload, { rememberMe: 'on' }));
    try {
      const res = await request(option);
      return Promise.resolve({ redirectUrl: res.headers.location, redirectCookies: `${res.headers['set-cookie'][1]};${res.headers['set-cookie'][2]}` });
    } catch (err) {
      return this.ctx.throw(403, '统一身份认证系统鉴权失败');
    }
  }

  // 目标地址
  async genCookies(redirectParams) {
    const option = await this.ctx.helper.options(redirectParams.redirectUrl);
    try {
      const res = await request(option);
      return Promise.resolve({ finalCookies: `${res.headers['set-cookie'][1]};${res.headers['set-cookie'][0]};${redirectParams.redirectCookies}` });
    } catch (err) {
      return this.ctx.throw(403, '统一身份认证系统报告了一个错误');
    }
  }

  // 登录
  async login(payload) {
    const { ctx } = this;
    try {
      const params = await this.getParams();
      const redirectParams = await this.getRedirectUrl(params, payload);
      return await this.genCookies(redirectParams);
    } catch (err) {
      ctx.throw(err);
    }
  }
}

module.exports = IdasService;
