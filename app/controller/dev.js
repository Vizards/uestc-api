'use strict';

const Controller = require('egg').Controller;

class DevController extends Controller {
  constructor(ctx) {
    super(ctx);
    this.UserLoginTransfer = {
      username: { type: 'string', required: true, allowEmpty: false, format: /^[0-9]{13}$/ },
      password: { type: 'password', required: true, allowEmpty: false, min: 6 },
    };
  }

  // 登录教务系统，返回 cookies
  async idas() {
    const { ctx, service } = this;
    ctx.validate(this.UserLoginTransfer);
    const payload = ctx.request.body || {};
    const res = await service.dev.idas(payload);
    ctx.helper.postSuccess({ ctx, res });
  }

  // 登录一卡通网站，返回 cookies
  async ecard() {
    const { ctx, service } = this;
    ctx.validate(this.UserLoginTransfer);
    const payload = ctx.request.body || {};
    const res = await service.dev.ecard(payload);
    ctx.helper.postSuccess({ ctx, res });
  }
}

module.exports = DevController;
