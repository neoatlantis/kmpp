/*
 * handler of http requests starting with '/storage/'
 *
 */
var buffer = require('buffer'),
    nodePersistStorage = require('node-persist'),
    nodePersistEncrypted = require('./node-persist-encrypted.js');

var storage = null;

//////////////////////////////////////////////////////////////////////////////

nodePersistStorage.initSync();

//////////////////////////////////////////////////////////////////////////////

module.exports.getStorage = function(){
    return storage;
};

//////////////////////////////////////////////////////////////////////////////

function extractHTTPBasicAuthPassword(headers){
    var auth = headers['authorization'];
    if(undefined === auth) return null;
    try{
        if('Basic ' != auth.slice(0, 6)) return null;
        auth = auth.slice(6);
        return new buffer.Buffer(auth, 'base64').slice(1);
    } catch(e){
        return null;
    };
};

module.exports.httpHandler = function(req, res){
    var pathname = req._.pathname;
    var requestPath = pathname.slice('/storage'.length);

    if(null == storage){
        var authed = false;
        var password = extractHTTPBasicAuthPassword(req.headers);
        if(password){
            try{
                storage = new nodePersistEncrypted(
                    nodePersistStorage,
                    password
                );
                authed = true;
            } catch(e){
            };
        };

        if(!authed){
            res.writeHead(401, {
                'WWW-Authenticate': 'Basic realm="Please login to proceed."',
            });
            res.write('Login required.');
            res.end();
            return;
        };
    };

    if('/' == requestPath){
        res.writeHead(200);
        res.write(storage.keys().join('\n'));
        res.end();
        return;
    };

    var key = requestPath.slice(1);
    if('GET' == req.method){
        var found = storage.getItem(key);
        if(null == found){
            res.writeHead(404);
            res.write(
                'Not found. Use PUT method to submit an entry for this.'
            );
            res.end();
            return;
        };
        res.writeHead(200);
        res.end(JSON.stringify(found));
        return;
    } else if ('PUT' == req.method || 'POST' == req.method){
        
    } else if ('DELETE' == req.method){
        storage.removeItem(key);
        res.writeHead(204);
        res.end();
        return;
    } else {
        res.writeHead(405);
        res.end('Bad method.');
        return;
    };
};

// TODO use `username` at HTTP AUTH to differentiate users. Storage paths are
// also to be different.
