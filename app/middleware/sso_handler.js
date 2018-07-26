'use strict';

module.exports = () => {
  return async (ctx, next) => {
    // 封装请求，遇到 SSO 时只需连续请求 http://eams.uestc.edu.cn/eams/home.action 即可
    let cookies = ctx.locals.user.data.cookies;
    ctx.logger.info(cookies);
    const check = () => ctx.helper.checkSSO('http://eams.uestc.edu.cn/eams/home.action', cookies.substr(0, 229), 'eams.uestc.edu.cn');
    try {
      let res = await check();
      while (res.body.includes('重复登录')) {
        res = await check();
      }
      // 如果这里没有出现 SSO，就直接跳过完事儿
      if (res.body.includes('您的当前位置')) {
        ctx.locals.user.data.cookies = cookies.substr(0, 229);
        return next();
      }
      // 这是学校教务系统维护的时候经常出现的错误，到了下面这个已经废弃的 url, 输什么用户名和密码都不会对
      if (res.headers.location === 'http://eams.uestc.edu.cn/eams/login.action') ctx.throw(403, '教务系统出现问题');
      // 一直请求，直到开始请求 http://eams.uestc.edu.cn/eams/home!index.action?ticket=xxxx 的时候结束
      while (res.headers.location !== undefined && !res.headers.location.includes('ticket')) {
        if (res.headers.location.includes('idas')) {
          // 【有可能】会 302 到 idas 去，此时必须要带上 CASTGC 这个 cookies，否则就回不来了
          res = await ctx.helper.checkSSO(res.headers.location, cookies, 'idas.uestc.edu.cn');
        } else {
          res = await check();
        }
      }
      if (res.headers['set-cookie'][0].includes('route')) {
        cookies = `${res.headers['set-cookie'][0]};${cookies.substr(0, 229)}`;
      }
      // 如果这里直接回 http://idas.uestc.edu.cn 了那就没救了，交给后面让用户重新登录
      if (res.body.includes('电子科技大学登录')) ctx.throw(403, '统一身份认证系统需要授权');

      while (res.body === '' && res.headers.location.includes('ticket')) {
        res = await ctx.helper.checkSSO(res.headers.location, cookies, 'eams.uestc.edu.cn');
        ctx.logger.info(res);
        if (res.headers['set-cookie'].length === 2) {
          cookies = `${cookies.substr(0, 39)}semester.id=183;${res.headers['set-cookie'][0]};${res.headers['set-cookie'][1]};`;
        }
      }
      // 在此处触发重复登录的界面
      res = await check();
      while (res.body.includes('重复登录')) {
        res = await check();
      }
    } catch (err) {
      ctx.throw(err);
    }
    ctx.locals.user.data.cookies = `UESTCXGUID=;UM_distinctid=;${cookies}`;
    return next();
  };
};
