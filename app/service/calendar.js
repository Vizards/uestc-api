'use strict';

/**
 * @desc 按学年学期获取校历
 * @param year [string] '2017-2018' = '2017'
 * @param semester [string] '1' or '2'
 * @type {Service}
 */

const Service = require('egg').Service;
const fs = require('fs');

class calendarService extends Service {
  async get(payload) {
    const { ctx } = this;
    const calendarJson = await fs.readFileSync('app/public/calendar.json');
    const calendarData = JSON.parse(calendarJson);

    try {
      return calendarData[payload.year][payload.semester];
    } catch (e) {
      return ctx.throw(403, '获取校历信息失败');
    }
  }
}

module.exports = calendarService;
