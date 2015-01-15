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

    this.login = function(username, password){
        console.log('Login to [' + username + ']');
        connection.connect(username, password, function(statusCode, err){
            currentConnectionStatus = statusCode;
            switch(statusCode){
                case Strophe.Status.CONNECTING:
                    kp.emit('update.xmpp.connecting');
                    break;
                case Strophe.Status.CONNFAIL:
                    kp.emit('update.xmpp.connfail');
                    break;
                case Strophe.Status.AUTHENTICATING:
                    kp.emit('update.xmpp.authenticating');
                    break;
                case Strophe.Status.AUTHFAIL:
                    kp.emit('update.xmpp.authfail');
                    break;
                case Strophe.Status.CONNECTED:
                    believedCredential = {
                        username: username,
                        password: password,
                    };
                    autoReconnectCounter = 0;
                    kp.emit('update.xmpp.connected');
                    break;
                case Strophe.Status.DISCONNECTED:
                    kp.emit('update.xmpp.disconnected');
                    break;
                case Strophe.Status.DISCONNECTING:
                    kp.emit('update.xmpp.disconnecting');
                    break;
                case Strophe.Status.ATTACHED:
                    kp.emit('update.xmpp.attached');
                    break;
                case Strophe.Status.ERROR:
                default:
                    kp.emit('update.xmpp.error');
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
    kp.on('update.xmpp.disconnected', function(){
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
    })

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
