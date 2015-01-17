var buddyJID, roster;

//////////////////////////////////////////////////////////////////////////////

function onRosterRefresh(){
    roster = JSON.parse(localStorage.getItem('roster'));
    var buddyEntry = roster[buddyJID] || {};
    var buddyName = buddyEntry.name || '';
    $('.buddyName').text(buddyName);
    $('.buddyJID').text(buddyJID);
};

function changePageSafetyImplication(safe){
    $('textarea,body,.chat-history').addClass(
        (safe?'implicit-safe':'implicit-unsafe')
    );
};

function onResize(){
    $('.chat-history')
        .css(
            'height',
            ($(window).height() - $('.chat-box-container').height()) + 'px'
        )
    ;
};

function getCallbackOnSendMessage(kmpp, jid){
    return function(){
        var val = $('textarea[name="text"]').val();
        var uid = kmpp.xmpp.prototype.util.uniqueID();
        kmpp.page.emit('command.xmpp.send.chat', {
            to: jid,
            body: val,
            receipt: uid,
        });
    };
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

    buddyJID = kmpp.page.hashtag();

    $(window).on('resize', onResize);
    onResize();

    kmpp.page.on('update.xmpp.roster.refresh', onRosterRefresh);
    onRosterRefresh();

    changePageSafetyImplication(false);

    var onSendMessage = getCallbackOnSendMessage(kmpp, buddyJID);
    $('.send-message').click(onSendMessage);
    $('textarea[name="text"]').on('keypress', function(e){
        if(e.ctrlKey && 13 == e.keyCode) onSendMessage();
    });

}); });
