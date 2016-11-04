# koa-router-pro



##  koa-router-pro v1

  ` koa-router-pro@1.0.0` 是基于koa-router中间件基础之上的一个扩展版本，把路由文件跟控制器独立开来，写法类似于Sails的routes.js文件。并且实现了根据目录路径自动注册路由。

```js
var routerPro = require('koa-router-pro');
var router = routerPro({//这里会返回koa-router的实例
  root:'C:\Users\Cat\Desktop\nodejs\app\controllers\',//controller的根目录
  routes:[{routes:{'get /' : 'IndexController.test','post /' : '/user/InfoController.test'},prefix:'/v1'}],//一个数组每个数组元素是一个包含routes和prefix的对象prefix为可选项
  prefix:'/v1',//路由前缀，可选项
  autoLoad:false//自动路由的配置，会根据配置的root目录来自动注册目录及其子目录下的所有控制器文件，默认是true。如果设置为false就会关闭。

});
app.use(router.routes());
```

  通常把routes配置选项通过rquire路由文件来获得，比如var routes = rquire('routes.js');。
  可以把routes.js路由文件拆分成多个路由文件比如userRoutes.js，adminRouter.js然后配置到routes数组选项中去

```js
module.exports.prefix = '/user';//路由文件中的路由前缀，可选项
module.exports.routes = {
  '/info':function *(next){//支持直接写处理函数
    yield *next;
  },
  'post /':'/user/InfoController.test',
  'get /blog/(\\d{4}-\\d{2}-\\d{2})' : '/user/InfoController.test',//支持正则
  '/':'IndexController.test',//如果不写请求方式，即为all
  '/test':{
    name:'test',//给路由取名，通过router.url(name)，来得到路由url
    methods:['get','post'],//支持多种请求模式，不写则为all
    handler:'/user/InfoController.test',//表示user目录下的InfoController控制器下的test方法
  }
}
```

## 安装

```
$ npm install koa-router-pro --save
```


## 例子




routes.js

```js
module.exports.prefix = '/user';//路由文件中的路由前缀，可选项
module.exports.routes = {
  '/info':function *(next){//支持直接写处理函数
    yield *next;
  },
  'post /':'/user/InfoController.test',
  'get /blog/(\\d{4}-\\d{2}-\\d{2})' : '/user/InfoController.test',//支持正则
  '/':'IndexController.test',//如果不写请求方式，即为all
  '/test':{
    name:'test',//给路由取名，通过router.url('test')，来得到路由url
    methods:['get','post'],//支持多种请求模式，不写则为all
    handler:'/user/InfoController.test',//表示user目录下的InfoController控制器下的test方法
  }
}
```

root目录下的IndexController.js 默认会自动把root目录下的以Controller结尾的js文件注册到路由中去，url为路径加控制器命加方法名,routes里面的路由如果跟自动路由重复，routes配置项中的路由如果跟自动路由重复，routes配置项中的路由会覆盖自动路由
```js

module.exports = {
  test:function *(next){//路由就是/index/test
    this.body = 'test';
    yield next;
  },
};

```


app.js
```js
var routes = rquire('routes.js');
var routerPro = require('koa-router-pro');
var router = routerPro({
  root:'C:\Users\Cat\Desktop\nodejs\app\controllers\',//controller的根目录
  routes:[routes],//一个数组每个数组元素是一个包含routes和prefix的对象prefix为可选项
  prefix:'/v1'//路由前缀，可选项
});
app.use(router.routes());
```

