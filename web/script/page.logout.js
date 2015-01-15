require([
    'jquery',

    'kmpp',
], function(
    $,
    kmpp
){
    
    kmpp.session.logout();
    kmpp.page.redirect('/');

});
