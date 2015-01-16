function startLocomotive(kmpp){
    var xmpp = new kmpp.xmpp(),
        microblog = new kmpp.microblog(xmpp);

    kmpp.page.on('command.xmpp.login', function(){
        xmpp.login(
            localStorage.getItem('credential.username'),
            localStorage.getItem('credential.password')
        );
    });

    kmpp.page.on('command.xmpp.existence', function(){
        kmpp.page.emit('answer.xmpp.existence');
    });

    // test
    kmpp.page.on('update.xmpp.connection.connected', function(){
        /*kmpp.page.emit('command.microblog.publish', {
            to: 'neoatlantis@wtfismyip.com',
            text: 'test',
        });*/
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
        new startLocomotive(kmpp);
        kmpp.page.emit('command.xmpp.login');
    }, 20);
    kmpp.page.emit('command.xmpp.existence');

    bindStatusDisplay(kmpp);

}); });
