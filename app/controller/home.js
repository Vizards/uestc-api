'use strict';

const Controller = require('egg').Controller;

class HomeController extends Controller {
  async index() {
    const { ctx } = this;
    if (ctx.acceptJSON) {
      ctx.helper.getSuccess({ ctx, res: 'hi, uestc' });
    } else {
      ctx.body = 'hi, uestc';
    }
  }
}

module.exports = HomeController;
