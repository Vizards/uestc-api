'use strict';

const Service = require('egg').Service;
const request = require('request-promise-native').defaults({ simple: false, resolveWithFullResponse: true });
const profileUrl = 'http://eams.uestc.edu.cn/eams/stdDetail.action';

class ProfileService extends Service {
  async getAvatar() {
    const { ctx } = this;
    const username = ctx.locals.user.data.username;
    const query = ctx.model.User.findOne({ username });
    await query.select('avatar');
    const data = await query.exec();
    return data.avatar;
  }

  async setAvatar(avatar) {
    const { ctx } = this;
    const username = ctx.locals.user.data.username;
    await this.ctx.model.User.updateOne({ username }, { updatedAt: Date.now(), avatar: avatar.url });
    return 'set success';
  }

  async get() {
    const { ctx } = this;
    const options = await ctx.helper.options(profileUrl, 'GET', ctx.locals.user.data.cookies);
    try {
      const res = await request(options);
      const avatar = await this.getAvatar();
      const profile = await ctx.service.parser.parseProfile(res.body);
      return Object.assign(profile, { avatar: avatar ? avatar : '未设置' });
    } catch (err) {
      ctx.throw(403, '个人信息获取失败');
    }
  }
}

module.exports = ProfileService;
