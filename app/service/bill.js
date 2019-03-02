'use strict';

const Service = require('egg').Service;
const request = require('request-promise-native').defaults({ simple: false, resolveWithFullResponse: true });
const moment = require('moment');
const billUrl = 'http://ecard.uestc.edu.cn/web/guest/personal?p_p_id=transDtl_WAR_ecardportlet&p_p_lifecycle=0&p_p_state=exclusive&p_p_mode=view&p_p_col_id=column-4&p_p_col_count=1&_transDtl_WAR_ecardportlet_action=dtlmoreview';

class billService extends Service {
  async parseSpecified(payload, cookies) {
    const hash = {
      charge: 1,
      cost: 2,
      electricity: 3,
    };
    const option = await this.ctx.helper.options(billUrl, 'POST', cookies, {
      _transDtl_WAR_ecardportlet_qdate: payload.day,
      _transDtl_WAR_ecardportlet_qtype: hash[payload.type],
    });

    try {
      const res = await request(option);
      const tradeSumData = await this.ctx.service.parser.parseTradeSum(res.body);
      return { payload, cookies, hash, tradeSumData };
    } catch (e) {
      return this.ctx.throw(403, '解析账单信息失败');
    }
  }

  async traversePage({ payload, cookies, hash, tradeSumData }) {
    const page_sum = tradeSumData.page_sum;
    let tradeDetailArray = [];
    for (let i = 1; i <= page_sum; i++) {
      const option = await this.ctx.helper.options(billUrl, 'POST', cookies, {
        _transDtl_WAR_ecardportlet_cur: i,
        _transDtl_WAR_ecardportlet_delta: 10,
        _transDtl_WAR_ecardportlet_qdate: payload.day,
        _transDtl_WAR_ecardportlet_qtype: hash[payload.type],
      });

      try {
        const res = await request(option);
        const data = await this.ctx.service.parser.parseTradeInfo(res.body, payload.type);
        tradeDetailArray = tradeDetailArray.concat(data);
      } catch (e) {
        return this.ctx.throw(403, '解析账单列表失败');
      }
    }
    if (tradeSumData.total_cost === undefined && tradeSumData.total_charge === undefined) {
      if (tradeDetailArray.length === 0) {
        tradeSumData.total_cost = 0;
        tradeSumData.total_charge = 0;
      }
      if (tradeDetailArray.length === 1) {
        tradeSumData.total_cost = tradeDetailArray[0].transaction < 0 ? -tradeDetailArray[0].transaction : 0;
        tradeSumData.total_charge = tradeDetailArray[0].transaction > 0 ? tradeDetailArray[0].transaction : 0;
      }
    }
    return {
      total_cost: tradeSumData.total_cost,
      total_charge: tradeSumData.total_charge,
      history: tradeDetailArray.map(detail => {
        detail.transaction = detail.transaction > 0 ? `+${detail.transaction}` : `${detail.transaction}`;
        return detail;
      }),
    };
  }

  async parseAll(payload, cookies) {
    const obj = {};
    let arr = [];
    await Promise.all([ 'charge', 'cost', 'electricity' ].map(async item => {
      const info = await this.parseSpecified({
        day: payload.day,
        type: item,
      }, cookies);
      const data = await this.traversePage(info);
      arr = arr.concat(data.history);
      if (info.tradeSumData.total_cost && info.tradeSumData.total_charge) {
        obj.total_cost = data.total_cost;
        obj.total_charge = data.total_charge;
      }
    }));

    if (obj.total_cost === undefined && obj.total_charge === undefined) {
      let total_cost = 0;
      let total_charge = 0;
      arr.forEach(detail => {
        if (+detail.transaction < 0) total_cost += -detail.transaction;
        if (+detail.transaction > 0) total_charge += +detail.transaction;
      });
      obj.total_cost = total_cost;
      obj.total_charge = total_charge;
    }

    arr.sort((a, b) => (moment(a.time).isBefore(moment(b.time)) ? 1 : -1));
    obj.history = arr;
    return obj;
  }


  async query(payload) {
    const { ctx } = this;
    try {
      const cookies = await ctx.service.ecard.cookies();
      if (payload.type !== 'all') {
        const data = await this.parseSpecified(payload, cookies);
        return await this.traversePage(data);
      }

      return await this.parseAll(payload, cookies);
    } catch (err) {
      return ctx.throw(403, '查询账单信息失败');
    }
  }
}

module.exports = billService;
