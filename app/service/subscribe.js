'use strict';

const Service = require('egg').Service;

class subscribeService extends Service {
  async getParams(payload) {
    const { ctx } = this;
    const username = ctx.locals.user.data.username;
    const query = ctx.model.Xifu.findOne({ username });
    await query.select('sid');
    const sid = await query.exec((err, user) => {
      if (err) return ctx.throw(404, `未找到用户 ${username} 绑定的喜付账户`);
      return user.sid;
    });
    return await Object.assign(payload, { sid: sid._doc.sid }, { username });
  }

  async setCorn(params) {
    const { ctx } = this;
    try {
      require('crontab').load((err, crontab) => {
        if (err !== null) {
          this.ctx.throw(err);
        }
        crontab.remove({ comment: `${params.username}${params.type}` });
        const command = `cd ${this.config.baseDir} && chmod +x ${this.config.baseDir}/cron.sh && /bin/bash cron.sh "${params.sid.substr(0, 40)}" "${params.type}" "${params.limit}" "${params.platform}" "${params.registration_id}" "${params.username}" "${this.app.config.keys}"`;
        const job = crontab.create(command, this.app.config.cron, `${params.username}${params.type}`);
        crontab.save(job);
      });
      return '成功添加了定时任务';
    } catch (err) {
      return ctx.throw(500, '添加定时任务失败');
    }
  }

  async cancelCorn(params) {
    const { ctx } = this;
    try {
      require('crontab').load((err, crontab) => {
        if (err !== null) {
          this.ctx.throw(err);
        }
        const job = crontab.remove({ comment: `${params.username}${params.type}` });
        crontab.save(job);
      });
      return '成功取消了定时任务';
    } catch (err) {
      return ctx.throw(500, '取消定时任务失败');
    }
  }

  async initialize(payload) {
    try {
      const params = await this.getParams(payload);
      return await this.setCorn(params);
    } catch (err) {
      this.ctx.throw(err);
    }
  }

  async cancel(payload) {
    try {
      const params = await this.getParams(payload);
      return await this.cancelCorn(params);
    } catch (err) {
      this.ctx.throw(err);
    }
  }
}

module.exports = subscribeService;
