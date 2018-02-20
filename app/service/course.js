'use strict';

/**
 * @desc 按学年学期获取课程表数据
 * @param year [string] '2017-2018' = '2017'
 * @param semester [string] '1' or '2'
 * @type {Service}
 */

const Service = require('egg').Service;
const request = require('request-promise-native').defaults({ simple: false, resolveWithFullResponse: true });
const courseUrl = 'http://eams.uestc.edu.cn/eams/';

class courseService extends Service {

  async getIds(finalCookies) {
    const option = await this.ctx.helper.options(`${courseUrl}courseTableForStd.action`, 'GET', finalCookies);
    try {
      const res = await request(option);
      return Promise.resolve(res.body.match(/ids.*\)/)[0].match(/\d+/)[0]);
    } catch (err) {
      return this.ctx.throw(403, '课程数据获取失败');
    }
  }

  async getCourseTable(ids, semesterId, finalCookies) {
    const { ctx, service } = this;
    const option = await ctx.helper.options(
      `${courseUrl}courseTableForStd!courseTable.action`,
      'POST',
      `${finalCookies};semester.id=${semesterId}`,
      {
        ignoreHead: 1,
        'setting.kind': 'std',
        startWeek: 1,
        'semester.id': semesterId,
        ids,
      }
    );
    try {
      const res = await request(option);
      return Promise.resolve(service.parser.parseCourseData(res.body));
    } catch (err) {
      return ctx.throw(403, '课程数据解析失败');
    }
  }

  async getCourse(payload) {
    const { ctx, service } = this;
    try {
      const finalCookies = ctx.locals.user.data.cookies;
      const ids = await this.getIds(finalCookies);
      const semesterId = await service.semester.getSemesterId(payload, finalCookies);
      return await this.getCourseTable(ids, semesterId, finalCookies);
    } catch (err) {
      ctx.throw(err);
    }
  }
}

module.exports = courseService;
