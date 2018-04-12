'use strict';

const Controller = require('egg').Controller;
const path = require('path');
const fs = require('mz/fs');

class HomeController extends Controller {
  async index() {
    const { ctx } = this;
    if (ctx.acceptJSON) {
      ctx.helper.getSuccess({ ctx, res: 'hi, uestc' });
    } else {
      const file = path.join(this.app.config.static.dir, 'index.html');
      const res = await fs.readFile(file, 'utf-8');
      ctx.helper.htmlSuccess({ ctx, res });
    }
  }
}

module.exports = HomeController;
