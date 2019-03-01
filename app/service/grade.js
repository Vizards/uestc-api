'use strict';

/**
 * @desc 获取成绩数据
 * @param year [string] '2017-2018' = '2017'
 * @param semester [string] '1' or '2'
 * @type {Service}
 */

const Service = require('egg').Service;
const request = require('request-promise-native').defaults({ simple: false, resolveWithFullResponse: true });
const _ = require('underscore');
const gradeUrl = 'http://eams.uestc.edu.cn/eams/teach/grade/course/person';
const allGradeUrl = 'http://eams.uestc.edu.cn/eams/teach/grade/usual/usual-grade-std!search.action';

class gradeService extends Service {

  async getData(gradeOptions) {
    try {
      const res = await request(gradeOptions);
      return Promise.resolve(res.body);
    } catch (err) {
      return this.ctx.throw(403, '成绩数据获取失败');
    }
  }

  async getGrade(payload) {
    const { ctx, service } = this;
    try {
      const finalCookies = ctx.helper.generateCookieString(ctx, [
        'iPlanetDirectoryPro',
        'JSESSIONID',
        'sto-id-20480',
      ]);
      const semesterId = await service.semester.getSemesterId(payload, finalCookies);
      const gradeOptions = await ctx.helper.options(
        `${gradeUrl}!search.action?semesterId=${semesterId}&projectType=`,
        'GET',
        `${finalCookies};semester.id=${semesterId}`
      );
      const gradeData = await this.getData(gradeOptions);
      return await service.parser.parseGradeData(gradeData);
    } catch (err) {
      ctx.throw(err);
    }
  }

  async allGrade() {
    const { ctx, service } = this;
    try {
      const finalCookies = ctx.helper.generateCookieString(ctx, [
        'iPlanetDirectoryPro',
        'JSESSIONID',
        'sto-id-20480',
      ]);
      const gradeOptions = await ctx.helper.options(
        `${gradeUrl}!historyCourseGrade.action?projectType=MAJOR`,
        'GET',
        finalCookies
      );
      const gradeData = await this.getData(gradeOptions);
      return await service.parser.parseGradeData(gradeData).map(item => {
        return _.omit(item, 'gpa');
      });
    } catch (err) {
      ctx.throw(err);
    }
  }

  async usualGrade(payload) {
    const { ctx, service } = this;
    try {
      const finalCookies = ctx.helper.generateCookieString(ctx, [
        'iPlanetDirectoryPro',
        'JSESSIONID',
        'sto-id-20480',
      ]);
      const semesterId = await service.semester.getSemesterId(payload, finalCookies);
      const usualGradeOptions = this.ctx.helper.options(
        allGradeUrl,
        'POST',
        `semester.id=183;${finalCookies}`,
        {
          'semester.id': semesterId,
        }
      );
      const usualGradeData = await this.getData(usualGradeOptions);
      return await service.parser.parseUsualGradeData(usualGradeData);
    } catch (err) {
      ctx.throw(err);
    }
  }

  async getGPA() {
    const { ctx, service } = this;
    try {
      const finalCookies = ctx.helper.generateCookieString(ctx, [
        'iPlanetDirectoryPro',
        'JSESSIONID',
        'sto-id-20480',
      ]);
      const gradeOptions = await ctx.helper.options(
        `${gradeUrl}!historyCourseGrade.action?projectType=MAJOR`,
        'GET',
        finalCookies
      );
      const gradeData = await this.getData(gradeOptions);
      return await service.parser.parseGPAData(gradeData);
    } catch (err) {
      ctx.throw(err);
    }
  }
}

module.exports = gradeService;
