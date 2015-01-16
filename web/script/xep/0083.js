/*
 * XEP-0083 Nested Roster Groups
 *
 * Retrieves roster. Updated roster will be saved to localStorage.
 */

define(['jquery'], function($){ return function(xmpp, page){
    var self = this;

    var delimiter = false;

    function retrieveDelimiter(){
        xmpp.once({
            ns: Strophe.NS.PRIVATE,
            id: '00831',
        }, function(s){
            var got = s.find('roster').text();
            if('' !== got) delimiter = got;
            retrieveRoster();
        });
        xmpp.send(
            $build('iq', {type: 'get', id: '00831'})
                .c('query', {xmlns: Strophe.NS.PRIVATE})
        );
    };

    function retrieveRoster(){
        xmpp.once({
            'ns': Strophe.NS.ROSTER,
        }, function(s){
            var roster = {};
            s.find('item').each(function(){
                var jid = xmpp.util.normalizeJID($(this).attr('jid'));
                if(!jid) return;
                roster[jid] = {};

                var group = $(this).find('group').text();
                if(group){
                    roster[jid].group = group;
                    if(delimiter)
                        roster[jid].groupSplit = group.spit(delimiter);
                };
            });
            localStorage.setItem('roster', JSON.stringify(roster));
            page.emit('update.xmpp.roster.refresh');
        });

        xmpp.send(
            $build('iq', {type: 'get', id: '00832'})
                .c('query', {xmlns: Strophe.NS.ROSTER})
        );
        console.log('XEP-0083: Retrieve roster.');
    };

    page.on('command.xmpp.roster.refresh', retrieveRoster);

    page.on('update.xmpp.connection.connected', retrieveDelimiter);

    return this;
}; });
