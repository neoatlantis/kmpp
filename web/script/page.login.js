require(['jquery', 'kmpp'], function($, kmpp){
$(function(){
//////////////////////////////////////////////////////////////////////////////

$('input').on('keypress', function(){
    $('.error').hide();
});

$('button[name="login"]').click(function(){
    var username = $('input[name="username"]').val().trim(),
        password = $('input[name="password"]').val().trim();

    if('' == username || '' == password){
        $('.error[data-type="empty-credentials"]').show();
        return;
    };


});

//////////////////////////////////////////////////////////////////////////////
}); });
