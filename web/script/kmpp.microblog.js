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

    function readStanza(s){
        var child = s.find('[xmlns="' + kmppConstants.NS.MICROBLOG + '"]');
        if(child.length < 1) return;
        var encrypted = ('true' == child.attr('encrypted').toLowerCase());
        var text = child.text().trim();
        // TODO more
    };

    
    kp.on('command.microblog.publish', function(argv){
        xmpp.send(buildStanza(argv.to, argv.text));
    });

    xmpp.on({ name: 'message', }, readStanza);

    return this;
};

return microblog;

//////////////////////////////////////////////////////////////////////////////
});
