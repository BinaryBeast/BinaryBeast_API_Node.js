var http = require('http');



http.createServer(function(request, response) {

	response.writeHead(200);
	response.end('Test!!');

}).listen(80);
