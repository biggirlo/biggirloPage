/**
 * 该项目仅供学习
 *  如有疑问或建议请致邮箱：645614025@qq.com
 * Created by 王雁欣
 * Date: 2017/9/29
 * Time: 1:59
 */

var context = {
    config:{
        requestHost:"http://127.0.0.1:8081",
        base:"http://127.0.0.1:10100/biggirlos",
        serviceName:"/biggirlos"
    },
    url:{
       login:  '/page/system/login/login.html'
    },
    tokenName:"Authorization",//token名称
    method:{
        get:function (url,success,error) {
            if(!error){
                error = function () {
                    toastr.error("请求错误","错误");
                }
            }
            $.ajax({
                url:url,
                type:'GET', //GET
                beforeSend: function(request) {
                    request.setRequestHeader(context.tokenName, sessionStorage.getItem(context.tokenName));
                },
                success:function (data) {
                    if(data.code == sysCode.UN_LOGIN)
                        window.location.href = context.config.serviceName + context.url.login;
                    else
                        success(data);
                },
                error:error
            })
        },
        post:function (url,json,success,error) {
            if(!error){
                error = function () {
                    toastr.error("请求错误","错误");
                }
            }
            $.ajax({
                url:url,
                type:'POST', //GET
                beforeSend: function(request) {
                    request.setRequestHeader(context.tokenName, sessionStorage.getItem(context.tokenName));
                },
                contentType:  "application/json; charset=utf-8",
                data:JSON.stringify(json),
                dataType:'json',    //返回的数据格式：json/xml/html/script/jsonp/text,
                success:function (data) {
                    if(data.code == sysCode.UN_LOGIN)
                        window.location.href = context.config.serviceName +  context.url.login;
                    else
                        success(data);
                },
                error:error
            })
        },
        delete:function (url,json,success,error) {
            if(!error){
                error = function () {
                    toastr.error("请求错误","错误");
                }
            }
            $.ajax({
                url:url,
                type:'DELETE', //GET
                beforeSend: function(request) {
                    request.setRequestHeader(context.tokenName, sessionStorage.getItem(context.tokenName));
                },
                contentType:  "application/json; charset=utf-8",
                data:JSON.stringify(json),
                dataType:'json',    //返回的数据格式：json/xml/html/script/jsonp/text,
                success:function (data) {
                    if(data.code == sysCode.UN_LOGIN)
                        window.location.href = context.config.serviceName +  context.url.login;
                    else
                        success(data);
                },
                error:error
            })
        },
        put:function (url,json,success,error) {
            if(!error){
                error = function () {
                    toastr.error("请求错误","错误");
                }
            }
            $.ajax({
                url:url,
                type:'PUT', //GET
                data:json,
                dataType:'json',    //返回的数据格式：json/xml/html/script/jsonp/text,
                beforeSend: function(request) {
                    request.setRequestHeader(context.tokenName, sessionStorage.getItem(context.tokenName));
                },
                success:function (data) {
                    if(data.code == sysCode.UN_LOGIN)
                        window.location.href = context.config.serviceName + context.url.login;
                    else
                        success(data);
                },
                error:error
            })
        },
        dataTableAjax:function (url,data) {
           return {
               "type": "PUT",
               "url": url,
               "data": data,
               beforeSend: function (request) {
                   request.setRequestHeader(context.tokenName, sessionStorage.getItem(context.tokenName));
               }
           };
        }
    }
}

/**
 * 系统返回码
 * 与后台约定，不可随意修改
 * @type {{UN_LOADING: number}}
 */
var sysCode = {
    SUCCESS:10000,//请求成功
    SYSTEM_ERROR:10001,//系统错误
    UN_LOGIN:10002,//未登陆
    LOGIN_ERROR_UN_EXIST_NAME_PASSWORD:10003,//用户名或者密码为空
    LOGIN_ERROR_FALIE_NAME_PASSWORD:10004.//用户名或者密码错误
}

/**
 *
 * @type {{}}
 */
var webPageState = {
    isNeedSave : false,//当前页面是否需要保存,默认不需要
}