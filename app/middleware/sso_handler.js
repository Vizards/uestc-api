'use strict';

async function refresh(ctx) {
  const cookies = ctx.helper.generateCookieString(ctx, [
    'semester.id',
    'JSESSIONID',
    'sto-id-20480',
    'iPlanetDirectoryPro',
  ]);

  try {
    const res = await ctx.helper.checkSSO('http://eams.uestc.edu.cn/eams/home.action', cookies);
    switch (res.statusCode) {
      case 200:
        if (res.body.includes('本次会话已经被过期（可能是由于重复登录）') || res.body.includes('当前用户存在重复登录的情况')) {
          await refresh(ctx);
        }
        return '已登录';
      case 302:
        return res.headers.location;
      default:
        return ctx.throw(403, '无法重定向至指定页面，教务系统未按预期跳转');
    }
  } catch (e) {
    return ctx.throw(500, e);
  }
}

async function getTicketUrl(ctx, url) {
  const cookies = ctx.helper.generateCookieString(ctx, [
    'CASTGC',
    'route',
    'JSESSIONID',
    'iPlanetDirectoryPro',
  ]);
  try {
    const res = await ctx.helper.checkSSO(url, cookies, 'idas.uestc.edu.cn');
    if (res.statusCode === 302 && res.headers.location.includes('ticket')) {
      return res.headers.location;
    }
    return ctx.throw(403, '统一身份认证系统登录失败，请尝试重新登录以避开单点登录限制');
  } catch (e) {
    return ctx.throw(500, e);
  }
}

async function getNewCookies(ctx, ticketUrl) {
  const cookies = ctx.helper.generateCookieString(ctx, [
    'semester.id',
    'JSESSIONID',
    'sto-id-20480',
    'iPlanetDirectoryPro',
  ]);

  try {
    const res = await ctx.helper.checkSSO(ticketUrl, cookies);
    if (res.headers['set-cookie'].length !== 0) {
      return res.headers['set-cookie'];
    }
  } catch (err) {
    return ctx.throw(500, err);
  }
}

async function updateCookies(ctx, newCookies) {
  try {
    const username = ctx.locals.user.data.username;
    const query = ctx.model.User.findOne({ username });
    await query.select('finalCookies');
    const data = await query.exec();

    const finalCookies = JSON.parse(data.finalCookies);
    newCookies.forEach(item => {
      const splitLocation = item.indexOf('=');
      const key = item.substring(0, splitLocation);
      const value = item.substring(splitLocation + 1);
      finalCookies[key] = value;
    });

    ctx.locals.user.data.cookies = finalCookies;

    await ctx.model.User.updateOne({
      username,
    }, {
      updatedAt: Date.now(),
      finalCookies: JSON.stringify(finalCookies),
    });

  } catch (e) {
    return ctx.throw(500, e);
  }
}

module.exports = () => {
  return async (ctx, next) => {
    const url = await refresh(ctx);
    if (url !== '已登录') {
      const ticketUrl = await getTicketUrl(ctx, url);
      const newCookies = await getNewCookies(ctx, ticketUrl);
      await updateCookies(ctx, newCookies);
    }
    return next();
  };
};
