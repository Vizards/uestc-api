'use strict';

const Service = require('egg').Service;
const request = require('request-promise-native').defaults({ simple: false, resolveWithFullResponse: true });
const ecardIndexUrl = 'http://ecard.uestc.edu.cn';
const unionAuthUrl = 'http://idas.uestc.edu.cn/authserver/login?service=http%3A%2F%2Fecard.uestc.edu.cn%2Fcaslogin.jsp';
const ecardLoginUrl = 'http://ecard.uestc.edu.cn/c/portal/login';
const ecardPersonalUrl = 'http://ecard.uestc.edu.cn/c/portal/render_portlet?p_l_id=10570&p_p_id=cardInfo_WAR_ecardportlet&p_p_lifecycle=0&p_t_lifecycle=0&p_p_state=normal&p_p_mode=view&p_p_col_id=null&p_p_col_pos=null&p_p_col_count=null&p_p_isolated=1&currentURL=%2Fweb%2Fguest%2Fpersonal';

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

  // 一卡通登录需要提前访问这两个域名，否则在后续的 login 过程中无法获取新的 JSESSIONID
  async casLogin(ticketInfo, ecardCookies) {
    const cookies = `${ecardCookies.join(';')};${ticketInfo.setCookie.join(';')}`;
    const options = await this.ctx.helper.options(ticketInfo.url, 'GET', cookies);
    try {
      const res = await request(options);
      const options1 = await this.ctx.helper.options(res.headers.location, 'GET', cookies);
      return await request(options1);
    } catch (err) {
      return this.ctx.throw(403, 'casLogin 失败');
    }
  }

  async login(ticketInfo, ecardCookies) {
    const cookies = `${ecardCookies.join(';')};${ticketInfo.setCookie.join(';')}`;
    const option = await this.ctx.helper.options(ecardLoginUrl, 'GET', cookies);
    try {
      const res = await request(option);
      if (res.headers['set-cookie'][0].includes('JSESSIONID')) {
        // 获取到更新后的 JSESSIONID 并加入 ecardCookies;
        const parsedEcardCookies = await this.ctx.helper.parseCookies(ecardCookies);
        const parsedNewEcardCookies = await this.ctx.helper.parseCookies(res.headers['set-cookie']);
        const parsedTicketInfoCookies = await this.ctx.helper.parseCookies(ticketInfo.setCookie);
        return Object.assign(parsedEcardCookies, parsedNewEcardCookies, parsedTicketInfoCookies);
      }
      return this.ctx.throw(403, '一卡通网站登录过程中未按预期更新 cookie');
    } catch (err) {
      return this.ctx.throw(403, '登录一卡通网站失败');
    }
  }

  async balance() {
    const payload = { day: 180, type: 'cost' };
    const billData = await this.ctx.service.bill.query(payload);
    if (billData.history[0]) {
      return billData.history[0].balance;
    }
    return '180 天内没有消费，无法计算余额';
  }

  async getPersonalInfo(cookies) {
    cookies = await this.ctx.helper.generateCookieString(this.ctx, undefined, JSON.stringify(cookies));
    const option = await this.ctx.helper.options(ecardPersonalUrl, 'POST', cookies);
    try {
      const res = await request(option);
      const data = this.ctx.service.parser.parseECardInfo(res.body);
      data.balance = await this.balance();
      return data;
    } catch (e) {
      return this.ctx.throw(403, '获取一卡通个人信息失败');
    }
  }

  async cookies(cookies) {
    const { ctx } = this;
    try {
      const finalCookies = ctx.helper.generateCookieString(ctx, [
        'CASTGC',
        'route',
        'JSESSIONID',
      ], cookies);
      const ecardCookies = await this.getCookies();
      const ticketInfo = await this.getTicketInfo(finalCookies);
      await this.casLogin(ticketInfo, ecardCookies);
      return await this.login(ticketInfo, ecardCookies);
    } catch (err) {
      return ctx.throw(403, err);
    }
  }

  async query() {
    const { ctx } = this;
    try {
      const finalCookies = ctx.helper.generateCookieString(ctx, [
        'CASTGC',
        'route',
        'JSESSIONID',
      ]);
      const ecardCookies = await this.getCookies();
      const ticketInfo = await this.getTicketInfo(finalCookies);
      await this.casLogin(ticketInfo, ecardCookies);
      const cookies = await this.login(ticketInfo, ecardCookies);
      return await this.getPersonalInfo(cookies);
    } catch (err) {
      return ctx.throw(403, '查询一卡通信息失败');
    }
  }
}

module.exports = ecardService;
