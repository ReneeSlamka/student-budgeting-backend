var express = require("express");
var app = express();

var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var db = mongoose.connection;
var bodyParser = require("body-parser");
var Account = require("./Account.model");


var PORT_NUMBER = process.env.PORT || 3000;
var MONGO_PORT_NUMBER = 27017;
var dbName = "budgetAppBackend";
var url = "mongodb://localhost:" + MONGO_PORT_NUMBER + "/" + dbName;
var deploymentUrl = "mongodb://reneeslamka:pinot91@ds145138.mlab.com:45138/college-kid-budgeter";


// Helper objects to avoid hard-coding
var Collections = {
    products: "products"
};

var API_Parameters = {
    lowestPrice: "lowestprice"
};

var Categories = {
    tech: "tech"
};

var Messages = {
    dbConnected: "Connected successfully to server",
    dbConnectionError: "Error: Unable to connect to database",
    noResultsFound: "No results found",
    invalidPriceFilter: "Error: At least one of your filters is invalid. " +
    "Filter inputs can be positive, whole numbers only.",
    invalidCategoryFilter: "Error: Invalid category filter"
};

var Headers = {
    allowOrigin: "Access-Control-Allow-Origin",
    allowHeaders: "Access-Control-Allow-Headers",
    headerTypes:  "Origin, X-Requested-With, Content-Type, Accept",
    allSymbol: "*"
};


// Mongoose schemas

var BudgetSchema = new Schema({
    accountId: {
        type: Number,
        required: true,
        unique: true
    },
    budgetName: {
        type: String,
        required: true
    },
    //balance: Number, Todo: rethink this
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    incomeSources: Array,
    expenses: Array
});


function appShutdown() {
    database.close();
}

function stringIsANumber(string) {
    return string.match(/^[0-9]+$/);
}


/*
 Initialize global database handle
 */
//console.log(url);
//mongoClient.connect(url, function(err, db) {
//    //assert.equal(null, err);
//    if (err) {
//        console.log(Messages.dbConnectionError);
//    } else {
//        console.log(Messages.dbConnected);
//        database = db;
//    }
//});
db.on("error", console.error.bind(console, Messages.dbConnectionError));
db.once("open", function(){
    console.log(Messages.dbConnected);
});

// Handle SIGTERM and SIGINT (ctrl-c) nicely
process.once('SIGTERM', appShutdown);
process.once('SIGINT', appShutdown);


// Set app to list on PORT_NUMBER
app.listen(PORT_NUMBER);
console.log("Running on port: " + PORT_NUMBER);
mongoose.connect(deploymentUrl);

app.get('/products', function(request, response) {

    // Allow cross origin requests
    response.header(Headers.allowOrigin, Headers.allSymbol);
    response.header(Headers.allowHeaders, Headers.headerTypes);
    //Set response
    response.send("Stuff");
    //Set response HTTP code
});

app.get("/db-test", function(request, response) {
    // Allow cross origin requests
    response.header(Headers.allowOrigin, Headers.allSymbol);
    response.header(Headers.allowHeaders, Headers.headerTypes);

    Account.find({}).exec(function(err, accounts) {
        if (err) {
            response.send(Messages.invalidCategoryFilter);
        }
        console.log(accounts);
        response.json(accounts);
    });

});


