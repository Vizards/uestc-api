'use strict';

const moment = require('moment');
const request = require('request-promise-native').defaults({ simple: false, resolveWithFullResponse: true });

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
      },
      Host,
      followRedirect: false,
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
    headers: Cookie ? { Cookie } : null,
    form: form ? form : null,
    followRedirect: false,
  };
};

