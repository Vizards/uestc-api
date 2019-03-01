'use strict';

/**
 * @desc 按学年学期获取考试数据
 * @param year [number] 2017-2018 = 2017
 * @param semester [number] 1 or 2
 * @type {Service}
 */

const Service = require('egg').Service;
const request = require('request-promise-native').defaults({ simple: false, resolveWithFullResponse: true });
const examUrl = 'http://eams.uestc.edu.cn/eams/stdExamTable';

class examService extends Service {

  async getSingleExam(finalCookies, semesterId, url) {
    const option = await this.ctx.helper.options(url, 'GET', `${finalCookies};semester.id=${semesterId}`);
    try {
      const res = await request(option);
      return Promise.resolve(res.body);
    } catch (err) {
      return this.ctx.throw(403, '获取学期成绩信息失败');
    }
  }

  async getSemesterExamData(finalCookies, semesterId) {
    const { service } = this;
    const semesterExamData = [];
    for (let examType = 1; examType < 5; examType++) {
      const url = `${examUrl}!examTable.action?examType.id=${examType}&semester.id=${semesterId}`;
      const resText = await this.getSingleExam(finalCookies, semesterId, url);
      const examData = await service.parser.parseExamData(resText);
      await semesterExamData.push(examData.map(data => {
        // 为考试信息添加考试类型字段
        return Object.assign(data, { examType });
      }));
    }
    return semesterExamData;
  }

  async getExam(payload) {
    const { ctx, service } = this;
    try {
      const finalCookies = ctx.helper.generateCookieString(ctx, [
        'iPlanetDirectoryPro',
        'JSESSIONID',
        'sto-id-20480',
      ]);
      const semesterId = await service.semester.getSemesterId(payload, finalCookies);
      return await this.getSemesterExamData(finalCookies, semesterId);
    } catch (err) {
      ctx.throw(err);
    }
  }
}

module.exports = examService;
