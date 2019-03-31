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
      const option = await this.ctx.helper.options(loginUrl);
      const res = await request(option);
      const $ = await cheerio.load(res.body);
      // 前端加密密码的 aesKey，一般隐藏在 header 中，但是位置会发生变化，所以直接全局搜索吧
      const aesKey = res.body.match(/pwdDefaultEncryptSalt.*/)[0].split('"')[1];
      const names = await $('#casLoginForm > input').map((i, el) => {
        return $(el).attr('name');
      }).get();

      const values = await $('#casLoginForm > input').map((i, el) => {
        return $(el).attr('value');
      }).get();

      const formData = await _.object(names, values);
      return {
        formData,
        cookies: res.headers['set-cookie'],
        // 教务系统前端密码加密的 aesKey，必须传入
        aesKey,
      };
    } catch (err) {
      return this.ctx.throw(403, '暂时无法访问统一身份认证系统');
    }
  }

  // 获取重定向地址
  // async getRedirectUrl(params, payload, captcha) {
  async getRedirectUrl(params, payload) {
    // 处理验证码
    // const option = await this.ctx.helper.options(loginUrl, 'POST', params.Cookies1, _.extend(_.omit(params, 'Cookies1'), payload, captcha, { rememberMe: 'on' }));
    // 处理密码，仅在教务系统开启加密时使用
    payload.password = this.ctx.helper.encrypt(payload.password, params.aesKey);
    const option = await this.ctx.helper.options(loginUrl, 'POST', params.cookies.join(';'), _.extend(params.formData, payload, { rememberMe: 'on' }));
    const res = await request(option);
    if (res.body.includes('您提供的用户名或者密码有误')) {
      return this.ctx.throw(403, '您提供的用户名或者密码有误');
    }
    if (res.headers.location === undefined) {
      return false;
    }
    return {
      redirectUrl: res.headers.location,
      redirectCookies: res.headers['set-cookie'],
    };
  }

  async returnCookies(redirectParams, keywords, cookies) {
    const option = await this.ctx.helper.options(redirectParams.redirectUrl, 'GET', `semester.id=183;JSESSIONID=00000000000000000;sto-id-20480=J${keywords}KEMFNOECBP;${redirectParams.redirectCookies.join(';')}`);
    const res = await request(option);
    const cookiesArray = [
      'semester.id=183',
    ].concat(cookies).concat(redirectParams.redirectCookies).concat(res.headers['set-cookie']);

    const finalCookies = await this.ctx.helper.parseCookies(cookiesArray);
    return Promise.resolve({ finalCookies: JSON.stringify(finalCookies) });
  }

  // 目标地址
  async genCookies(redirectParams, cookies) {
    // JGKE or JHKE or JIKE
    try {
      return this.returnCookies(redirectParams, 'G', cookies);
    } catch (err) {
      try {
        return this.returnCookies(redirectParams, 'H', cookies);
      } catch (err) {
        try {
          return this.returnCookies(redirectParams, 'I', cookies);
        } catch (err) {
          return this.ctx.throw(403, '统一身份认证系统报告了一个错误');
        }
      }
    }
  }

  // 登录
  async login(payload) {
    const { ctx } = this;
    // 这里是进行验证码错误自动重试
    // let success = false;
    // let redirectParams = null;
    try {
      // while (success === false) {
      //   const params = await this.getParams();
      //   const captchaText = await ctx.service.captcha.identify(params.Cookies1, payload.username);
      //   redirectParams = await this.getRedirectUrl(params, payload, { captchaResponse: captchaText });
      //   if (redirectParams) {
      //     success = true;
      //     break;
      //   }
      // }
      const params = await this.getParams();
      const redirectParams = await this.getRedirectUrl(params, payload);
      return await this.genCookies(redirectParams, params.cookies);
    } catch (err) {
      ctx.throw(err);
    }
  }
}

module.exports = IdasService;
