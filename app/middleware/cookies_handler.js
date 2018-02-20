'use strict';

module.exports = () => {
  return async (ctx, next) => {
    if (ctx.locals.user.data.cookies !== undefined) return next();
    try {
      const objectId = ctx.locals.user.data.objectId;
      const query = await new ctx.AV.Query('_User');
      const data = await query.get(objectId, { useMasterKey: true });
      ctx.locals.user.data.cookies = data.get('finalCookies');
      return next();
    } catch (err) {
      ctx.throw(err);
    }
  };
};
