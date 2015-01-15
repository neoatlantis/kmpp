/*
 * XEP-0083 Nested Roster Groups
 *
 * Retrieves roster. Updated roster will be saved to localStorage.
 */

define(['jquery'], function($){ return function(xmpp, page){
    var self = this;

    function bindHandler(){
        xmpp.once({
            'ns': Strophe.NS.ROSTER,
        }, function(s){
            s.find('item').each(function(){
                console.log($(this).attr('jid'));
            });
        });
    };

    page.on('update.xmpp.connected', function(){
        var s = $build('iq', {type: 'get', id: '0083'})
            .c('query', {xmlns: Strophe.NS.ROSTER}).up()
        ;
        console.log('XEP-0083: Retrieve roster.');
        xmpp.send(s);
        bindHandler();
    });

    return this;
}; });
