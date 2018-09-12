'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;
  const cookiesHandler = app.middleware.cookiesHandler();
  const ssoHandler = app.middleware.ssoHandler();
  router.get('/', controller.home.index);
  router.post('/api/user/login', controller.user.login);
  router.post('/api/user/exit', app.jwt, controller.user.exit);
  router.post('/api/user/delete', controller.user.delete);
  router.post('/api/user/course', app.jwt, cookiesHandler, ssoHandler, controller.user.course);
  router.post('/api/user/exam', app.jwt, cookiesHandler, ssoHandler, controller.user.exam);
  router.post('/api/user/grade', app.jwt, cookiesHandler, ssoHandler, controller.user.grade);
  router.get('/api/user/grade', app.jwt, cookiesHandler, ssoHandler, controller.user.allGrade);
  router.post('/api/user/usualGrade', app.jwt, cookiesHandler, ssoHandler, controller.user.usualGrade);
  router.get('/api/user/gpa', app.jwt, cookiesHandler, ssoHandler, controller.user.gpa);
  router.post('/api/xifu/bind', app.jwt, controller.xifu.bindXiFu);
  router.get('/api/xifu/ecard', app.jwt, controller.xifu.ecard);
  router.get('/api/xifu/bill', app.jwt, controller.xifu.bill);
  router.post('/api/xifu/electricity', app.jwt, controller.xifu.electricity);
  router.get('/api/extra/traffic', controller.extra.traffic);
  router.get('/api/extra/info', controller.extra.info);
  router.get('/api/extra/stu', controller.extra.stu);
  router.get('/api/extra/edu', controller.extra.edu);
  router.get('/api/extra/communication', controller.extra.communication);
  router.get('/api/extra/news', controller.extra.news);
  router.get('/api/extra/room', controller.extra.room);
  router.get('/api/extra/today-course', controller.extra.todayCourse);
  router.get('/api/extra/search-course', controller.extra.searchCourse);
  router.get('/api/extra/search-teacher', controller.extra.searchTeacher);
};
