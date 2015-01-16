function startXMPPConnector(kmpp){
    var xmpp = new kmpp.xmpp();

    kmpp.page.on('command.xmpp.login', function(){
        xmpp.login(
            localStorage.getItem('credential.username'),
            localStorage.getItem('credential.password')
        );
    });

    kmpp.page.on('command.xmpp.existence', function(){
        kmpp.page.emit('answer.xmpp.existence');
    });
};

//////////////////////////////////////////////////////////////////////////////

function bindStatusDisplay(kmpp){
    $('.status-text').hide();
    function getCallback(name){
        return function(){
            $('.status-text').hide();
            $('#status-' + name).show();
        };
    };
    var list = [
        'connecting',
        'connfail',
        'authenticating',
        'authfail',
        'connected',
        'disconnected',
        'disconnecting',
        'attached', 
        'error'
    ];
    for(var i in list)
        kmpp.page.on('update.xmpp.connection.' + list[i], getCallback(list[i]));
};

//////////////////////////////////////////////////////////////////////////////

require([
    'jquery',
    'kmpp',
], function(
    $,
    kmpp
){ $(function(){
    if(!kmpp.session.isLoggedIn()) return kmpp.page.redirect('/login/');

    var xmppExisted = false;
    kmpp.page.on('answer.xmpp.existence', function(){
        xmppExisted = true;
    });
    setTimeout(function(){
        if(xmppExisted) return;
        new startXMPPConnector(kmpp);
        kmpp.page.emit('command.xmpp.login');
    }, 20);
    kmpp.page.emit('command.xmpp.existence');

    bindStatusDisplay(kmpp);

}); });
