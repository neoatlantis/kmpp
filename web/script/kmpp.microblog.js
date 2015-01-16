define([
    'jquery',
    'kmpp.page',
    'kmpp.constants',
], function(
    $,
    kmppPage,
    kmppConstants
){
//////////////////////////////////////////////////////////////////////////////

function microblog(xmpp){
    var self = this;
    var kp = new kmppPage();

    function buildStanza(to, text){
        return $build('message', {to: to})
            .c('body').t('KMPP Microblog Entry').up()
            .c('x', {xmlns: kmppConstants.NS.MICROBLOG, encrypted: false})
            .t(text)
        ;
    };

    
    kp.on('command.microblog.publish', function(argv){
        xmpp.send(buildStanza(argv.to, argv.text));
    });

    xmpp.on({
        ns: kmppConstants.NS.MICROBLOG,
    }, function(s){
        
    });


    return this;
};

return microblog;

//////////////////////////////////////////////////////////////////////////////
});
