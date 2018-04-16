'use strict';

const Controller = require('egg').Controller;

class HomeController extends Controller {
  async index() {
    const { ctx } = this;
    if (ctx.acceptJSON) {
      ctx.helper.getSuccess({ ctx, res: 'hi, uestc' });
    } else {
      const result = await ctx.curl('https://o9wj5x8i4.qnssl.com/uestc.ga/index.html');
      ctx.status = result.status;
      ctx.set(result.headers);
      ctx.body = result.data;
    }
  }
}

module.exports = HomeController;
