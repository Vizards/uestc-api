'use strict';

const Service = require('egg').Service;
const request = require('request-promise-native').defaults({ simple: false, resolveWithFullResponse: true });
const queryInfoUrl = 'https://api.bionictech.cn/ykt_biz/external/v1/query_goods_info';
const queryBillUrl = 'https://api.bionictech.cn/app/web/v1/ykt_consumes_list';

class ecardService extends Service {
  // 从数据库获取 sid
  async getSid() {
    const { ctx } = this;
    const username = ctx.locals.user.data.username;
    const query = ctx.model.Xifu.findOne({ username });
    await query.select('sid');
    const data = await query.exec();
    return data.sid;
  }

  async getInfo(cookies, type) {
    const { ctx } = this;
    const options = {
      url: type === 'ecard' ? queryInfoUrl : queryBillUrl,
      method: 'POST',
      form: {
        school_id: 1,
        [type === 'ecard' ? 'student_no' : 'stuempno']: ctx.locals.user.data.username,
      },
      headers: {
        Cookie: cookies,
      },
    };

    try {
      const response = await request(options);
      if (JSON.parse(response.body).retcode === '000000' || '0000') {
        return Promise.resolve(JSON.parse(response.body).data);
      }
      ctx.throw(403, JSON.parse(response.body).retmsg);
    } catch (err) {
      return Promise.reject(err);
    }

  }

  async query(type) {
    const { ctx } = this;
    try {
      const cookies = await this.getSid();
      return await this.getInfo(cookies, type);
    } catch (err) {
      ctx.throw(err);
    }
  }
}

module.exports = ecardService;
