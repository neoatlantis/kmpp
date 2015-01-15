/*
 * Session of KMPP
 *
 * A manager of login status. Doesn't really manage login affairs, but just
 * informs the XMPP to do.
 */

define(['kmpp.page'], function(kmppPage){
//////////////////////////////////////////////////////////////////////////////

function session(){
    var self = this;

    this.isLoggedIn = function(){
        return Boolean(localStorage.getItem('credential.password'));
    };

    this.logout = function(){
        localStorage.removeItem('credential.username');
        localStorage.removeItem('credential.password');
        new kmppPage().broadcast('session.logout');
    };

    this.login = function(username, password){
        localStorage.setItem('credential.username', username);
        localStorage.setItem('credential.password', password);
        new kmppPage().broadcast('session.login');
    };

    return this;
};

return session;

//////////////////////////////////////////////////////////////////////////////
});
