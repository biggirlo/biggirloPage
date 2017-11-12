/**
 * Created by wangyanxin on 2017/10/8
 */
$.validator.setDefaults({
    errorElement: 'span', //default input error message container
    errorClass: 'help-block help-block-error',
    highlight: function (element) { // hightlight error inputs
        $(element)
            .closest('.input-group').addClass('has-error'); // set error class to the control group
    },
    unhighlight: function (element) { // revert the change done by hightlight
        $(element)
            .closest('.input-group').removeClass('has-error'); // set error class to the control group
    },
    success: function (label) {
        label
            .closest('.input-group').removeClass('has-error'); // set success class to the control group
    },
    errorPlacement: function(error, element) {
        error.appendTo(element.parent().parent());
    }
});