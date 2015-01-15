/*
 * Session of KMPP
 *
 * A manager of login status. Doesn't really manage login affairs, but just
 * informs the XMPP to do.
 */

define(['crosstab'], function(crosstab){
//////////////////////////////////////////////////////////////////////////////

function session(){
    var self = this;

    this.isLoggedIn = function(){
        return false === localStorage.getItem('credential.password');
    };

    this.logout = function(){
        localStorage.setItem('credential.username', false);
        localStorage.setItem('credential.password', false);
        crosstab.broadcast('session.logout');
    };

    this.login = function(username, password){
        localStorage.setItem('credential.username', username);
        localStorage.setItem('credential.password', password);
        crosstab.broadcast('session.login');
    };

    return this;
};

return new session();

//////////////////////////////////////////////////////////////////////////////
});
