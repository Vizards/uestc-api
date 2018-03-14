'use strict';

module.exports = () => {
  return async (ctx, next) => {
    if (ctx.locals.user.data.cookies !== undefined) return next();
    try {
      const username = ctx.locals.user.data.username;
      const query = ctx.model.User.findOne({ username });
      await query.select('finalCookies');
      const finalCookies = await query.exec((err, user) => {
        if (err) return ctx.throw(err);
        return user.finalCookies;
      });
      ctx.locals.user.data.cookies = finalCookies._doc.finalCookies;
      return next();
    } catch (err) {
      ctx.throw(err);
    }
  };
};
