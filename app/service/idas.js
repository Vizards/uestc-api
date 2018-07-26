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
  async getRedirectUrl(params, payload, captcha) {
    const option = await this.ctx.helper.options(loginUrl, 'POST', params.Cookies1, _.extend(_.omit(params, 'Cookies1'), payload, captcha, { rememberMe: 'on' }));
    const res = await request(option);
    if (res.body.includes('您提供的用户名或者密码有误')) {
      return this.ctx.throw(403, '您提供的用户名或者密码有误');
    }
    if (res.headers.location === undefined || res.headers['set-cookie'].length !== 3) {
      return false;
    }
    return Promise.resolve({ redirectUrl: res.headers.location, redirectCookies1: res.headers['set-cookie'][1], redirectCookies2: res.headers['set-cookie'][2] });
  }

  // 目标地址
  async genCookies(redirectParams) {
    const option = await this.ctx.helper.options(redirectParams.redirectUrl, 'GET', `semester.id=183;JSESSIONID=00000000000000000;sto-id-20480=JGKEMFNOECBP;${redirectParams.redirectCookies1}`);
    try {
      const res = await request(option);
      return Promise.resolve({ finalCookies: `semester.id=183;${res.headers['set-cookie'][1]};${res.headers['set-cookie'][0]};${redirectParams.redirectCookies1};${redirectParams.redirectCookies2}` });
    } catch (err) {
      return this.ctx.throw(403, '统一身份认证系统报告了一个错误');
    }
  }

  // 登录
  async login(payload) {
    const { ctx } = this;
    // 这里是进行验证码错误自动重试
    let success = false;
    let redirectParams = null;
    try {
      while (success === false) {
        const params = await this.getParams();
        const captchaText = await ctx.service.captcha.identify(params.Cookies1, payload.username);
        redirectParams = await this.getRedirectUrl(params, payload, { captchaResponse: captchaText });
        if (redirectParams) {
          success = true;
          break;
        }
      }
      return await this.genCookies(redirectParams);
    } catch (err) {
      ctx.throw(err);
    }
  }
}

module.exports = IdasService;
