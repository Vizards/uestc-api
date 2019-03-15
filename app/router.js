'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;
  const cookiesHandler = app.middleware.cookiesHandler();
  const ssoHandler = app.middleware.ssoHandler();
  router.get('/', controller.home.index);
  router.post('/api/home/calendar', controller.home.calendar);
  router.post('/api/dev/idas', controller.dev.idas);
  router.post('/api/dev/ecard', controller.dev.ecard);
  router.post('/api/user/login', controller.user.login);
  router.post('/api/user/exit', app.jwt, cookiesHandler, controller.user.exit);
  router.post('/api/user/delete', controller.user.delete);
  router.get('/api/user/profile', app.jwt, cookiesHandler, ssoHandler, controller.user.profile);
  router.post('/api/user/profile', app.jwt, cookiesHandler, ssoHandler, controller.user.setProfile);
  router.post('/api/user/course', app.jwt, cookiesHandler, ssoHandler, controller.user.course);
  router.post('/api/user/exam', app.jwt, cookiesHandler, ssoHandler, controller.user.exam);
  router.post('/api/user/grade', app.jwt, cookiesHandler, ssoHandler, controller.user.grade);
  router.get('/api/user/grade', app.jwt, cookiesHandler, ssoHandler, controller.user.allGrade);
  router.post('/api/user/usualGrade', app.jwt, cookiesHandler, ssoHandler, controller.user.usualGrade);
  router.get('/api/user/gpa', app.jwt, cookiesHandler, ssoHandler, controller.user.gpa);
  router.get('/api/living/ecard', app.jwt, cookiesHandler, controller.living.ecard);
  router.post('/api/living/loss', app.jwt, cookiesHandler, controller.living.loss);
  router.post('/api/living/bill', app.jwt, cookiesHandler, controller.living.bill);
  router.post('/api/living/electricity', controller.living.electricity);
  router.get('/api/extra/traffic', controller.extra.traffic);
  router.get('/api/extra/contact', controller.extra.contact);
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
