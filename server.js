var express = require('express');
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();

var Items = function() {
    this.items = [];
    this.id = 0;
};

Items.prototype.add = function(name) {
    var item = {name: name, id: this.id};
    this.items.push(item);
    this.id += 1;
    return item;
};

var items = new Items();
items.add('Broad beans');
items.add('Tomatoes');
items.add('Peppers');

var app = express();
app.use(express.static('public'));

app.get('/items', function(request,response) {
    response.json(items.items)
});

app.post('/items', jsonParser, function(request, response) {
    if (!request.body) {
        return response.sendStatus(400); // Bad request
    }

    var item = items.add(request.body.name);
    response.status(201).json(item); 
});

app.delete('/items/:id', function(request, response){
    var itemID = parseInt(request.params.id);
    // Delete items in list.
    if (typeof itemID === 'number') {
        // Grab the item id from the request url
        var deletedItem;
        // Go through the items array and splice out the deleted item.
        items.items.forEach(function(object, index, itemArray){
            if (object.id === itemID) {
                deletedItem = object;
                return itemArray.splice(index, 1);
            } 
        });
        response.status(202).json(deletedItem); // Accepted
        
    } else {
        var responseData = {'message': 'No item with that id was found'};
        response.status(404).json(responseData); // Not Found
    }
});

app.put('/items/:id', function(request, response){
    // Edit items in list:
    // User hits return and sends JSON data containing the new item object.
    var item = '';
    request.on('data', function (chunk) {
        item += chunk;
    });
    request.on('end', function () {
        try {
            item = JSON.parse(item);
        }
        catch(e) {
            var responseData = {'message': 'Invalid JSON'};
            response.status(400).json(responseData);
        }
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
            response.status(201).json(item); // Created, Send back the item
        } else {
            // This meets the requirements in the project, but 
            // probably not a best practice to have the server just create the thing
            // if there is an error.
            items.add(item.name);
            response.status(201).end(); // Created
        }
    });
});

app.listen(process.env.PORT || 8080);

exports.app = app;
exports.items = items;

/*
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
        var itemID = parseInt(urlArray[2]);
        // Delete items in list.
        if (typeof itemID === 'number') {
            // Grab the item id from the request url
            var deletedItem;
            // Go through the items array and splice out the deleted item.
            items.items.forEach(function(object, index, itemArray){
                if (object.id === itemID) {
                    deletedItem = object;
                    return itemArray.splice(index, 1);
                } 
            });
            response.statusCode = 202; // Accepted
            response.end(JSON.stringify(deletedItem));
        } else {
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
            }
            catch(e) {
                response.statusCode = 400;
                responseData = {'message': 'Invalid JSON'};
                response.end(JSON.stringify(responseData));
            }
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
                response.statusCode = 201; // Created
                response.end(JSON.stringify(item)); // Send back the item
            } else {
                // This meets the requirements in the project, but 
                // probably not a best practice to have the server just create the thing
                // if there is an error.
                items.add(item.name);
                response.statusCode = 201; // Created
                response.end();
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

*/