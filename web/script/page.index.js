require([
    'jquery',

    'kmpp',
], function(
    $,
    kmpp
){
    if(!kmpp.session.isLoggedIn()) return kmpp.page.redirect('/login/');

});
