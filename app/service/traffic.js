'use strict';

const Service = require('egg').Service;
const request = require('request-promise-native').defaults({ simple: false, resolveWithFullResponse: true });
const url = 'http://bbs.uestc.edu.cn/bus';

class trafficService extends Service {

  static async requestHtml() {
    const { ctx } = this;
    const res = await request(url);
    if (res.statusCode === 200) {
      return Promise.resolve(res.body);
    }
    return ctx.throw(403, '无法访问清水河畔');
  }

  async handleHtml(html) {
    return html.replace('</head>', `<meta name="viewport" id="viewport" content="width=device-width, initial-scale=1"><link rel="stylesheet" href="//${this.ctx.request.hostname}:${this.app.config.cluster.listen.port}/public/bbs.css" /></head>`);
  }

  async get() {
    const html = await this.constructor.requestHtml();
    return await this.handleHtml(html);
  }
}

module.exports = trafficService;
