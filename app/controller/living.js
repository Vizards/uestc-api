'use strict';

const Controller = require('egg').Controller;

class livingController extends Controller {
  constructor(ctx) {
    super(ctx);

    this.electricityTransfer = {
      room: { type: 'string', required: true, allowEmpty: true, format: /^[0-9]{6}$/ },
    };
  }

  // 查询一卡通信息
  async ecard() {
    const { ctx, service } = this;
    const res = await service.ecard.query();
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

module.exports = livingController;
