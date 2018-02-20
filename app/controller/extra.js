'use strict';

const Controller = require('egg').Controller;

class ExtraController extends Controller {
  async traffic() {
    const { ctx, service } = this;
    const res = await service.traffic.get();
    ctx.helper.htmlSuccess({ ctx, res });
  }

  async notification() {
    const { ctx } = this;
    ctx.status = 302;
    ctx.redirect('http://wx.jwc.uestc.edu.cn/wx/SchAbout!findNewsInfo.action?partId=37,62,4028811d56bccc720156bcf9a16f0004,4028811d5688c21501568db010930007');
  }

  async dept() {
    const { ctx } = this;
    ctx.status = 302;
    ctx.redirect('http://wx.jwc.uestc.edu.cn/wx/SchAbout!findWxInfo.action?t=104');
  }

  async contact() {
    const { ctx } = this;
    ctx.status = 302;
    ctx.redirect('http://wx.jwc.uestc.edu.cn/wx/SchAbout!getWxInfo.action?t=103');
  }
}

module.exports = ExtraController;

