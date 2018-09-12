'use strict';

const Controller = require('egg').Controller;

class xiFuController extends Controller {
  constructor(ctx) {
    super(ctx);

    this.xifuTransfer = {
      mobile: { type: 'string', required: true, allowEmpty: false, format: /^[0-9]{11}$/ },
      password: { type: 'password', required: true, allowEmpty: false, min: 6 },
    };

    this.electricityTransfer = {
      room: { type: 'string', required: true, allowEmpty: true, format: /^[0-9]{6}$/ },
    };
  }

  // 绑定喜付账号
  async bindXiFu() {
    const { ctx, service } = this;
    ctx.validate(this.xifuTransfer);
    const payload = ctx.request.body || {};
    const res = await service.bind.xiFu(payload);
    ctx.helper.postSuccess({ ctx, res });
  }

  // 查询一卡通信息
  async ecard() {
    const { ctx, service } = this;
    const res = await service.ecard.query('ecard');
    ctx.helper.getSuccess({ ctx, res });
  }

  // 查询交易流水
  async bill() {
    const { ctx, service } = this;
    const res = await service.ecard.query('bill');
    ctx.helper.getSuccess({ ctx, res });
  }

  // 查询电费
  async electricity() {
    const { ctx, service } = this;
    ctx.validate(this.electricityTransfer);
    const payload = ctx.request.body || {};
    const res = await service.electricity.query(payload);
    ctx.helper.postSuccess({ ctx, res });
  }
}

module.exports = xiFuController;
