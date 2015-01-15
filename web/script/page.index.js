function startXMPPConnector(kmpp){
    var xmpp = new kmpp.xmpp();

    kmpp.page.on('command.xmpp.login', function(){
        alert('do login');
        xmpp.login(
            localStorage.getItem('credential.username'),
            localStorage.getItem('credential.password')
        );
    });

    kmpp.page.on('command.xmpp.existence', function(){
        kmpp.page.broadcast('answer.xmpp.existence');
    });
};

//////////////////////////////////////////////////////////////////////////////

require([
    'jquery',
    'kmpp',
], function(
    $,
    kmpp
){ $(function(){
    $('.status-text').hide();

    var xmppExisted = false;
    kmpp.page.on('answer.xmpp.existence', function(){
        xmppExisted = true;
    });
    setTimeout(function(){
        if(!xmppExisted){
            new startXMPPConnector(kmpp);
            kmpp.page.broadcast('command.xmpp.login');
            kmpp.page.hashtag('');
        } else if(!kmpp.session.isLoggedIn()){
            return kmpp.page.redirect('/login/');
        };
    }, 100);
    kmpp.page.broadcast('command.xmpp.existence');



}); });
