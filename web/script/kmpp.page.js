define([
    'jquery',
], function(
    $
){
//////////////////////////////////////////////////////////////////////////////

function page(){
    var self = this;

    this.redirect = function(to){
        window.location = to;
    };


    //------------------------------------------------------------------//
    // broadcasting system

    var onCallbacks = {}, onceCallbacks = {};
    $(window).on('message', function(e){
        var data = e.originalEvent.data;
        // TODO security check of data origin !!!
        var name = data.name, data = data.data;

        if(undefined !== onCallbacks[name])
            for(var i in onCallbacks[name]) onCallbacks[name][i](data);
        if(undefined !== onceCallbacks[name]){
            for(var i in onceCallbacks[name]) onceCallbacks[name][i](data);
            delete onceCallbacks[name];
        };
    });

    this.broadcast = function(name, data){
        window.postMessage({
            name: name,
            data: data, // XXX SECURITY RISK
        }, '*', []); // XXX SECURITY RISK
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
