'use strict';

module.exports = {
  user: {
    username: process.env.YOUR_STU_NUM,
    password: process.env.YOUR_STU_PASS,
    year: '2017',
    semester: '2',
  },

  xifu: {
    mobile: process.env.YOUR_XIFU_ACCOUNT,
    password: process.env.YOUR_XIFU_PASS,
    roomId: process.env.YOUR_ROOM_ID,
  },

  alinode: {
    // 从 `Node.js 性能平台` 获取对应的接入参数
    appid: process.env.ALINODE_APPID,
    secret: process.env.ALINODE_SECRET,
  },
};
