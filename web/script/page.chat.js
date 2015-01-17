var buddyJID, roster;

//////////////////////////////////////////////////////////////////////////////


function onRosterRefresh(){
    roster = JSON.parse(localStorage.getItem('roster'));
    var buddyEntry = roster[buddyJID] || {};
    var buddyName = buddyEntry.name || '';
    $('.buddyName').text(buddyName);
    $('.buddyJID').text(buddyJID);
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

    kmpp.page.on('update.xmpp.roster.refresh', onRosterRefresh);
    onRosterRefresh();

}); });
