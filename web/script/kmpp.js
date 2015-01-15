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
        session: session,
        page: page,
        xmpp: xmpp,
    };
});
