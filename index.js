var Server = require('todo-server');
var Engine = require('engine.io-stream/server');
var http = require('http');
var browserify = require('browserify');
var ecstatic = require('ecstatic');

var todoServer = new Server(__dirname + '/db');

var serve = ecstatic(__dirname + '/static');

var server = http.createServer(function (req, res) {
  if (/^\/bundle\.js/.test(req.url)) {
    res.writeHead(200, { 'Content-Type' : 'application/javascript' });
    browserify(__dirname + '/browser/index.js')
      .bundle()
      .pipe(res);
    return;
  }

  serve(req, res);
});

server.listen(4000, function () {
  console.log('~> http://localhost:4000');
});

var engine = Engine(function (con) {
  todoServer.getDocument(function (err, doc) {
    if (err) return con.end(JSON.stringify(err));
    con.pipe(doc.createStream()).pipe(con);
  });
});

engine.attach(server, '/engine');
