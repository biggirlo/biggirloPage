/**
 * 该项目仅供学习
 *  如有疑问或建议请致邮箱：645614025@qq.com
 * Created by 王雁欣
 * Date: 2017/10/27
 * Time: 20:15
 */
$(function () {
    var vm = new Vue({
        el: "#menuApp",
        data:{
            isShow: false ,//隐藏或者现实列表
            tree:null,//树代理对象
            dataTable:null,//dataTable代理对象
            url:{
                tree: context.config.requestHost + '/sys/menu/wholeTree',
                menus:context.config.requestHost + '/sys/menu/dataTable/list',
                base:context.config.requestHost + '/sys/menu/',
                save:context.config.requestHost + '/sys/menu/info',
                baselist:context.config.requestHost + "/sys/menu/list"
            },
            menuModal:{
                el:'#editModal',
                title:"新增菜单"
            },
            modelFrom:{
                id:null,
                menuCode:null,
                menuName:null,
                url:null,
                menuIcon:null,
                type:null,
                sort:null,
                parentId:0, //父级id 默认为0
            },
            //详情
            modelInfo:{},
            isDataTableView:true //是否是datatable视图,默认是
        },
        //init后初始化
        mounted:function () {
            //显示页面
            this.isShow = true;
            //初始化树
            this.treeInit();
            //初始化dataTables
            this.dataTablesInit();
            var shef = this
            this.menuModal.el = $("#editModal").on('hidden.bs.modal', function () {
                // 执行一些动作...
                shef.reSetting();
            });
        },
        methods:{
            /**
             * 树控件初始化
             */
            treeInit:function () {
                //请求路径
                var sheetP = this;
                this.tree = $('#menuTree').jstree({
                    'plugins': [ "types"],
                    'core': {
                        "themes" : {
                            "responsive": false
                        },
                        'data': function (obj, callback) {
                                var shef = this;
                                context.method.get(sheetP.url.tree,function(result) {
                                    var jsonarray = result.data;
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
                }).bind("activate_node.jstree", function (obj, e) {
                    //判断是否重复点击
                    if(sheetP.modelFrom.parentId == e.node.id)
                        return;

                    // 获取当前节点
                    sheetP.modelFrom.parentId = e.node.id;

                    //判断是否是子节点
                    if(e.node.children.length == 0){//详情
                        //重置数据模型
                        sheetP.reSetting;
                        context.method.get(sheetP.url.base+ sheetP.modelFrom.parentId ,function (requset) {
                            sheetP.modelInfo = requset.data;
                            if(sheetP.modelInfo.type == 1)
                                sheetP.modelInfo.typeName = '菜单';
                            else
                                sheetP.modelInfo.typeName = '接口';
                            sheetP.isDataTableView = false ;
                            toastr.success('已加载"'+ sheetP.modelInfo.menuName +'"菜单详情',"成功");
                        })
                    }else{
                        //刷新datatable
                        sheetP.dataTable.settings()[0].ajax.data = {
                            "parentId":sheetP.modelFrom.parentId
                        };
                        sheetP.dataTable.ajax.reload();
                        sheetP.isDataTableView = true ;
                        toastr.success("已刷新菜单列表","成功");
                    }
                });
            },
            /**
             * dataTable 初始化
             */
            dataTablesInit:function () {
                var menusUrl = this.url.menus;
                this.dataTable = $("#menuTable").DataTable({
                    "dom": '<"top">rt<"bottom"flp><"clear">',
                    serverSide: true,
                    "searching": false,
                    //服务器加载数据地址
                    "ajax":context.method.dataTableAjax( menusUrl,{
                        "parentId":this.modelFrom.parentId
                     }),
                    "columns":[
                        { "data": "id" ,"title":"userId","visible": false,"name": "ID"},
                        { "data": "menuCode" ,"title":"菜单编码","name": "MENU_CODE","searchable":true},
                        { "data": "menuName" ,"title":"菜单名称","name": "MENU_NAME","searchable":false},
                        { "data": "type" ,"title":"类型","name": "TYPE","searchable":false,
                            render: function(data, type, row, meta) {
                                if (data === 1) {
                                    return '<span class="label label-sm label-success"> 菜单 </span>';
                                } else {
                                    return '<span class="label label-sm btn-danger"> 接口 </span>';
                                }
                            }
                        },
                        { "data": "createTime" ,"title":"创建时间","name": "CREATE_TIME","searchable":false},
                        { "data": "updateTime" ,"title":"更新时间","name": "UPDATE_TIME","searchable":false}
                    ]
                });
            },
            /**
             * 刷新树结构
             */
            refresh:function () {
                this.tree.jstree(true).refresh();
                toastr.success("已刷新菜单树","成功");
            },
            reload:function () {
                this.dataTable.ajax.reload();
            },
            add:function () {
                this.reSetting();
                this.menuModal.title = "新增";
                this.menuModal.el.modal('show');
            },
            edit:function () {
                this.reSetting();
                this.menuModal.title = "编辑";
                var rows = this.dataTable.rows({selected:true});
                if(rows.data().length != 1){
                    toastr.info("请选择一条记录", "提示");
                    return;
                }
                var self = this;
                context.method.get(self.url.base+ rows.data()[0].id ,function (requset) {
                    self.modelFrom = requset.data;
                })
                this.menuModal.el.modal('show');
            },
            save:function(){
                //表单验证
                if(!this.validate())
                    return
                var shef = this;
                context.method.post(this.url.save,this.modelFrom,function (data) {
                    if(data.code == sysCode.SUCCESS ){
                        toastr.success(data.msg,"成功");
                        shef.dataTable.ajax.reload();
                        shef.menuModal.el.modal('hide');
                        shef.refresh();
                        shef.isDataTableView = true;
                    }else {
                        toastr.error(data.msg,"失败");
                    }
                },function(data){
                    toastr.error("保存失败","失败")
                });
            },
            //重置
            reSetting:function () {
                this.modelFrom.id = null;
                this.modelFrom.menuCode = null;
                this.modelFrom.menuName = null;
                this.modelFrom.url = null;
                this.modelFrom.menuIcon = null;
                this.modelFrom.type = null;
                this.modelFrom.sort = null;
            },
            //表单验证
            validate:function(el){
                return $("#modelFrom").validate({
                    rules:{
                        menuCode:'required',
                        menuName:'required',
                        type:'required',

                    },
                    messages:{
                        menuCode:'请输入菜单编码',
                        menuName:'请输入菜单名字',
                        type:'请选择菜单类型',
                    },
                }).form();
            },
            //删除
            del:function () {
                var rows = this.dataTable.rows({selected:true});
                if(rows.data().length == 0){
                    toastr.info("请选择删除记录", "提示");
                    return;
                }
                var self = this;
                this.$messagebox.show({'title':'询问','describe':'您确定删除所选择数据？'},{cb:function () {
                    var ids = new Array();
                    for(var i = 0 ; i < rows.data().length ; i++){
                        ids.push(rows.data()[i].id);
                        var node = self.tree.jstree("get_node",rows.data()[i].id);
                        ids = ids.concat(node.children_d);
                    }
                    context.method.delete(self.url.baselist ,{
                        ids : ids
                    },function (requset) {
                        if(requset.code == sysCode.SUCCESS){
                            self.dataTable.ajax.reload();
                            self.refresh();
                            toastr.success("删除成功","成功");
                        }else {
                            toastr.error(requset.msg,"失败");
                        }
                    })
                },buttonName:['取消','确定']});

            },
        }
    })
})