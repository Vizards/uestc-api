'use strict';

const Controller = require('egg').Controller;


class UserController extends Controller {
  constructor(ctx) {
    super(ctx);

    this.UserLoginTransfer = {
      username: { type: 'string', required: true, allowEmpty: false, format: /^[0-9]{13}$/ },
      password: { type: 'password', required: true, allowEmpty: false, min: 6 },
    };

    this.courseTransfer = this.examTransfer = this.gradeTransfer = {
      year: { type: 'string', required: true, allowEmpty: false, format: /^[0-9]{4}$/ },
      semester: { type: 'string', required: true, allowEmpty: false, format: /[1|2]$/ },
    };
  }

  // 用户登录/创建
  async login() {
    const { ctx, service } = this;
    // 校验参数
    ctx.validate(this.UserLoginTransfer);
    // 组装参数
    const payload = ctx.request.body || {};
    // 调用 Service 进行业务处理
    const res = await service.user.login(payload);
    // 设置响应内容和响应状态码
    ctx.helper.postSuccess({ ctx, res });
  }

  // 退出统一身份认证系统的登录
  async exit() {
    const { ctx, service } = this;
    const res = await service.user.exit();
    ctx.helper.postSuccess({ ctx, res });
  }

  // 删除账户（删除数据库记录，不影响教务系统账户）
  async delete() {
    const { ctx, service } = this;
    ctx.validate(this.UserLoginTransfer);
    const payload = ctx.request.body || {};
    const res = await service.user.delete(payload);
    ctx.helper.postSuccess({ ctx, res });
  }

  // 获取课程信息
  async course() {
    const { ctx, service } = this;
    ctx.validate(this.courseTransfer);
    const payload = ctx.request.body || {};
    const res = await service.course.getCourse(payload);
    ctx.helper.postSuccess({ ctx, res });
  }

  // 获取考试信息
  async exam() {
    const { ctx, service } = this;
    ctx.validate(this.examTransfer);
    const payload = ctx.request.body || {};
    const res = await service.exam.getExam(payload);
    ctx.helper.postSuccess({ ctx, res });
  }

  // 获取单学期成绩信息
  async grade() {
    const { ctx, service } = this;
    ctx.validate(this.gradeTransfer);
    const payload = ctx.request.body || {};
    const res = await service.grade.getGrade(payload);
    ctx.helper.postSuccess({ ctx, res });
  }

  // 获取所有学期成绩信息
  async allGrade() {
    const { ctx, service } = this;
    const res = await service.grade.allGrade();
    ctx.helper.getSuccess({ ctx, res });
  }

  // 获取 GPA 统计信息
  async gpa() {
    const { ctx, service } = this;
    const res = await service.grade.getGPA();
    ctx.helper.getSuccess({ ctx, res });
  }
}

module.exports = UserController;
