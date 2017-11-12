$(function () {
    var vm = new Vue({
        el:"#userApp",
        data: {
            userForm:{
                userCode:null,
                password:null
            },
            url:{
                login:context.config.requestHost + '/system/login',
                index : '/',
            }
        },
        mounted:function () {

        },
        created: function () {
            // `this` 指向 vm 实例
        },
        methods:{
            login:function () {
                //表单验证
                if(!this.userValidate())
                    return
                var indexUrl = this.url.index;
                context.method.post(this.url.login,this.userForm,function (data) {
                    if(data.code == sysCode.SUCCESS ){
                        sessionStorage.setItem(context.tokenName ,data.data);
                        window.location.href = context.config.base + indexUrl ;
                    }

                },function(data){
                    toastr.error("登录失败","失败")
                });
            },
            userValidate:function (el) {
                return $("#userForm").validate({
                    rules:{
                        userCode:'required',
                        password:'required'
                    },
                    messages:{
                        userCode:'请输入您的编码',
                        password:'请输入您的密码'
                    },
                }).form();
            }
        }
    })
})