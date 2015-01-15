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
        return false === localStorage.getItem('credential.password');
    };

    this.logout = function(){
        new kmppPage().broadcast('session.logout');
        localStorage.setItem('credential.username', false);
        localStorage.setItem('credential.password', false);
    };

    this.login = function(username, password){
        new kmppPage().broadcast('session.login');
        localStorage.setItem('credential.username', username);
        localStorage.setItem('credential.password', password);
    };

    return this;
};

return session;

//////////////////////////////////////////////////////////////////////////////
});
