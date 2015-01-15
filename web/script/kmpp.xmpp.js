/*
 * XMPP class
 *
 * The XMPP class is only used in `index.html`. Exported is not a factory
 * function.
 */
define([
], function(
){
//////////////////////////////////////////////////////////////////////////////

function xmpp(){
    var self = this;

    var connection = new Strophe.Connection("/http-bind/");

    this.login = function(username, password){
        connection.connect(username, password, function(statusCode, err){
            switch(statusCode){
                case Strophe.Status.CONNECTING:
                    break;
                case Strophe.Status.CONNFAIL:
                    break;
                case Strophe.Status.AUTHENTICATING:
                    break;
                case Strophe.Status.AUTHFAIL:
                    break;
                case Strophe.Status.CONNECTED:
                    break;
                case Strophe.Status.DISCONNECTED:
                    break;
                case Strophe.Status.DISCONNECTING:
                    break;
                case Strophe.Status.ATTACHED:
                    break;
                case Strophe.Status.ERROR:
                default:
                    break;
            };
        });
    };


    return this;
};


return xmpp;
//////////////////////////////////////////////////////////////////////////////
});
