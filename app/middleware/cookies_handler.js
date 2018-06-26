'use strict';

module.exports = () => {
  return async (ctx, next) => {
    if (ctx.locals.user.data.cookies !== undefined) return next();
    try {
      const username = ctx.locals.user.data.username;
      const query = ctx.model.User.findOne({ username });
      await query.select('finalCookies');
      const data = await query.exec();
      ctx.locals.user.data.cookies = data.finalCookies;
      return next();
    } catch (err) {
      ctx.throw(err);
    }
  };
};
