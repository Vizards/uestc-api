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
      room: { type: 'string', required: true, allowEmpty: false, format: /^[0-9]{6}$/ },
    };

    this.subscribeTransfer = {
      type: { type: 'enum', required: true, allowEmpty: false, values: [ 'ecard', 'electricity' ] },
      limit: { type: 'number', required: true, allowEmpty: false },
      platform: { type: 'enum', required: true, allowEmpty: false, values: [ 'ios', 'android' ] },
      registration_id: { type: 'string', required: true, allowEmpty: false },
    };

    this.unSubscribeTransfer = {
      type: { type: 'enum', required: true, allowEmpty: false, values: [ 'ecard', 'electricity' ] },
    };

    this.cronTransfer = {
      sid: { type: 'string', required: true, allowEmpty: false },
      type: { type: 'enum', required: true, allowEmpty: false, values: [ 'ecard', 'electricity' ] },
      limit: { type: 'string', required: true, allowEmpty: false },
      platform: { type: 'enum', required: true, allowEmpty: false, values: [ 'ios', 'android' ] },
      registration_id: { type: 'string', required: true, allowEmpty: false },
      username: { type: 'string', required: true, allowEmpty: false, format: /^[0-9]{13}$/ },
      cronMasterKey: { type: 'string', required: true, allowEmpty: false },
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

  // 设置余额监控
  async subscribe() {
    const { ctx, service } = this;
    ctx.validate(this.subscribeTransfer);
    const payload = ctx.request.body || {};
    const res = await service.subscribe.initialize(payload);
    ctx.helper.postSuccess({ ctx, res });
  }

  // 取消余额监控
  async unsubscribe() {
    const { ctx, service } = this;
    ctx.validate(this.unSubscribeTransfer);
    const payload = ctx.request.body || {};
    const res = await service.subscribe.cancel(payload);
    ctx.helper.postSuccess({ ctx, res });
  }

  // 定时任务接口
  async cron() {
    const { ctx, service } = this;
    ctx.validate(this.cronTransfer);
    const payload = ctx.request.body || {};
    const res = await service.cron.run(payload);
    ctx.helper.postSuccess({ ctx, res });
  }
}

module.exports = xiFuController;
