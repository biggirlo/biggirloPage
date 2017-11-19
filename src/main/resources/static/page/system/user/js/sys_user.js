
$(function () {
    var vm = new Vue({
        el:"#userApp",
        data: {
            isShow: false ,//隐藏或者现实列表
            dataTable:null,
            userModal: {
                el: "#editUserModal",
                title:"新增",
                //imgSrc:"http://localhost:8080/assets/layouts/layout2/img/avatar3_small.jpg",
                isHasHardImg:true
            },
            userFrom:{
                id:null,
                userCode:null,
                password:null,
                name:null,
                isAvailable:null,
                moblie:null,
                email:null,
                hardImg:null,
                remark:null,
                password:null,
                rPassword:null
            },
            url:{
                save:context.config.requestHost + '/sys/user/info'
            },
            isEditPassword:false
        },
        //init后初始化
        mounted:function () {
            var shef = this ;
            this.userModal.el = $("#editUserModal");
            //显示页面
            this.isShow = true;
            this.dataTablesInit();
            this.userModal.imgSrc = null;
            //this.userModal.isHasHardImg = false;
        },
        created: function () {
            // `this` 指向 vm 实例
        },
        methods:{
            /**
             * 初始化
             */
            dataTablesInit : function () {
                this.dataTable = $("#userTable").DataTable({
                    "dom": '<"top">rt<"bottom"flp><"clear">',
                    serverSide: true,
                    "searching": false,
                    "language": {
                        searchPlaceholder: "输入用户名字"
                    },
                    //服务器加载数据地址
                    "ajax":context.method.dataTableAjax(context.config.requestHost + '/sys/user/datables/list',{
                        /*"id": 451*/
                    }),
                    "columns":[
                        { "data": "id" ,"title":"userId","visible": false,"name": "ID"},
                        { "data": "userCode" ,"title":"姓名","name": "USER_CODE","searchable":true},
                        { "data": "name" ,"title":"登录名","name": "NAME","searchable":false},
                        { "data": "isAvailable" ,"title":"是否启用","name": "IS_AVAILABLE","searchable":false,
                            render: function(data, type, row, meta) {
                                if (data === 1) {
                                    return '<span class="label label-sm label-success"> 有效 </span>';
                                } else {
                                    return '<span class="label label-sm label-default"> 禁用 </span>';
                                }
                            }
                        },
                        { "data": "moblie" ,"title":"手机","name": "MOBLIE","searchable":false},
                        { "data": "email" ,"title":"邮箱","name": "EMAIL","searchable":false},
                        { "data": "createTime" ,"title":"创建时间","name": "CREATE_TIME","searchable":false},
                        { "data": "updateTime" ,"title":"更新时间","name": "UPDATE_TIME","searchable":false}
                    ]
                });
            },
            addUser:function () {
                this.resetting();
                this.isEditPassword = false;
                this.userModal.title = "新增";
                this.userModal.el.modal('show');
            },
            editUser:function () {
                this.resetting();
                this.isEditPassword = false;
                this.userModal.title = "编辑";
                var rows = this.dataTable.rows({selected:true});
                if(rows.data().length != 1){
                    toastr.info("请选择一条记录", "提示");
                    return;
                }
                var self = this;
                context.method.get(context.config.requestHost + "/sys/user/" + rows.data()[0].id ,function (requset) {
                    self.userFrom = requset.data;
                    self.userFrom.password = null;
                })
                this.userModal.el.modal('show');
            },
            saveUser:function(){
                //表单验证
                if(!this.userValidate())
                    return
                var shef = this;
                context.method.post(this.url.save,this.userFrom,function (data) {
                    if(data.code == sysCode.SUCCESS ){
                        toastr.success(data.msg,"成功");
                        shef.dataTable.ajax.reload();
                        shef.userModal.el.modal('hide');
                    }else {
                        toastr.error(data.msg,"失败");
                    }

                },function(data){
                    toastr.error("保存失败","失败")
                });
            },
            //表单验证
            userValidate:function(el){
                return $("#userFrom").validate({
                    rules:{
                        userCode:'required',
                        moblie:'required',
                        name:'required',
                        isAvailable:'required',
                        email:'required',
                        password:'required',
                        rPassword:{
                            required: true,
                            equalTo: "#password"
                        }
                    },
                    messages:{
                        userCode:'请输入您的名字',
                        moblie:'请输入您的手机',
                        name:'请输入用户昵称',
                        isAvailable:'请选择是否启用',
                        email:'请输入正确的邮箱',
                        password:'请输入密码',
                        rPassword:{
                            required: "*请输入确认密码",
                            equalTo: "*请再次输入相同的值"
                        }
                    },
                }).form();
            },
            //删除
            del:function () {
                var rows = this.dataTable.rows({selected:true});
                if(rows.data().length == 0){
                    toastr.info("请选择记录", "提示");
                    return;
                }
                var self = this;
                this.$messagebox.show({'title':'询问','describe':'您确定删除所选择数据？'},{cb:function () {
                    var ids = new Array(rows.data().length);
                    for(var i = 0 ; i < rows.data().length ; i++){
                        ids[i] = rows.data()[i].id;
                    }
                    context.method.delete(context.config.requestHost + "/sys/user/list" ,{
                        ids : ids
                    },function (requset) {
                        if(requset.code == sysCode.SUCCESS){
                            self.dataTable.ajax.reload();
                            toastr.success("删除成功","成功");
                        }else {
                            toastr.error(requset.msg,"失败");
                        }
                    })
                },buttonName:['取消','确定']});

            },
            //刷新
            reload:function () {
                this.dataTable.ajax.reload();
                toastr.success("已刷新","成功");
            },
            //重置密码
            resetPassword:function () {
                this.isEditPassword = true;
                this.userModal.title = "修改密码";
                var rows = this.dataTable.rows({selected:true});
                if(rows.data().length != 1){
                    toastr.info("请选择一条记录", "提示");
                    return;
                }
                var self = this;
                context.method.get(context.config.requestHost + "/sys/user/" + rows.data()[0].id ,function (requset) {
                    self.userFrom = requset.data;
                    self.userFrom.password = null;
                })
                this.userModal.el.modal('show');
            },
            //重置
            resetting:function () {
                this.userFrom ={
                    id:null,
                    userCode:null,
                    password:null,
                    name:null,
                    isAvailable:null,
                    moblie:null,
                    email:null,
                    hardImg:null,
                    remark:null,
                    password:null,
                    rPassword:null
                }
            }
        }
    })
})

