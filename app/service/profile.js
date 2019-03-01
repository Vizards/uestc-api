'use strict';

const Service = require('egg').Service;
const request = require('request-promise-native').defaults({ simple: false, resolveWithFullResponse: true });
const profileUrl = 'http://eams.uestc.edu.cn/eams/stdDetail.action';

class ProfileService extends Service {
  async queryProfile() {
    const { ctx } = this;
    const username = ctx.locals.user.data.username;
    const query = ctx.model.User.findOne({ username });
    await query.select('avatarUrl nickName bio');
    const data = await query.exec();
    return {
      avatarUrl: data._doc.avatarUrl,
      nickName: data._doc.nickName,
      bio: data._doc.bio,
    };
  }

  async set(payload) {
    const { ctx } = this;
    const username = ctx.locals.user.data.username;
    await this.ctx.model.User.updateOne({ username }, Object.assign(payload, { updatedAt: Date.now() }));
    return await this.get();
  }

  async get() {
    const { ctx } = this;
    const finalCookies = ctx.helper.generateCookieString(ctx, [
      'iPlanetDirectoryPro',
      'JSESSIONID',
      'sto-id-20480',
    ]);
    const options = await ctx.helper.options(profileUrl, 'GET', finalCookies);
    try {
      const res = await request(options);
      const profile = await this.queryProfile();
      const parsedProfile = await ctx.service.parser.parseProfile(res.body);
      return Object.assign(profile, parsedProfile);
    } catch (err) {
      ctx.throw(403, '拉取学籍信息失败');
    }
  }
}

module.exports = ProfileService;
