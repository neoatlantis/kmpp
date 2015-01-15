require(['jquery', 'kmpp'], function($, kmpp){
$(function(){
//////////////////////////////////////////////////////////////////////////////

if(kmpp.session.isLoggedIn()) return kmpp.page.redirect('/');
kmpp.page.on('session.login', function(){
    kmpp.page.redirect('/#login');
});

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

    kmpp.session.login(username, password);
});

//////////////////////////////////////////////////////////////////////////////
}); });
