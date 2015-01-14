var bosh = require('node-xmpp-bosh');
var httpProxy = require('http-proxy');
var http = require('http');
var fs = require('fs');
var url = require('url');


var boshServer = bosh.start_bosh();

var proxy = httpProxy.createProxyServer({});
var httpServer = http.createServer(function(req, res){
    if(req.url.slice(0, 11) == '/http-bind/'){
        proxy.web(req, res, {target: 'http://127.0.0.1:5280'});
        return;
    };

    var requrl = url.parse(req.url);
    var pathname = requrl.pathname;
    if(pathname.slice(-1) == '/') pathname += 'index.html';
    fs.readFile(
        './web' + pathname, // TODO security risk
        function(err, data){
            if(err){
                res.writeHead(404);
                res.end();
                return
            };
            res.writeHead(200);
            res.end(data);
        }
    );
});
httpServer.listen(8000);
