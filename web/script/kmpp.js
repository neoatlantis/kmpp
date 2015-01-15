define([
    'kmpp.session',
    'kmpp.page',
    'kmpp.xmpp',
], function(
    session,
    page,
    xmpp
){
    return {
        session: new session(),
        page: new page(),
        xmpp: xmpp,
    };
});
