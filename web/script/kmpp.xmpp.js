/*
 * XMPP class
 *
 * The XMPP class is only used in `index.html`. Exported is not a factory
 * function.
 */
var xepIncludes = [
    '0083',
];


var depList = ['kmpp.page', 'jquery'];
for(var i in xepIncludes) depList.push('xep/' + xepIncludes[i]);

define(depList, function(){
//////////////////////////////////////////////////////////////////////////////

var kmppPage = arguments[0];
var $ = arguments[1];
var xepStart = 2;
var xeps = {};
for(var i=0; i<xepIncludes.length; i++) 
    xeps[xepIncludes[i]] = arguments[i + xepStart];

function xmpp(){
    var self = this;

    var connection = new Strophe.Connection(
        "ws://" + window.location.hostname + ":5280/",
        {protocol: 'wss'}
    );

    var kp = new kmppPage();

    var believedCredential = false;
    var autoReconnectCounter = 0, autoReconnectMax = 5;
    var currentConnectionStatus = -1;

    this.getStatus = function(){
        return currentConnectionStatus;
    };

    this.util = {};

    this.util.normalizeJID = function(v){
        var t = /^(.+@[0-9a-z\-_\.]+)(\/.+)?$/i.exec(v);
        if(t) return t[1];
        return null;
    };

    this.login = function(username, password){
        console.log('Login to [' + username + ']');
        connection.connect(username, password, function(statusCode, err){
            currentConnectionStatus = statusCode;
            switch(statusCode){
                case Strophe.Status.CONNECTING:
                    kp.emit('update.xmpp.connection.connecting');
                    break;
                case Strophe.Status.CONNFAIL:
                    kp.emit('update.xmpp.connection.connfail');
                    break;
                case Strophe.Status.AUTHENTICATING:
                    kp.emit('update.xmpp.connection.authenticating');
                    break;
                case Strophe.Status.AUTHFAIL:
                    kp.emit('update.xmpp.connection.authfail');
                    break;
                case Strophe.Status.CONNECTED:
                    believedCredential = {
                        username: username,
                        password: password,
                    };
                    autoReconnectCounter = 0;
                    kp.emit('update.xmpp.connection.connected');
                    break;
                case Strophe.Status.DISCONNECTED:
                    kp.emit('update.xmpp.connection.disconnected');
                    break;
                case Strophe.Status.DISCONNECTING:
                    kp.emit('update.xmpp.connection.disconnecting');
                    break;
                case Strophe.Status.ATTACHED:
                    kp.emit('update.xmpp.connection.attached');
                    break;
                case Strophe.Status.ERROR:
                default:
                    kp.emit('update.xmpp.connection.error');
                    break;
            };
        });
    };

    this.send = function(v){
        connection.send(v);
    };

    this.on = function(match, callback){
        var ref = connection.addHandler(
            function(v){ callback($(v)); return true; },
            match.ns,
            match.name,
            match.type,
            match.id,
            match.from,
            match.options
        );
        return function remove(){ connection.deleteHandler(ref); };
    };

    this.once = function(match, callback){
        var ref = connection.addHandler(
            function(v){ callback($(v)); return false; },
            match.ns,
            match.name,
            match.type,
            match.id,
            match.from,
            match.options
        );
        return function remove(){ connection.deleteHandler(ref); };
    };

    // auto reconnect for at most autoReconnectMax times
    kp.on('update.xmpp.connection.disconnected', function(){
        if(autoReconnectCounter >= autoReconnectMax) return;
        if(false === believedCredential) return;
        console.log('(' + (autoReconnectCounter + 1) + '/' + autoReconnectMax + ') Reconnect retry.');
        setTimeout(function(){
            self.login(
                believedCredential.username,
                believedCredential.password
            );
            autoReconnectCounter += 1;
        }, (autoReconnectCounter + 1) * 5000);
    });


    // send presence
    var defaultPresenceShow = 'chat';
    function sendPresence(show, to, type){
        console.log('Sending presence...');
        if(['away', 'chat', 'dnd', 'xa'].indexOf(show) < 0)
            show = defaultPresenceShow;

        var pAttr = {};
        if(undefined != to && undefined != type){
            pAttr.to = to;
            pAttr.type = type;
        }
        var stanza = $build('presence', pAttr) //to: to, type: type})
            .c('show').t(show).up()
            .c('status').t('').up()
        ;
        self.send(stanza);
    };
    kp.on('command.xmpp.presence', function(v){
        if(v.show) defaultPresenceShow = v.show;
        if(Strophe.Status.CONNECTED == self.getStatus())
            sendPresence(v.show, v.to, v.type);
    });
    kp.on('update.xmpp.connection.connected', function(){
        sendPresence();
    });

    // load xeps
    var loadedXEPs = {};
    for(var i in xeps){
        console.log('Load XEP-' + i);
        loadedXEPs[i] = new xeps[i](self, kp);
    };

    return this;
};


return xmpp;
//////////////////////////////////////////////////////////////////////////////
});
