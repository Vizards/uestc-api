'use strict';

const Service = require('egg').Service;
const cheerio = require('cheerio');

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
      };
    }).get();
  }

  parseGPAData(body) {
    const $ = cheerio.load(body);
    const Obj = {};
    const arr = $('body > .gridtable > tbody > tr').map((i, element) => {
      const id = $(element)
        .find('td:nth-of-type(1)')
        .text()
        .trim()
        .substr(0, 4) + '_' + $(element)
          .find('td:nth-of-type(2)')
          .text()
          .trim();
      return id === '_' ? {
        sum: {
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
        },
      } : {
        [id]: {
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
        },
      };
    }).get();
    arr.pop();
    arr.forEach(item => {
      Object.assign(Obj, item);
    });
    return Obj;
  }
}

module.exports = parserService;
