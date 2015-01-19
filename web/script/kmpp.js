define([
    'kmpp.session',
    'kmpp.page',
    'kmpp.xmpp',
    'kmpp.queue',
    'kmpp.microblog',
    'kmpp.constants',
], function(
    session,
    page,
    xmpp,
    queue,
    microblog,
    constants
){
    return {
        session: new session(),
        page: new page(),
        xmpp: xmpp,
        queue: queue,
        microblog: microblog,
        constants: constants,
    };
});
