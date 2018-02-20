'use strict';

const Service = require('egg').Service;

class ActionTokenService extends Service {
  async apply(username, objectId) {
    const { ctx } = this;
    return ctx.app.jwt.sign({
      data: { username, objectId },
      exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 7),
    }, ctx.app.config.jwt.secret);
  }
}

module.exports = ActionTokenService;
