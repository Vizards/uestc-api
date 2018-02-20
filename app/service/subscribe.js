'use strict';

const Service = require('egg').Service;

class subscribeService extends Service {
  async getParams(payload) {
    const { ctx } = this;
    const query = await new ctx.AV.Query('Xifu');
    await query.equalTo('username', ctx.locals.user.data.username);
    const sid = await query.find({}).then(data => {
      if (data.length !== 0) {
        return data[0].get('sid');
      }
      return false;
    });
    if (sid !== false) {
      return await Object.assign(payload, { sid }, { username: ctx.locals.user.data.username });
    }
    ctx.throw(404, `未找到用户 ${ctx.locals.user.data.username} 绑定的喜付账户`);
  }

  async setCorn(params) {
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
  }

  async cancelCorn(params) {
    require('crontab').load((err, crontab) => {
      if (err !== null) {
        this.ctx.throw(err);
      }
      const job = crontab.remove({ comment: `${params.username}${params.type}` });
      crontab.save(job);
    });
    return '成功取消了定时任务';
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
