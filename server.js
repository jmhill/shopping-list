var http = require('http');
var static = require('node-static');

var Items = function() {
    this.items = [];
    this.id = 0;
};

Items.prototype.add = function(name) {
    var item = {name: name, id: this.id};
    this.items.push(item);
    this.id += 1;
};

var items = new Items();
items.add('Broad beans');
items.add('Tomatoes');
items.add('Peppers');

var fileServer = new static.Server('./public');

var server = http.createServer(function (request, response) {
    var urlArray = request.url.split('/');
    if (request.method === 'GET' && request.url === '/items') {
        var responseData = JSON.stringify(items.items);
        response.setHeader('Content-Type', 'application/json');
        response.statusCode = 200;
        response.end(responseData);
    }
    else if (request.method === 'POST' && request.url === '/items') {
        var item = '';
        request.on('data', function (chunk) {
            item += chunk;
        });
        request.on('end', function () {
            try {
                item = JSON.parse(item);
                items.add(item.name);
                response.statusCode = 201;
                response.end();
            }
            catch(e) {
                response.statusCode = 400;
                responseData = {'message': 'Invalid JSON'};
                response.end(JSON.stringify(responseData));
            }
        });
    }
    else if (request.method === 'DELETE' && urlArray[1] === 'items') {
        // TODO: delete items from list
        try {

        }
        catch(e) {
            response.statusCode = 404; //URI NOT FOUND
            response.Data = {'message': 'No item with that id was found'};
            response.end(JSON.stringify(responseData));
        }
    }
    else if (request.method === 'PUT' && urlArray[1] === 'items') {
        // TODO: edit items in list
        try {

        }
        catch(e) {
            response.statusCode = 404;
            response.Data = {'message': 'No item with that id was found'};
            response.end(JSON.stringify(responseData));
        }
    }
    else {
        fileServer.serve(request, response);
    }
});

server.listen(8080, function() {
    console.log('listening on localhost:' + 8080);
});