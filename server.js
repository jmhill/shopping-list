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
        // Delete items in list.
        try {
            // Grab the item id from the request url
            var itemID = urlArray[2];
            // Go through the items array and splice out the deleted item.
            items.items.forEach(function(object, index, itemArray){
                if (object.id == itemID) {
                    return itemArray.splice(index, 1);
                } 
            });
            response.statusCode = 204; //No Content
            response.end(); // ??? Return the deleted object?
        }
        catch(e) {
            response.statusCode = 404; //URI NOT FOUND
            responseData = {'message': 'No item with that id was found'};
            response.end(JSON.stringify(responseData));
        }
    }
    else if (request.method === 'PUT' && urlArray[1] === 'items') {
        // Edit items in list:
        // User hits return and sends JSON data containing the new item object.
        var item = '';
        request.on('data', function (chunk) {
            item += chunk;
        });
        request.on('end', function () {
            try {
                item = JSON.parse(item);
                // Check to make sure the item already exists by filtering the array by ID
                var itemCheck = items.items.filter(function(element){
                    return element.id === item.id;
                });
                if (itemCheck.length > 0) {
                    // Once the new shopping item JSON object is received and parsed,
                    // go through the items array and replace the old item with the new.
                    items.items.forEach(function(object, index, itemArray) {
                        if (object.id == item.id) {
                            itemArray[index] = item;
                        }
                    });
                    response.statusCode = 201;
                    response.end(); // ?? Return the edited object?
                } else {
                    items.add(item.name);
                    response.statusCode = 201;
                    response.end();
                }
            }
            catch(e) {
                response.statusCode = 400;
                responseData = {'message': 'Invalid JSON'};
                response.end(JSON.stringify(responseData));
            }
        });
    }
    else {
        fileServer.serve(request, response);
    }
});

server.listen(8080, function() {
    console.log('listening on localhost:' + 8080);
});