'use strict';

module.exports = {
  cron: '1 */6 * * *',

  alinode: {
    // 从 `Node.js 性能平台` 获取对应的接入参数
    appid: process.env.ALINODE_APPID,
    secret: process.env.ALINODE_SECRET,
  },
};
