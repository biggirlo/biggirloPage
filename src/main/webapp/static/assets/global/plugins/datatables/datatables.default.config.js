/**
 * Created by aixiaoai on 16/6/7.
 */
// 默认禁用搜索和排序
$.extend( $.fn.dataTable.defaults, {
   //允许选择,多选
    select:true,
    //显示加载进度
    "processing": true,
    //本地化
    "language": {
        "url": "../../../assets/global/plugins/datatables/Chinese.json"
    }
    //,
    //表格元素排列,运用BootStrap栅格系统 l = 分页页数,f = 搜索框,B = 按钮, r = 加载进度条, t = 表格主体, i = 分页信息, p = 分页按钮
    //dom: "<'row'<'col-sm-6 col-xs-12'l><'col-sm-6 col-xs-12'f><'col-xs-12'B>r>t<'row'<'col-sm-6 col-xs-12'i><'col-sm-6 col-xs-12'p>>"
} );