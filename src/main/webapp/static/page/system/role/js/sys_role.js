
$(function () {
    var vm = new Vue({
        el:"#modelApp",
        data: {
            isShow: false ,//隐藏或者现实列表
            dataTable:null,
            userDataTable:null,
            modal: {
                el: "#editModal",
                title:"新增",
                imgSrc:"http://localhost:8080/assets/layouts/layout2/img/avatar3_small.jpg",
                isHasHardImg:true
            },
            dataFrom:{
                id:null,
                roleCode:null,
                roleName:null
            },
            tagInput:null,//tag代理对象
            url:{
                base:context.config.requestHost + '/sys/role/',
                save:context.config.requestHost + '/sys/role/info',
                rolesList: context.config.requestHost + '/sys/role/datables/list',
                baseList:context.config.requestHost + "/sys/role/list",
                roleUsers:context.config.requestHost + "/sys/user/role/users/",//根据role获取关联的用户列表
                saveUsers:context.config.requestHost + "/sys/user/role/users" ,//保存所有分配的用户
                tree:context.config.requestHost + '/sys/role/menu/tree/', //菜单树
                saveRoleMenu:context.config.requestHost + '/sys/role/menu/tree' //保存角色所分配的应用权限
            },
            //视图控制 1：用户角色视图， 2：角色菜单视图
            viewCrol:{
                USER_ROLE:1,
                ROLE_MENU:2,
                currentView:0,//当前视图
                userRole:{
                    class:'col-md-12',//样式
                    userRoleShow:false,//是否展示分配用户权限页面
                },
                roleMenu:{
                    roleMenuShow:false, //是否展示视图
                }
            },
            //选择当前的角色
            currentRole:{
                id:null,
                roleCode:null,
                roleName:null
            },
        },
        //init后初始化
        mounted:function () {
            var shef = this ;
            this.modal.el = $("#editModal");
            //显示页面
            this.isShow = true;
            this.dataTablesInit();
            this.userDataTablesInit();//用户列表初始化
            this.tagInit();
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
                this.dataTable = $("#dataTable").DataTable({
                    "dom": '<"top">rt<"bottom"flp><"clear">',
                    "serverSide": true,
                    "searching": false,
                    "language": {
                        searchPlaceholder: "输入用户名字"
                    },
                    //服务器加载数据地址
                    "ajax":context.method.dataTableAjax(this.url.rolesList,{
                    /*"id": 451*/
                    }),
                    "columns":[
                        { "data": "id" ,"title":"userId","visible": false,"name": "ID"},
                        { "data": "roleCode" ,"title":"角色编码","name": "ROLE_CODE","searchable":true},
                        { "data": "roleName" ,"title":"角色名称","name": "ROLE_NAME","searchable":false},
                        { "data": "createTime" ,"title":"创建时间","name": "CREATE_TIME","searchable":false},
                        { "data": "updateTime" ,"title":"更新时间","name": "UPDATE_TIME","searchable":false}
                    ],
                    bAutoWidth:false,//自适应宽度
                });
                var shef = this;
                this.dataTable.on("click","tr",function(){//给tr或者td添加dblclick事件
                   if(shef.viewCrol.userRole.userRoleShow || shef.viewCrol.roleMenu.roleMenuShow )
                       shef.viewController();
                })
            },
            /**
             * 用户列表初始化
             */
            userDataTablesInit : function () {
                this.userDataTable = $("#usersTable").DataTable({
                    "dom": '<"top">rt<"bottom"flp><"clear">',
                    "serverSide": true,
                    "bAutoWidth":false,//自适应宽度
                    "searching": false,
                    "language": {
                        searchPlaceholder: "输入用户名字"
                    },
                    //服务器加载数据地址
                    "ajax":context.method.dataTableAjax( context.config.requestHost + '/sys/user/datables/list',{
                        /*"id": 451*/
                    }),
                    "columns":[
                        { "data": "id" ,"title":"userId","visible": false,"name": "ID"},
                        { "data": "userCode" ,"title":"姓名","name": "USER_CODE","searchable":true},
                        { "data": "name" ,"title":"登录名","name": "NAME","searchable":false},
                    ]
                });
                var shef = this;
                this.userDataTable.on("dblclick","tr",function(){//给tr或者td添加dblclick事件
                    var data=shef.userDataTable.row(this).data();//获取值的对象数据
                    //加入tagInput
                    shef.tagInput.tagsinput('add',{'userId':data.id,'name':data.name});
                })
            },
            /**
             * tag 初始化
             */
            tagInit:function () {
                this.tagInput = $('#object_tagsinput');
                this.tagInput.tagsinput({
                    itemValue: 'userId',
                    itemText: 'name'
                });
            },
            /**
             * 初始化树控件
             */
            treeInit:function () {
                //请求路径
                var sheetP = this;
                this.tree = $('#roleMenuTree').jstree({
                    'plugins': [ "wholerow", "checkbox", "types"],
                    'core': {
                        "themes" : {
                            "responsive": false
                        },
                        'data': function (obj, callback) {
                            var shef = this;
                            context.method.get(sheetP.url.tree + sheetP.currentRole.id,function(result) {
                                var jsonarray = result.data;
                                for(var i = 0; i < jsonarray.length; i++){
                                    if(jsonarray[i].data && jsonarray[i].data.type == "HANDLE"){
                                        jsonarray[i].id = "-" + jsonarray[i].id;
                                    }
                                }
                                callback.call(shef, jsonarray);
                            });
                        }
                    },
                    "types" : {
                        "default" : {
                            "icon" : "fa fa-folder icon-state-warning icon-lg"
                        },
                        "file" : {
                            "icon" : "fa fa-file icon-state-warning icon-lg"
                        }
                    }
                }).bind("select_node.jstree",function (obj, e) {
                    // 获取当前节点
                    webPageState.isNeedSave = true;
                }).bind("deselect_node.jstree",function (Object, e,event) {
                    // 获取当前节点
                    webPageState.isNeedSave = true;
                });
            },
            add:function () {
                this.resetting();
                this.modal.title = "新增";
                this.modal.el.modal('show');
            },
            edit:function () {
                this.resetting();
                this.modal.title = "编辑";
                var rows = this.dataTable.rows({selected:true});
                if(rows.data().length != 1){
                    toastr.info("请选择一条记录", "提示");
                    return;
                }
                var self = this;
                context.method.get(self.url.base + rows.data()[0].id ,function (requset) {
                    self.dataFrom = requset.data;
                })
                this.modal.el.modal('show');
            },
            save:function(){
                //表单验证
                if(!this.validate())
                    return
                var shef = this;
                context.method.post(this.url.save,this.dataFrom,function (data) {
                    if(data.code == sysCode.SUCCESS ){
                        toastr.success(data.msg,"成功");
                        shef.dataTable.ajax.reload();
                        shef.modal.el.modal('hide');
                    }else {
                        toastr.error(data.msg,"失败");
                    }
                },function(data){
                    toastr.error("保存失败","失败")
                });
            },
            //表单验证
            validate:function(el){
                return $("#dataFrom").validate({
                    rules:{
                        roleCode:'required',
                        roleName:'required'
                    },
                    messages:{
                        roleCode:null,
                        roleName:null
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
                    context.method.delete(self.url.baseList,{
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
            //重置
            resetting:function () {
                this.dataFrom ={
                    id:null,
                    roleCode:null,
                    roleName:null
                }
            },
            //根据角色id获取所有分配的用户
            getUsersByRoleId:function(){
                //移除
                var items = this.tagInput.tagsinput('items');
                var userIds =new Array();
                for(var itemIndex = 0 ; itemIndex < items.length ; itemIndex++){
                    userIds.push(items[itemIndex].userId);
                }
                for(var iss = 0 ; iss < userIds.length ; iss++){
                    this.tagInput.tagsinput('remove',userIds[iss]);
                }

                var shef = this;
                if(this.currentRole.id != null){
                    context.method.get(this.url.roleUsers+ this.currentRole.id ,function (requset){
                        if(requset.code == sysCode.SUCCESS){
                            //添加标签
                            for(var i = 0 ; i < requset.data.length ; i++){
                                shef.tagInput.tagsinput('add', requset.data[i]);
                            }
                            webPageState.isNeedSave = false;
                        }else {
                            toastr.success(data.msg,"成功")
                        }
                    });
                }
            },
            //添加分配的用户
            addUsers:function () {
                var rows = this.userDataTable.rows({selected:true});
                if(rows.data().length == 0){
                    toastr.info("请选择添加用户", "提示");
                    return;
                }else{
                    for(var rowsIndex=0;rowsIndex<rows.data().length; rowsIndex++){
                        this.tagInput.tagsinput('add',{'userId':rows.data()[rowsIndex].id,'name':rows.data()[rowsIndex].name});
                    }
                }
            },
            //保存分配的用户
            saveUsers:function () {
                var items = this.tagInput.tagsinput('items');
                var userIds =new Array();
                for(var itemIndex = 0 ; itemIndex < items.length ; itemIndex++){
                    userIds.push(items[itemIndex].userId);
                }
                context.method.post(this.url.saveUsers,{
                    roleId :this.currentRole.id,
                    userIds:userIds
                },function (request) {
                    if(request.code == sysCode.SUCCESS){
                        webPageState.isNeedSave = false;
                        toastr.success(request.msg,"成功");
                    }
                    else
                        toastr.error(request.msg,"失败");
                })
            },
            //保存分配的权限
            saveRoleMenu:function () {
                var ref = this.tree.jstree(true);//获得整个树
                var nodeIds = ref.get_selected();
                //所有的菜单数组
                var allNodeIds = new Array();
                //所有的操作数组
                var allHandleIds = new Array();
                //allNodeIds = allNodeIds.concat(nodeIds);
                for(var i=0 ; i < nodeIds.length ;i++){
                    var nodeId = nodeIds[i];
                    var node = ref.get_node(nodeId);
                    //console.log(node.parents);
                    if(node.children.length == 0);{
                        allNodeIds =allNodeIds.concat(node.parents);
                        if(node.data && node.data.type == "HANDLE")//操作节点
                            allHandleIds.push(nodeId.substr(1,nodeId.length));
                        else //非操作节点
                            allNodeIds.push(nodeId);
                    }
                }
                //去重
                for(var i=0;i<allNodeIds.length;i++) {
                    //去跟目录
                    if(allNodeIds[i]=='#'){
                        allNodeIds.splice(i, 1);
                        i--;
                        continue;
                    }
                    //去重
                    for (var j = i+1; j < allNodeIds.length ; j++) {
                        if (allNodeIds[i] == allNodeIds[j]) {
                            allNodeIds.splice(j, 1);
                            j--;
                        }
                    }
                }
                //保存
                context.method.post(this.url.saveRoleMenu,{
                    roleId :this.currentRole.id,
                    menuIds:allNodeIds,
                    handleIds:allHandleIds
                },function (request) {
                    if(request.code == sysCode.SUCCESS){
                        toastr.success(request.msg,"成功");
                        webPageState.isNeedSave = false;
                    }
                    else
                        toastr.error(request.msg,"失败");
                })
            },
            //显示角色-用户关系视图
            autoUserRole:function () {
                this.getUsersByRoleId();
            },
            //退出视图
            outAutoUserRole:function () {
                var shef = this;
               if(webPageState.isNeedSave){
                    //询问框
                    this.$messagebox.show({'title':'询问','describe':'您未保存数据,确定退出吗'},{cb:function () {
                        webPageState.isNeedSave = false;
                        shef.viewCrol.userRole.class = 'col-md-12';
                        shef.viewCrol.userRole.userRoleShow = false;
                        shef.viewCrol.roleMenu.roleMenuShow = false;
                        shef.viewCrol.currentRole = 0;
                    },buttonName:['取消','确定']});
                }else {
                    shef.viewCrol.userRole.class = 'col-md-12';
                    shef.viewCrol.userRole.userRoleShow = false;
                    shef.viewCrol.roleMenu.roleMenuShow = false;
                    shef.viewCrol.currentRole = 0;
                }
            },
            //显示角色-应用授权关系图
            autoRoleMenu:function () {
                if(this.tree != null)
                //清空树
                this.tree.data('jstree', false).empty();

                //重新加载
                this.treeInit();
            },
            //视图控制器
            viewController:function (e) {

                if(webPageState.isNeedSave){
                    var shef = this;
                    //询问框
                    this.$messagebox.show({'title':'询问','describe':'您未保存数据,确定切换吗'},{cb:function () {
                        webPageState.isNeedSave = false;
                        shef.viewShow(e);
                    },buttonName:['取消','确定']});
                }else
                    this.viewShow(e);
            },
            viewShow:function (e) {
                var rows = this.dataTable.rows({selected:true});
                if(rows.data().length != 1){
                    toastr.info("请选择一条记录", "提示");
                    return;
                }
                this.viewCrol.userRole.userRoleShow = true;
                //设置默认的第一个角色
                var rows = this.dataTable.rows({selected:true});
                if(rows.data().length > 0 )
                    this.currentRole = rows.data()[0];

                this.viewCrol.currentRole = (e == null ?this.viewCrol.currentRole:e );
                this.viewCrol.userRole.class = 'col-md-6';
                if(this.viewCrol.currentRole == this.viewCrol.USER_ROLE){
                    this.viewCrol.userRole.userRoleShow = true;
                    this.viewCrol.roleMenu.roleMenuShow = false;
                    this.autoUserRole();
                }
                else if(this.viewCrol.currentRole == this.viewCrol.ROLE_MENU){
                    this.viewCrol.userRole.userRoleShow = false;
                    this.viewCrol.roleMenu.roleMenuShow = true;
                    this.autoRoleMenu();
                }
            }
        }
    })
})

