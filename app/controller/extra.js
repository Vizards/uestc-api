'use strict';

const Controller = require('egg').Controller;

class ExtraController extends Controller {
  async traffic() {
    const { ctx } = this;
    ctx.status = 302;
    ctx.redirect('https://wx.uestc.ml/uestc-wxapp/?urlfrom=wx&myredirect=/busTime#/busTime');
  }

  async contact() {
    const { ctx } = this;
    ctx.status = 302;
    ctx.redirect('https://wx.uestc.ml/uestc-wxapp/?urlfrom=wx&myredirect=%2FmobileM#/mobileM');
  }

  async info() {
    const { ctx } = this;
    ctx.status = 302;
    ctx.redirect('https://jwc.uestc.ml/wx/toIndex.action');
  }

  async stu() {
    const { ctx } = this;
    ctx.status = 302;
    ctx.redirect('https://jwc.uestc.ml/wx/SchAbout!findNewsInfo.action?partId=37,62,4028811d56bccc720156bcf9a16f0004,4028811d5688c21501568db010930007');
  }

  async edu() {
    const { ctx } = this;
    ctx.status = 302;
    ctx.redirect('https://jwc.uestc.ml/wx/SchAbout!findNewsInfo.action?partId=4028811d54f83c720154ff69e1890002,39');
  }

  async communication() {
    const { ctx } = this;
    ctx.status = 302;
    ctx.redirect('https://jwc.uestc.ml/wx/SchAbout!findNewsInfo.action?partId=38,4028811d5688c21501568daf83b20006');
  }

  async news() {
    const { ctx } = this;
    ctx.status = 302;
    ctx.redirect('https://jwc.uestc.ml/wx/SchAbout!findNewsInfo.action?partId=40');
  }

  async room() {
    const { ctx } = this;
    ctx.status = 302;
    ctx.redirect('https://jwc.uestc.ml/wx/SchAbout!toClassroom.action');
  }

  async todayCourse() {
    const { ctx } = this;
    ctx.status = 302;
    ctx.redirect('https://jwc.uestc.ml/wx/CourseAbout!toTodayCourse.action');
  }

  async searchCourse() {
    const { ctx } = this;
    ctx.status = 302;
    ctx.redirect('https://jwc.uestc.ml/wx/CourseAbout!toSearchCourse.action');
  }

  async searchTeacher() {
    const { ctx } = this;
    ctx.status = 302;
    ctx.redirect('https://jwc.uestc.ml/wx/SchAbout!toSearchTeach.action');
  }
}

module.exports = ExtraController;

