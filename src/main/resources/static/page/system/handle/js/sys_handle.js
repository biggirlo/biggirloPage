/**
 * 该项目仅供学习
 *  如有疑问或建议请致邮箱：645614025@qq.com
 * Created by 王雁欣
 * Date: 2017/10/27
 * Time: 20:15
 */
$(function () {
    var vm = new Vue({
        el: "#handleApp",
        data:{
            isShow: false ,//隐藏或者现实列表
            tree:null,//树代理对象
            dataTable:null,//dataTable代理对象
            url:{
                tree: context.config.requestHost + '/sys/handle/jsTree',
                menus:context.config.requestHost + '/sys/handle/dataTable/list',
                base:context.config.requestHost + '/sys/handle/',
                save:context.config.requestHost + '/sys/handle/info',
                baselist:context.config.requestHost + "/sys/handle/list"
            },
            menuModal:{
                el:'#editModal',
                title:"新增操作"
            },
            modelFrom:{
                id: null,
                menuId :0,
                handleCode:null,
                name:null,
                url:null,
                type:null,
                isAvailable:null
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
            this.menuModal.el = $("#editModal");
        },
        methods:{
            /**
             * 树控件初始化
             */
            treeInit:function () {
                //请求路径
                var sheetP = this;
                this.tree = $('#handleTree').jstree({
                    'plugins': [ "types"],
                    'core': {
                        "themes" : {
                            "responsive": false
                        },
                        'data': function (obj, callback) {
                            var shef = this;
                            context.method.get(sheetP.url.tree,function(result) {
                                var jsonarray = result.data;
                                //修改id,避免冲突
                                for (var i = 0; i < jsonarray.length; i++) {
                                    if (jsonarray[i].data && jsonarray[i].data.type == "HANDLE"){
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
                }).bind("activate_node.jstree", function (obj, e) {
                    //判断是否重复点击
                    if(sheetP.modelFrom.menuId == e.node.id)
                        return;

                    // 获取当前节点
                    sheetP.modelFrom.menuId = e.node.id;

                    //判断是否是子节点且是操作节点
                    if(e.node.children.length == 0 && e.node.data && e.node.data.type == 'HANDLE'){//详情

                        //重置数据模型
                        sheetP.reSetting;
                        context.method.get(sheetP.url.base+ sheetP.modelFrom.menuId.substr(1,sheetP.modelFrom.menuId.length) ,function (requset) {
                            sheetP.modelInfo = requset.data;
                            if(sheetP.modelInfo.isAvailable == 1)
                                sheetP.modelInfo.isAvailableName = '启用';
                            else
                                sheetP.modelInfo.isAvailableName = '停用';
                            sheetP.isDataTableView = false ;
                            toastr.success('已加载"'+ sheetP.modelInfo.name +'"操作详情',"成功");
                        })
                    }else{
                        //刷新datatable
                        sheetP.dataTable.settings()[0].ajax.data = {
                            "menuId":sheetP.modelFrom.menuId
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
                        "menuId":this.modelFrom.menuId
                    }),
                    "columns":[
                        { "data": "id" ,"title":"userId","visible": false,"name": "ID"},
                        { "data": "handleCode" ,"title":"操作编码","name": "HANDLE_CODE","searchable":true},
                        { "data": "name" ,"title":"操作名称","name": "NAME","searchable":false},
                        { "data": "url" ,"title":"请求路径","name": "URL","searchable":false},
                        { "data": "type" ,"title":"方法类型","name": "TYPE","searchable":false},
                        { "data": "isAvailable" ,"title":"类型","name": "IS_AVAILABLE","searchable":false,
                            render: function(data, type, row, meta) {
                                if (data === 1) {
                                    return '<span class="label label-sm label-success"> 启用 </span>';
                                } else {
                                    return '<span class="label label-sm btn-danger"> 停用 </span>';
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
                this.reSetting()
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
                this. modelFrom.id = null;
                this. modelFrom.handleCode = null;
                this. modelFrom.name = null;
                this. modelFrom.url = null;
                this. modelFrom.type = null;
                this. modelFrom.isAvailable = null;
            },
            //表单验证
            validate:function(el){
                return $("#modelFrom").validate({
                    rules:{
                        handleCode:'required',
                        name:'required',
                        type:'required',
                        isAvailable:'required'
                    },
                    messages:{
                        handleCode:'请输入操作编码',
                        name:'请输入操作名称',
                        type:'请输入方法类型',
                        isAvailable:"请选择请用类型"
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
                    var ids = new Array(rows.data().length);
                    for(var i = 0 ; i < rows.data().length ; i++){
                        ids[i] = rows.data()[i].id;
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