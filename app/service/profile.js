'use strict';

const Service = require('egg').Service;
const request = require('request-promise-native').defaults({ simple: false, resolveWithFullResponse: true });
const profileUrl = 'http://eams.uestc.edu.cn/eams/stdDetail.action';

class ProfileService extends Service {
  async get() {
    const { ctx } = this;
    const options = await ctx.helper.options(profileUrl, 'GET', ctx.locals.user.data.cookies);
    try {
      const res = await request(options);
      return await ctx.service.parser.parseProfile(res.body);
    } catch (err) {
      ctx.throw(403, '个人信息获取失败');
    }
  }
}

module.exports = ProfileService;
