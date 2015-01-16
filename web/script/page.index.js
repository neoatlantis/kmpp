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

function bindRosterDisplay(kmpp){ // XEP-0083, see script/xep/0083.js
    function generateOnRosterItemClick(jid){
        return function(e){
            $('.chat-window').hide();
            $('.roster-item').each(function(){
                if(jid == $(this).attr('data-jid'))
                    $(this).toggleClass('roster-item-active');
                else
                    $(this).removeClass('roster-item-active');
            });
            if($(this).hasClass('roster-item-active')){
                var chatWindow = $('.chat-window[data-jid="' + jid + '"]');
                if(chatWindow.length < 1){
                    $('<iframe>')
                        .attr('data-jid', jid)
                        .attr('src', './chat.html#' + jid)
                        .attr('frameBorder', 0)
                        .attr('seamless', 'seamless')
                        .addClass('chat-window')
                        .appendTo('body')
                        .show()
                    ;
                    return;
                };
                chatWindow.show();
            };
        };
    };
    kmpp.page.on('update.xmpp.roster.refresh', function(){
        var roster = JSON.parse(localStorage.getItem('roster'));

        $('.contact-list').empty();
        for(var jid in roster){
            $('.contact-list').append(
                $('<div>')
                    .addClass('roster-item')
                    .attr('data-jid', jid)
                    .append(
                        $('<div>').text(roster[jid].name)
                            .addClass('title')
                    )
                    .append($('<div>').text(jid).addClass('subtitle'))
                    .click(generateOnRosterItemClick(jid))
            );
        };
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
    bindRosterDisplay(kmpp);

}); });
