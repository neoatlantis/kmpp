/*
 * message queue for incoming/outgoing messages
 *
 * for outgoing messages: this queue caches the messages, synchnorizes it to
 * the backend persist storage, and do P2P-encryption. On event of connected,
 * messages will be sent.
 *
 * For incoming messages: this queue caches the messages, synchnorizes it to
 * the backend persist storage, and do P2P-decryption. Messages will be marked
 * as unread until the user reads it. Receipt of reading will also be sent.
 */

define([
    'kmpp.page',
    'kmpp.constants',
], function(
    kmppPage,
    kmppConstants
){
//////////////////////////////////////////////////////////////////////////////

function queue(xmpp){
    var self = this;
    var kp = new kmppPage();

    

    return this;
};

return queue;

//////////////////////////////////////////////////////////////////////////////
});
