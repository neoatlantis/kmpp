define([
    'kmpp.session',
    'kmpp.page',
    'kmpp.xmpp',
    'kmpp.microblog',
    'kmpp.constants',
], function(
    session,
    page,
    xmpp,
    microblog,
    constants
){
    return {
        session: new session(),
        page: new page(),
        xmpp: xmpp,
        microblog: microblog,
        constants: constants,
    };
});
