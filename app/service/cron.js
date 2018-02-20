'use strict';

const Service = require('egg').Service;
const request = require('request-promise-native').defaults({ simple: false, resolveWithFullResponse: true });
const queryInfoUrl = 'https://api.bionictech.cn/ykt_biz/external/v1/query_goods_info';
const queryElectricityUrl = 'https://api.bionictech.cn/school/h5/electricity/getElectricityFeeBalance.action';
const JPush = require('jpush-sdk');

class CronService extends Service {
  static async getBalance(payload) {
    const options = {
      url: queryInfoUrl,
      method: 'POST',
      form: {
        school_id: 1,
        student_no: payload.username,
      },
      headers: {
        Cookie: payload.sid,
      },
    };

    try {
      const response = await request(options);
      return JSON.parse(response.body).retcode === '000000' ? Promise.resolve(JSON.parse(response.body).data.balance) : JSON.parse(response.body).retmsg;
    } catch (err) {
      return err;
    }
  }

  static async getAmount(payload) {
    const options = {
      url: queryElectricityUrl,
      method: 'GET',
      headers: {
        Cookie: payload.sid,
      },
    };
    try {
      const response = await request(options);
      return JSON.parse(response.body).retcode === '000000' ? Promise.resolve(JSON.parse(response.body).data.balance) : JSON.parse(response.body).retmsg;
    } catch (err) {
      return err;
    }
  }

  static async checkBalance(balance, payload) {
    return balance.match(/^[0-9]+(.[0-9]{2})?$/)[1] !== undefined && Number(balance) < payload.limit;
  }

  async pushNotification(balance, payload) {
    const { ctx } = this;
    const client = await JPush.buildClient(this.app.config.jpush.appId, this.app.config.jpush.masterKey);
    try {
      client.push()
        .setPlatform(payload.platform)
        .setAudience(JPush.registration_id(payload.registration_id))
        .setNotification(
          JPush.ios(`您的${payload.type === 'ecard' ? '一卡通' : '电费'}余额 ￥${balance}} 已经低于警告值 ￥${payload.limit}`, 'sound', 1),
          JPush.android(`您的${payload.type === 'ecard' ? '一卡通' : '电费'}余额 ￥${balance}} 已经低于警告值 ￥${payload.limit}`, '余额告警', 1)
        )
        .send(err => {
          if (err) {
            ctx.logger.info({
              username: payload.username,
              sid: payload.sid,
              limit: payload.limit,
              platform: payload.platform,
              registration_id: payload.registration_id,
              error: err,
            });
          }
        });
      return 'CRON: Push Success';
    } catch (err) {
      return err;
    }
  }

  async run(payload) {
    const { ctx } = this;
    if (payload.cronMasterKey !== this.app.config.keys) {
      ctx.logger.info('CRON: Authentication Failed, attack from %d', payload.cronMasterKey);
      return false;
    }
    try {
      const balance = payload.type === 'ecard' ? await this.constructor.getBalance(payload) : await this.constructor.getAmount(payload);
      const checkBalance = await this.constructor.checkBalance(balance, payload);
      return checkBalance ? await this.pushNotification(balance, payload) : ctx.logger.info('CRON: No Need to Push');
    } catch (err) {
      ctx.logger.info({
        username: payload.username,
        sid: payload.sid,
        limit: payload.limit,
        platform: payload.platform,
        registration_id: payload.registration_id,
        error: err,
      });
    }
  }
}

module.exports = CronService;
