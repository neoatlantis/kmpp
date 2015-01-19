/*
 * handler of http requests starting with '/storage/'
 *
 */
var buffer = require('buffer'),
    nodePersistStorage = require('node-localstorage').LocalStorage,
    nodePersistEncrypted = require('./node-persist-encrypted.js');

var storages = {};

//////////////////////////////////////////////////////////////////////////////

function getStorage(username, password){
    if(!/^[0-9a-z]{1,255}$/i.test(username)) return null;
    if(undefined == storages[username]){
        try{
            storages[username] = new nodePersistEncrypted(
                new nodePersistStorage('./storage/' + username),
                password
            );
        } catch(e){
            return null;
        };
    } else {
        if(!storages[username].verifyPassphrase(password)) return null;
    };
    return storages[username];
};

module.exports.getDecryptedStorage = function(username){
    if(storages[username]) return storages[username];
    return null;
};

//////////////////////////////////////////////////////////////////////////////

function extractHTTPBasicAuthPassword(headers){
    var auth = headers['authorization'];
    if(undefined === auth) return null;
    try{
        if('Basic ' != auth.slice(0, 6)) return null;
        auth = auth.slice(6);
        var authstr = new buffer.Buffer(auth, 'base64').toString('ascii');
        var username = authstr.slice(0, authstr.indexOf(':')),
            password = authstr.slice(username.length + 1);
        return {username: username, password: password};
    } catch(e){
        return null;
    };
};

module.exports.httpHandler = function(req, res){
    var pathname = req._.pathname;
    var requestPath = pathname.slice('/storage'.length);

    var authed = false;
    var credential = extractHTTPBasicAuthPassword(req.headers);
    if(credential){
        var username = credential.username,
            password = credential.password;
        var storage = getStorage(username, password);
        authed = (null != storage);
    };

    if(!authed){
        res.writeHead(401, {
            'WWW-Authenticate': 'Basic realm="Please login to proceed."',
        });
        res.write('Login required.');
        res.end();
        return;
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
                'Not found. Use PUT method to submit a JSON entry for this.'
            );
            res.end();
            return;
        };
        res.writeHead(200);
        res.end(JSON.stringify(found));
        return;
    } else if ('PUT' == req.method || 'POST' == req.method){
        var data = '';
        function doPut(d){
            try{
                var obj = JSON.parse(data);
            } catch(e){
                res.writeHead(400);
                res.end('Bad request. Data may be bad formatted.');
                return;
            };
            storage.setItem(key, obj);
            res.writeHead(204);
            res.end();
            return;
        };
        req.on('data', function(d){ data += d; });
        req.on('end', function(d){ if(d) data += d; doPut(data); });
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
