require([
    'kmpp',
], function(
    kmpp
){
    
    kmpp.session.logout();
    kmpp.page.redirect('/');

});
