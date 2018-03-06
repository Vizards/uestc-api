'use strict';
const moment = require('moment');

module.exports = appInfo => {
  const config = exports = {};

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + process.env.APP_KEY;

  // add your config here
  config.middleware = [];

  config.security = {
    csrf: {
      enable: false,
    },
  };

  config.jwt = {
    secret: process.env.JWT_SECRET,
    enable: true, // default is false
    match: '/jwt', // optional
  };

  config.leancloud = {
    appId: process.env.LEANCLOUD_APPID,
    appKey: process.env.LEANCLOUD_APPKEY,
    masterKey: process.env.LEANCLOUD_MASTERKEY,
  };

  config.jpush = {
    appId: process.env.JPUSH_APPID,
    masterKey: process.env.JPUSH_MASTERKEY,
  };

  config.cron = '*/1 * * * *';

  config.alinode = {
    // 从 `Node.js 性能平台` 获取对应的接入参数
    appid: process.env.ALINODE_APPID,
    secret: process.env.ALINODE_SECRET,
  };

  config.onerror = {
    accepts() {
      return 'json';
    },

    json(err, ctx) {
      // 从 error 对象上读出各个属性，设置到响应中
      ctx.body = {
        code: err.status,
        err: err.message,
        time: moment.utc().format(),
      };
      // 处理 Validation Failed 错误，提供提示
      if (err.status === 422) {
        ctx.body.detail = err.errors;
      }
      if (err.status === 401) {
        ctx.body.err = err.message.substr(0, err.message.length - 1);
      }
      ctx.status = 200;
    },

  };


  return config;
};
