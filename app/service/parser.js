'use strict';

const Service = require('egg').Service;
const cheerio = require('cheerio');
const moment = require('moment');

class parserService extends Service {

  parseTime(str) {
    const res = [];
    const matchFullWeek = new RegExp(/1{2,}/g); // 匹配连续周
    const matchSingleWeek = new RegExp(/(10){2,}/g); // 匹配奇偶周
    const getZeroStr = num => { // 获取 num 个 0 的字符串
      return new Array(num).fill(0).join('');
    };
    const matchStr = (pattern, str) => {
      // 获取 str 中匹配 pattern 的所有字串
      const tmpRes = [];
      let tmp = null;
      let tmpStr = str;
      let cond = true;
      while (cond) {
        tmp = pattern.exec(tmpStr);
        if (tmp) {
          tmpRes.push(tmp);
          tmpStr = tmpStr.replace(tmp[0], getZeroStr(tmp[0].length)); // 将匹配到的字串位置清零
        } else {
          cond = false;
        }
      }
      return [ tmpRes, tmpStr ];
    };
    const fullWeek = matchStr(matchFullWeek, str);
    const singleWeek = matchStr(matchSingleWeek, fullWeek[1]);
    fullWeek[0].forEach(v => {
      const endWeek = v.index + v[0].length - 1;
      res.push(v.index + '-' + endWeek + '周'); // 处理连续周
    });
    singleWeek[0].forEach(v => {
      const startWeek = v.index;
      const endWeek = v.index + v[0].length - 1;
      const attr = startWeek % 2 ? '单' : '双';
      res.push(startWeek + '-' + endWeek + attr + '周'); // 处理奇偶周
    });
    res.push(() => {
      const tmp = singleWeek[1].split('').map((v, i) => {
        return v === '1' ? i : 0; // 得到单周的索引
      }).filter(v => {
        return v !== 0; // 剔除无效值
      })
        .join('/');
      return tmp.length ? tmp + '周' : null; // 加壳处理
    }); // 处理单周

    return res.filter(v => {
      return isFinite(parseInt(v)); // 剔除无效值
    });
  }

  parseCourseData(courseData) {
    const pHtml = JSON.stringify(courseData).match(/activity = new TaskActivity.*activity/g);
    if (!pHtml) return [];
    const tmp = pHtml && pHtml[0].split('activity =');
    const data = [];
    tmp.forEach(value => {
      if (value.length) {
        const tmpTime = value.match(/index =.*?\;/g);
        const time = [];
        tmpTime.forEach(v => {
          time.push(v.match(/\d+/g));
        });
        data.push({
          info: value.match(/TaskActivity\((.*)\)/)[1].replace(/\,/g, '').split('\\\"'), // 每个课程的详细信息,
          time, // 每节课的排课时间
        });
      }
    });
    return data.map(v => {
      return {
        courseName: v.info[7].split('(')[0],
        courseId: v.info[7].split('(')[1].replace(')', ''),
        teacher: v.info[3],
        room: v.info[11],
        time: v.time,
        date: this.parseTime(v.info[13]),
      };
    });
  }

  parseExamData(resText) {
    const $ = cheerio.load(resText.replace(/[\n\r\t]\s+/g, ''));
    if ($('.formTable > tbody').children().length === 1) return [];
    return $('.formTable > tbody').children().map((i, el) => {
      return $(el).children().length === 8 && i > 0 ? {
        name: $(el).children().get(1).children[0].data,
        date: $(el).children().get(2).children[0].data,
        detail: $(el).children().get(3).children[0].data.replace(/\(.*\)/, ''),
        address: $(el).children().get(4).children[0].data,
        seat: $(el).children().get(5).children[0].data,
        status: $(el).children().get(6).children[0].data,
      } : $(el).children().length === 7 && i > 0 ? {
        // 此处处理考试已经安排时间，但是座位号和考场教室尚未安排的情况
        name: $(el).children().get(1).children[0].data,
        date: $(el).children().get(2).children[0].data,
        detail: $(el).children().get(3).children[0].data.replace(/\(.*\)/, ''),
        address: $(el).children().get(4).children[0].children[0].data,
        seat: $(el).children().get(4).children[0].children[0].data,
        status: $(el).children().get(5).children[0].data,
      } : null;
    })
      .get();
  }

  parseGradeData(body) {
    const $ = cheerio.load(body);
    return $('.grid > table > tbody > tr').map((i, element) => {
      // 增加从未补考过的用户的总成绩表处理
      return element.children.length === 17 || element.children.length === 18 ? {
        name: $(element)
          .find('td:nth-of-type(4)')
          .text()
          .trim(),
        type: $(element)
          .find('td:nth-of-type(5)')
          .text()
          .trim(),
        credit: $(element)
          .find('td:nth-of-type(6)')
          .text()
          .trim(),
        overall: $(element)
          .find('td:nth-of-type(7)')
          .text()
          .trim(),
        resit: $(element)
          .find('td:nth-of-type(8)')
          .text()
          .trim(),
        final: $(element)
          .find('td:nth-of-type(9)')
          .text()
          .trim(),
        gpa: $(element)
          .find('td:nth-of-type(10)')
          .text()
          .trim(),
      } : {
        name: $(element)
          .find('td:nth-of-type(4)')
          .text()
          .trim(),
        type: $(element)
          .find('td:nth-of-type(5)')
          .text()
          .trim(),
        credit: $(element)
          .find('td:nth-of-type(6)')
          .text()
          .trim(),
        overall: $(element)
          .find('td:nth-of-type(7)')
          .text()
          .trim(),
        resit: '--',
        final: $(element)
          .find('td:nth-of-type(8)')
          .text()
          .trim(),
        gpa: $(element)
          .find('td:nth-of-type(9)')
          .text()
          .trim(),
      };
    }).get();
  }

  parseUsualGradeData(body) {
    const $ = cheerio.load(body);
    const tr = $('.grid > table > tbody > tr');
    return tr.length === 1 ? [] : tr.map((i, element) => {
      return {
        name: $(element)
          .find('td:nth-of-type(4)')
          .text()
          .trim(),
        type: $(element)
          .find('td:nth-of-type(5)')
          .text()
          .trim(),
        credit: $(element)
          .find('td:nth-of-type(6)')
          .text()
          .trim(),
        grade: $(element)
          .find('td:nth-of-type(7)')
          .text()
          .trim(),
      };
    }).get();
  }

  parseGPAData(body) {
    const $ = cheerio.load(body);
    const arr = $('body > .gridtable > tbody > tr').map((i, element) => {
      const year = Number($(element)
        .find('td:nth-of-type(1)')
        .text()
        .trim()
        .substr(0, 4));
      const semester = Number($(element)
        .find('td:nth-of-type(2)')
        .text()
        .trim());

      return year === 0 && semester === 0 ? {
        year,
        semester,
        subject: $(element)
          .find('th:nth-of-type(2)')
          .text()
          .trim(),
        credit: $(element)
          .find('th:nth-of-type(3)')
          .text()
          .trim(),
        gpa: $(element)
          .find('th:nth-of-type(4)')
          .text()
          .trim(),
      } : {
        year,
        semester,
        subject: $(element)
          .find('td:nth-of-type(3)')
          .text()
          .trim(),
        credit: $(element)
          .find('td:nth-of-type(4)')
          .text()
          .trim(),
        gpa: $(element)
          .find('td:nth-of-type(5)')
          .text()
          .trim(),
      };
    }).get();
    arr.pop(); // 处理掉最后一行的空数据
    // 多条件排序
    arr.sort((a, b) => {
      if (a.year === b.year) {
        return a.semester - b.semester;
      }
      return a.year - b.year;
    });
    return arr;
  }

  parseProfile(body) {
    const $ = cheerio.load(body);
    const tr = $('#studentInfoTb > tbody > tr');
    const obj = {};
    const attrArr = [
      [],
      [ 'stuID', 'stuName' ],
      [ 'enName', 'gender' ],
      [ 'grade', 'plan' ],
      [ 'project', 'level' ],
      [ 'category', 'department' ],
      [ 'profession', 'direction' ],
      [ '', '' ],
      [ 'enrollDate', 'graduateDate' ],
      [ 'manager', 'waysOfLearning' ],
      [ 'eduForm', 'status' ],
      [ 'registered', 'atSchool' ],
      [ 'class', 'campus' ],
    ];
    tr.map((i, element) => {
      if (i !== 0 && element.children.length !== 1) {
        obj[attrArr[i][0]] = $(element).find('td:nth-of-type(2)').text()
          .trim();
        obj[attrArr[i][1]] = $(element).find('td:nth-of-type(4)').text()
          .trim();
      }
      return false;
    }).get();
    return obj;
  }

  parseECardInfo(body) {
    const $ = cheerio.load(body);
    const tr = $('.card-info > tbody > tr');
    const obj = {};
    tr.map((i, element) => {
      const text = $(element).find('td:nth-of-type(1)').text();
      if (text.includes('卡号')) obj.id = +text.split('：')[1];
      if (text.includes('卡状态')) obj.status = text.split('：')[1];
      if (text.includes('卡有效期')) obj.expirationTime = text.split('：')[1];
      if (text.includes('充值未领取')) obj.unClaimed = +text.split('：')[1].substring(0, text.split('：')[1].length - 1);
      return false;
    }).get();

    const tradeTr = $('.trade_table > tbody > tr');

    tradeTr.map((i, element) => {
      const text = +$(element).find('td:nth-of-type(5)').text();
      obj.balance = text;
      return false;
    }).get();
    return obj;
  }

  parseTradeSum(body) {
    const $ = cheerio.load(body);
    const data = {};

    const value = $('#_transDtl_WAR_ecardportlet_pageCount').attr('value');
    data.page_sum = value === undefined ? 1 : +value;

    $('p').map((i, el) => {
      const total_cost = +$(el).find('span:nth-of-type(1)').text();
      const total_charge = +$(el).find('span:nth-of-type(2)').text();
      data.total_cost = total_cost;
      data.total_charge = total_charge;
      return false;
    });

    return data;
  }

  parseTradeInfo(body) {
    const $ = cheerio.load(body);
    const history = $('.trade_table > tbody > tr').map((i, el) => {
      const date = $(el).find('td:nth-of-type(1)').text();
      const time = $(el).find('td:nth-of-type(2)').text();
      const device = $(el).find('td:nth-of-type(3)').text() === '易支付' ? '电费充值' : $(el).find('td:nth-of-type(3)').text();
      const cost = +$(el).find('td:nth-of-type(4) > span').text();
      const balance = +$(el).find('td:nth-of-type(5)').text();
      return device !== '电费充值' ? {
        time: moment(`${date} ${time}`, 'YYYYMMDD HHmmss').format('YYYY-MM-DD HH:mm:ss'),
        device, cost, balance,
      } : {
        time: moment(`${date} ${time}`, 'YYYYMMDD HHmmss').format('YYYY-MM-DD HH:mm:ss'),
        device,
        cost: balance,
        roomId: cost,
      };
    }).get();
    history.shift();
    return history;
  }
}

module.exports = parserService;
