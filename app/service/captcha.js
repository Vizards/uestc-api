'use strict';

const Service = require('egg').Service;
const request = require('request-promise-native').defaults({ simple: false, resolveWithFullResponse: true });
const tesseract = require('node-tesseract');
const gm = require('gm');
const captchaUrl = 'http://idas.uestc.edu.cn/authserver/captcha.html';

class CaptchaService extends Service {
  /*
   * 对图片进行阈值处理(默认55)
   */
  async disposeImg(newPath, cookies) {
    const option = await this.ctx.helper.options(captchaUrl, 'GET', cookies);
    return new Promise((resolve, reject) => {
      gm(request(option))
        .threshold(55, '%')
        .normalize()
        .monochrome()
        .despeckle()
        .write(newPath, err => {
          if (err) return reject(err);
          resolve(newPath);
        });
    });
  }

  /*
   * 识别阈值化后图片内容
   */
  async recognizeImg(imgPath, options) {
    options = Object.assign({ l: 'eng', psm: 7 }, options);

    return new Promise((resolve, reject) => {
      tesseract
        .process(imgPath, options, (err, text) => {
          if (err) return reject(err);
          resolve(text.replace(/[\r\n\s'.‘“”’。\-]/gm, '')); // 去掉识别结果中的换行回车空格
        });
    });
  }

  async identify(cookies) {
    try {
      const newImgPath = await this.disposeImg('/tmp/sdasdas.jpg', cookies);
      return await this.recognizeImg(newImgPath);
    } catch (err) {
      console.error(`识别失败:${err}`);
    }
  }
}

module.exports = CaptchaService;
