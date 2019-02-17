'use strict';

const Controller = require('egg').Controller;

class HomeController extends Controller {
  constructor(ctx) {
    super(ctx);

    this.calendarTranser = {
      year: { type: 'string', required: true, allowEmpty: false, format: /^[0-9]{4}$/ },
      semester: { type: 'string', required: true, allowEmpty: false, format: /[1|2]$/ },
    };
  }

  async index() {
    const { ctx } = this;
    if (ctx.acceptJSON) {
      ctx.helper.getSuccess({ ctx, res: 'hi, uestc' });
    } else {
      const result = await ctx.curl('https://qiniu.vizards.cc/uestc.ga/index.html');
      ctx.status = result.status;
      ctx.set(result.headers);
      ctx.body = result.data;
    }
  }

  async calendar() {
    const { ctx, service } = this;
    ctx.validate(this.calendarTranser);
    const payload = ctx.request.body || {};
    const res = await service.calendar.get(payload);
    ctx.helper.postSuccess({ ctx, res });
  }
}

module.exports = HomeController;
