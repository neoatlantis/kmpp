define([
    'jquery',
], function(
    $
){
//////////////////////////////////////////////////////////////////////////////

var onCallbacks = {}, onceCallbacks = {};

function page(){
    var self = this;

    this.redirect = function(to){
        window.location = to;
    };

    this.hashtag = function(v){
        if(undefined === v)
            return window.location.hash.slice(1);
        else
            window.location.hash = v;
    };


    //------------------------------------------------------------------//
    // broadcasting system

    var lastStorageEventID = null;
    var pageIdentifyID = String(Math.random()), pageEventCounter = 0;
    function onStorage(){
        try{
            var data = JSON.parse(localStorage.getItem('crosstab'));
        } catch(e){
            return;
        };
        
        var name = data.name, payload = data.data, eventID = data.id;
        if(eventID === lastStorageEventID) return;
        lastStorageEventID = eventID;
        console.log('Received event [' + name + ']', payload);

        if(undefined !== onCallbacks[name])
            for(var i in onCallbacks[name]) onCallbacks[name][i](payload);
        if(undefined !== onceCallbacks[name]){
            for(var i in onceCallbacks[name]) onceCallbacks[name][i](payload);
            delete onceCallbacks[name];
        };
    };
    $(window).on('storage onstorage', onStorage);

    this.emit = function(name, data){
        console.log('Send event [' + name + ']', data);
        localStorage.setItem('crosstab', JSON.stringify({
            name: name,
            data: data,
            id: pageIdentifyID + '-' + String(pageEventCounter++),
        }));
        onStorage();
    };

    this.on = function(name, callback){
        if(undefined === onCallbacks[name])
            onCallbacks[name] = [callback];
        else
            onCallbacks[name].push(callback);
    };

    this.once = function(name, callback){
        if(undefined === onceCallbacks[name])
            onceCallbacks[name] = [callback];
        else
            onceCallbacks[name].push(callback);
    };

    return this;
};

return page;

//////////////////////////////////////////////////////////////////////////////
});
