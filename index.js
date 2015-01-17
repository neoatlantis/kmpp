var bosh = require('node-xmpp-bosh');
var http = require('http');
var fs = require('fs');
var url = require('url');

//////////////////////////////////////////////////////////////////////////////




//////////////////////////////////////////////////////////////////////////////

var boshServer = bosh.start_bosh();
var wsServer = bosh.start_websocket(boshServer);

var httpServer = http.createServer(function(req, res){

    var requrl = url.parse(req.url);
    var pathname = requrl.pathname;
    if(pathname.slice(-1) == '/') pathname += 'index.html';
    fs.readFile(
        './web/_site' + pathname, // TODO security risk
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
