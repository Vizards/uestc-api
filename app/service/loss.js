'use strict';

/**
 * @name loss.js
 * @desc 一卡通挂失
 */

const Service = require('egg').Service;
const request = require('request-promise-native').defaults({ simple: false, resolveWithFullResponse: true });
const claimUrl = 'http://ecard.uestc.edu.cn/web/guest/personal?p_p_id=cardInfo_WAR_ecardportlet&p_p_lifecycle=2&p_p_state=normal&p_p_mode=view&p_p_resource_id=loseCard&p_p_cacheability=cacheLevelPage&p_p_col_id=column-2&p_p_col_count=1';

class lossService extends Service {
  async getECardInfo() {
    const { ctx } = this;
    try {
      const finalCookies = ctx.helper.generateCookieString(ctx, [
        'CASTGC',
        'route',
        'JSESSIONID',
      ]);
      const ecardCookies = await ctx.service.ecard.getCookies();
      const ticketInfo = await ctx.service.ecard.getTicketInfo(finalCookies);
      await ctx.service.ecard.casLogin(ticketInfo, ecardCookies);
      const cookies = await ctx.service.ecard.login(ticketInfo, ecardCookies);
      const personalInfo = await ctx.service.ecard.getPersonalInfo(cookies);
      const cookieString = ctx.helper.generateCookieString(ctx, undefined, JSON.stringify(cookies));
      return { cookies: cookieString, id: personalInfo.id };
    } catch (e) {
      return ctx.throw(403, '获取一卡通信息失败');
    }
  }

  async claim() {
    const { ctx } = this;
    try {
      const eCardInfo = await this.getECardInfo();
      const option = await ctx.helper.options(
        claimUrl,
        'POST',
        eCardInfo.cookies,
        { _cardInfo_WAR_ecardportlet_cardno: eCardInfo.id }
      );
      const res = await request(option);
      const data = JSON.parse(res.body);
      if (data.retcode === 120) { data.retmsg = '挂失失败，挂失服务没有启动'; }
      if (data.retcode === 100 || data.retcode === 110) { data.retmsg = '该卡已经挂失或注销，请到卡务中心或线下圈存机处理'; }
      if (data.retcode === 0) { data.retmsg = '挂失成功'; }
      return data;
    } catch (e) {
      return ctx.throw(403, '挂失接口未按预期工作');
    }
  }
}

module.exports = lossService;
