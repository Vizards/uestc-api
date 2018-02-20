'use strict';

module.exports = () => {
  return async (ctx, next) => {
    const check = () => ctx.helper.checkSSO('http://eams.uestc.edu.cn/eams/home.action', ctx.locals.user.data.cookies, 'eams.uestc.edu.cn');
    try {
      let res = await check();
      if (res.body.includes('首页')) return next();
      if (res.headers.location === 'http://eams.uestc.edu.cn/eams/login.action') ctx.throw(403, '教务系统出现问题');
      while (res.headers.location !== undefined && !res.headers.location.includes('ticket')) {
        if (res.headers.location.includes('idas')) {
          res = await ctx.helper.checkSSO(res.headers.location, ctx.locals.user.data.cookies, 'idas.uestc.edu.cn');
        } else {
          res = await check();
        }
      }
      if (res.body.includes('电子科技大学登录')) ctx.throw(403, '统一身份认证系统需要授权');
      if (res.body.includes('重复登录')) {
        await check();
        return next();
      }
      res = await ctx.helper.checkSSO(res.headers.location, ctx.locals.user.data.cookies.substr(0, 188), 'eams.uestc.edu.cn');

      ctx.locals.user.data.cookies = `${res.headers['set-cookie'][0]}${ctx.locals.user.data.cookies.substr(66, 1000)}`;
      const repeatLogin = await check();
      if (repeatLogin.body.includes('重复登录')) {
        await check();
      }
    } catch (err) {
      ctx.throw(err);
    }

    return next();
  };
};
