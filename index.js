const { Auth } = require('./auth');

//const Koa = require('koa');
//const Router = require('koa-router');
//const bodyParser = require('koa-bodyparser');
//
//const app = new Koa();
//const router = new Router();
//
//const auth = new Auth();
//
//router.post('/createAndSendToken', ctx => {
//  const token = auth.createAndSendToken(ctx.request.body);
//  ctx.body = 'OK';
//});
//
//router.post('/getData', ctx => {
//  const data = auth.getData(ctx.request.body.token);
//
//  if (!data) {
//    ctx.status = 404;
//  }
//  else {
//    ctx.body = JSON.stringify({ email: data.email }, null, 2);
//  }
//});
//
//router.post('/deleteToken', ctx => {
//  auth.deleteToken(ctx.request.body.token);
//  ctx.body = 'OK';
//});
//
//app
//  .use(bodyParser({
//    enableTypes: ['json'],
//  }))
//  .use(router.routes())
//  .use(router.allowedMethods())
//  .listen(9001);

module.exports = {
  Auth,
};
