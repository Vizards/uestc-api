'use strict';

/**
 * @desc 解析学期代码
 * @extends Service.course
 * @type {Service}
 */

const Service = require('egg').Service;
const request = require('request-promise-native').defaults({ simple: false, resolveWithFullResponse: true });
const courseUrl = 'http://eams.uestc.edu.cn/eams/';

class semesterService extends Service {
  async getId(payload, finalCookies) {
    const option = await this.ctx.helper.options(
      `${courseUrl}dataQuery.action`,
      'POST',
      `semester.id=183;${finalCookies}`,
      {
        tagId: 'semesterBar00000000000Semester',
        dataType: 'semesterCalendar',
        value: 183, // 仅做获取用，可在已有学期 code 范围内随意取值
        empty: false,
      }
    );

    try {
      const res = await request(option);
      const Obj = {};
      // 迫不得已，只能用 eval 解析
      /* eslint-disable */
      Object.values(eval('(' + res.body + ')').semesters).forEach(item => {
        /* eslint-enable */
        // 处理一个学年内只发布了第一个学期课程 semester_id 的情况
        item.length === 2 ? Object.assign(Obj, { [item[0].schoolYear.substr(0, 4)]: { [item[0].name]: item[0].id, [item[1].name]: item[1].id } }) : Object.assign(Obj, { [item[0].schoolYear.substr(0, 4)]: { [item[0].name]: item[0].id } });
      });
      return Promise.resolve(Obj[payload.year][payload.semester]);
    } catch (err) {
      return this.ctx.throw(403, '获取学期信息对应表失败');
    }
  }

  async getSemesterId(payload, finalCookies) {
    const { ctx } = this;
    try {
      return await this.getId(payload, finalCookies);
    } catch (err) {
      ctx.throw(err);
    }
  }
}

module.exports = semesterService;
