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
}); });
