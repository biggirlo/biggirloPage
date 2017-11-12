$(function () {
    index.init();
})
var index = {
    url:{
        menus:'/sys/menu/tree',
        error404:''
    },
    //初始化
    init:function(){
        index.method.menus(context.config.requestHost + index.url.menus);
    },
    method: {
        /**
         *加载页面
         * @param url
         * @param unShowMsg 是否提示信息 默认提示
         */
        loadPage : function(url,unShowMsg){
            userState.isNeedSave = false;
            $.ajax({
                url: url,
                cache: false,
                success:function(data){
                    //加载页面
                    $("#pageBody").html('').html(data);
                    //加载js
                    var paths = $("#pageSrcipt").val();
                    if(paths){
                        var pathArray = paths.split(",");
                        for(var i = 0 ; i < pathArray.length ; i++){
                            index.method.loadScript(context.config.serviceName + pathArray[i]);
                        }
                    }
                    if(!unShowMsg)
                        toastr.success('加载成功！','成功');
                },
                error:function(jqXHR, textStatus, errorThrown) {
                    if(!url ||  jqXHR.status == 404 || jqXHR.status  == 0) {
                        toastr.error("找不到指定页面！","失败");
                        index.method.loadPage("/page/error/404.html",true);
                    }else
                        toastr.error("加载失败！","失败");
                }
            });
        },
        /**
         * 加载菜单的方法
         * @param url
         */
        menus:function (url) {
            context.method.get(url,function(datas){
                //加载页面
                if(datas.code === 10000 ){
                    var html = index.method.menusHtml(datas.data);
                    $(".page-sidebar .page-sidebar-menu").append(html);
                    toastr.success('加载成功！','成功');
                    index.method.menuClick();
                }else {
                    toastr.error("加载菜单失败！","失败");
                }
            })

        },
        /**
         * 菜单按钮
         */
        menuClick:function () {
            $(".page-sidebar-menu>.nav-item>a").focus(function(){
                $(".page-sidebar-menu>li.active2").removeClass("active2");
                $(this).parents(".nav-item").addClass("active2");
            });

            //加载页面
            $(".nav-link").click(function () {
                var liA = $(this);
                if(liA.next("ul").length === 0){
                    var heardHtml ="";
                    heardHtml = liA.find(".title").eq(0).html();
                    while(liA.parent().parent().prev().length === 1){
                        heardHtml = liA.parent().parent().prev().find(".title").html() +
                            '&nbsp;'+'<i class="fa fa-chevron-right"></i>'+ heardHtml;
                        liA = liA.parent().parent().parent();
                    }
                    heardHtml = '<i class="fa fa-home"></i>' + heardHtml;
                    $("#page-breadcrumb").html(heardHtml);
                   index.method.loadPage(context.config.serviceName + $(this).attr("urlpage"));
                }
            })
        },
        /**
         * 加载js文件
         * @param url
         */
        loadScript:function (url) {
            jQuery.getScript(url);
        },
        menusHtml:function (datas) {
            var html = '';
            for(var i = 0 ; i<datas.length ; i++){
                html += '<li class="nav-item">';
                html += '<a href="javascript:;" class="nav-link nav-toggle" urlpage="'+datas[i].url+'">';
                html += '<i class="'+datas[i].menuIcon+'"></i>';
                html += '<span class="title">&nbsp;'+datas[i].menuName+'</span>';
                if(datas[i].menus.length > 0){
                    html += '<span class="arrow"></span>';
                }
                html += '</a>';
                if(datas[i].menus.length > 0) {
                    html +='<ul class="sub-menu">';
                    html += index.method.menusHtml(datas[i].menus);
                    html += '</ul>';
                }
            }
            return html;
        }
    }
}






