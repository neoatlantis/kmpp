require([
    'jquery',
    'kmpp',
], function(
    $,
    kmpp
){
    var doLogin = false;
    if('login' == kmpp.page.hashtag()){
        kmpp.page.hashtag('');
        doLogin = true;
    } else if(!kmpp.session.isLoggedIn()){
        return kmpp.page.redirect('/login/');
    };

    if(doLogin){
        alert(localStorage.getItem('credential.password'));
    };
});
