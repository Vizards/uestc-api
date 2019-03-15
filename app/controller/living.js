'use strict';

const Controller = require('egg').Controller;

class livingController extends Controller {
  constructor(ctx) {
    super(ctx);

    this.electricityTransfer = {
      room: { type: 'string', required: true, allowEmpty: true, format: /^[0-9]{6}$/ },
    };

    this.billTransfer = {
      day: { type: 'enum', required: true, allowEmpty: false, values: [ 7, 30, 90, 180 ] },
      type: { type: 'enum', required: true, allowEmpty: false, values: [ 'all', 'cost', 'charge', 'electricity' ] },
    };
  }

  // 查询一卡通信息
  async ecard() {
    const { ctx, service } = this;
    const res = await service.ecard.query();
    ctx.helper.getSuccess({ ctx, res });
  }

  // 一卡通挂失
  async loss() {
    const { ctx, service } = this;
    const res = await service.loss.claim();
    ctx.helper.postSuccess({ ctx, res });
  }

  // 查询交易流水
  async bill() {
    const { ctx, service } = this;
    ctx.validate(this.billTransfer);
    const payload = ctx.request.body || {};
    const res = await service.bill.query(payload);
    ctx.helper.postSuccess({ ctx, res });
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
