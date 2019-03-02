'use strict';

const Service = require('egg').Service;

class devService extends Service {
  async idas(payload) {
    const data = await this.ctx.service.idas.login(payload);
    return JSON.parse(data.finalCookies);
  }

  async ecard(payload) {
    const { ctx } = this;
    const data = await ctx.service.idas.login(payload);
    return await ctx.service.ecard.cookies(data.finalCookies);
  }
}

module.exports = devService;
