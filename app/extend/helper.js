'use strict';

const moment = require('moment');
const request = require('request-promise-native').defaults({ simple: false, resolveWithFullResponse: true });
const CryptoJS = require('crypto-js');

// 处理 POST 成功响应
exports.postSuccess = ({ ctx, res, msg = 'Post Success' }) => {
  ctx.body = {
    code: 201,
    data: res,
    time: moment.utc().format(),
    msg,
  };
  ctx.status = 200;
};

// 处理 GET 成功响应
exports.getSuccess = ({ ctx, res, msg = 'Get Success' }) => {
  ctx.body = {
    code: 200,
    data: res,
    time: moment.utc().format(),
    msg,
  };
  ctx.status = 200;
};

// 返回完整 HTML 数据
exports.htmlSuccess = ({ ctx, res }) => {
  ctx.body = res;
  ctx.status = 200;
};

// 封装单点登录 request 请求
exports.checkSSO = (url, cookies, Host) => {
  try {
    const option = {
      url,
      method: 'GET',
      headers: {
        Cookie: cookies,
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 10_3_1 like Mac OS X) AppleWebKit/603.1.30 (KHTML, like Gecko) Version/10.0 Mobile/14E304 Safari/602.1',
      },
      Host,
      followRedirect: false,
      proxy: process.env.PROXY || null,
    };
    const res = request(option);
    return Promise.resolve(res);
  } catch (err) {
    return Promise.reject(err);
  }
};

// 封装生成 OPTIONS
exports.options = (url, method, Cookie, form) => {
  return {
    url,
    method: method ? method : 'GET',
    headers: Cookie ? {
      Cookie,
      'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 10_3_1 like Mac OS X) AppleWebKit/603.1.30 (KHTML, like Gecko) Version/10.0 Mobile/14E304 Safari/602.1',
    } : null,
    form: form ? form : null,
    followRedirect: false,
    proxy: process.env.PROXY || null,
  };
};

exports.encrypt = (data, aesKey) => {
  if (!aesKey) aesKey = 'rjBFAaHsNkKAhpoi'; // 没有什么用，需要从 HTML 解析得到真正的动态 key
  const $aes_chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';
  const aes_chars_len = $aes_chars.length;

  function getAesString(data, key0, iv0) {
    key0 = key0.replace(/(^\s+)|(\s+$)/g, '');
    const key = CryptoJS.enc.Utf8.parse(key0);
    const iv = CryptoJS.enc.Utf8.parse(iv0);
    const encrypted = CryptoJS.AES.encrypt(data, key, {
      iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });
    return encrypted.toString();
  }

  function randomString(len) {
    let retStr = '';
    for (let i = 0; i < len; i++) {
      retStr += $aes_chars.charAt(Math.floor(Math.random() * aes_chars_len));
    }
    return retStr;
  }

  return getAesString(randomString(64) + data, aesKey, randomString(16));
};
