'use strict'
var path = require('path');
var fs = require('fs');
var router = require('koa-router')();

/**
 * Expose `bind` method.
 */
module.exports = bind;

/**
 * bind router
 * @param {Object} [opts]
 * @return {koa-router}
 * @api public
 */
function bind(opts){
  opts = opts||{};
  opts.prefix = opts.prefix || '';
  opts.autoLoad = opts.autoLoad == undefined ? true: opts.autoLoad;
  if (!opts.root) {
    throw new Error('opts.root required');
  }
  if (opts.autoLoad){
    autoLoad();
  }
  for (let i in opts.routes){
    let prefix = opts.routes[i]['prefix'] || '';
    for (let route in opts.routes[i]['routes']){
      if (typeof opts.routes[i]['routes'][route] === 'function'){
        bindFunction(prefix,route,opts.routes[i]['routes'][route]);
      }else if (typeof opts.routes[i]['routes'][route] === 'object'){
        bindObject(prefix,route,opts.routes[i]['routes'][route]);
      }else if (typeof opts.routes[i]['routes'][route] === 'string'){
        bindString(prefix,route,opts.routes[i]['routes'][route]);
      }
    }
   
  }
  return router;
  /**
   * Route Split.
   *
   * @api private
  */
  function routeSplit(route){
    route = route.split(' ');
    let routePath;
    let method;
    if(route.length == 1){
      method = 'all';
      routePath = route[0];
    }else if(route.length > 1){
      method = route[0];
      route.splice(0,1);
      routePath = route.join(' ');
    }
    return {method:method,routePath:routePath};
  }
  /**
   * String converts handler middleware.
   *
   * @api private
  */
  function stringToHandler(handlerString){
    handlerString = handlerString.split('/');
    let _path = '';
    let ctrl = handlerString[handlerString.length-1];
    delete handlerString[handlerString.length-1];
    for(let i in handlerString){
      _path = _path + handlerString[i] + path.sep;
    }
    ctrl = ctrl.split('.');
    let req = require(opts.root+_path+ctrl[0]+'.js');
    if(typeof req[ctrl[1]] === 'function'){
      return req[ctrl[1]];
    }
  }


  /**
   * Bind middleware function to route.
   *
   * @api private
   */
  function bindFunction(prefix,route, handler) {
    route = routeSplit(route);
    router[route.method](opts.prefix+prefix+route.routePath,handler);//register router
  }

  /**
   * String converts handler middleware then bind middleware function to route.
   *
   * @api private
   */
  function bindString(prefix,route,target) {
    let handler = stringToHandler(target);
    route = routeSplit(route);
    router[route.method](opts.prefix+prefix+route.routePath,handler);//register router
  }

  /**
   * Object converts handler middleware then bind middleware function to route.
   *
   * @api private
   */
  function bindObject(prefix,route,target) {
    target.name = target.name||null;
    let handler;
    route = routeSplit(route);
    if (typeof target.handler === 'function'){
      handler = target.handler;
    }else if(typeof target.handler === 'string'){
      handler = stringToHandler(target.handler);
    }else{
      return;
    }
    if (target.methods === undefined || target.methods.length === 0){
      router[route.method](target.name,route.routePath,handler);
    }else if (target.methods){
      router.register(opts.prefix+prefix+route.routePath,target.methods,handler,{name:target.name});//register router     
    }
  }

  /**
   * Get controllers files.
   *
   * @api private
   */
  function walkCtrlFiles(root) {
    let files = fs.readdirSync(root);
    let list = [];
    for (let file of files) {
      if (fs.statSync(root + path.sep + file).isDirectory()) {
            list = list.concat(walkCtrlFiles(root + path.sep + file));
        }else if (path.extname(file) == '.js' && file.includes('Controller.js')){
          list.push(root + path.sep + file);
        }
    }
      return list;
  }

  /**
   * Auto load controller to router.
   *
   * @api private
   */
  function autoLoad(){
    let files = walkCtrlFiles(opts.root);
    for (let i in files){
      let fileSplit = files[i].split(opts.root);
      fileSplit[1] = fileSplit[1].replace(/\\/g, '/');
      let req = require(files[i]);
      for (let handleName in req){
        if (typeof req[handleName] === 'function'){
          router.all(fileSplit[1].split('Controller.js')[0].toLowerCase()+'/'+handleName, req[handleName]);
        }
      }
    }
  }
}
