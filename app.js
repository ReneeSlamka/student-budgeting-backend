var express = require("express");
var app = express();

// Third party module imports
var mongoose = require("mongoose");
var db = mongoose.connection;
var bodyParser = require("body-parser");
var cookieParser = require("cookie-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(cookieParser());

// Project module imports
var Account = require("./Account.model");
var AccountService = require("./AccountService");
var BudgetService = require("./BudgetService");
var Messages = require("./Messages");

var PORT_NUMBER = process.env.PORT || 3000;
var MONGO_PORT_NUMBER = 27017;
var dbName = "budgetAppBackend";
var url = "mongodb://localhost:" + MONGO_PORT_NUMBER + "/" + dbName;
var deploymentUrl = "mongodb://reneeslamka:pinot91@ds145138.mlab.com:45138/college-kid-budgeter";


// Helper objects to avoid hard-coding

var API_Parameters = {
    username: "username",
    password: "password"
};


var Headers = {
    allowOrigin: "Access-Control-Allow-Origin",
    allowHeaders: "Access-Control-Allow-Headers",
    headerTypes:  "Origin, X-Requested-With, Content-Type, Accept",
    allSymbol: "*"
};


function appShutdown() {
    db.close();
}

function initResponse(response) {
    // Allow cross origin requests
    response.header(Headers.allowOrigin, Headers.allSymbol);
    response.header(Headers.allowHeaders, Headers.headerTypes);
}

// Set up conenction to database
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
mongoose.Promise = global.Promise;
mongoose.connect(deploymentUrl);



// API account functions
app.post("/account", function(request, response) {
    initResponse(response);
    AccountService.createAccount(request, response);
});

app.get("/account/:accountId", function(request,response) {
    initResponse(response);
    AccountService.getAccountInfo(request, response);
});

app.put("/account/:accountId", function(request, response) {
    initResponse(response);
    AccountService.modifyAccount(request, response);
});


// API session functions
app.post("/session", function(request, response) {
    initResponse(response);
    AccountService.login(request, response);
});

app.delete("/session/:accountId", function(request, response) {
    initResponse(response);
    AccountService.logout(request, response);
});


// API budget functions
app.post("/:accountId/budget", function(requestion, response) {
    initResponse(response);
    BudgetService.createBudget();
});

app.get("/:accountId/budget", function(requestion, response) {
    initResponse(response);
    BudgetService.getBudget();
});

app.put("/:accountId/budget", function(requestion, response) {
    initResponse(response);
    BudgetService.modifyBudget();
});

app.post("/:accountId/budget", function(requestion, response) {
    initResponse(response);
    BudgetService.deleteBudget();
});


// API income source functions
app.post("/income-source", function(requestion, response) {
    initResponse(response);
    BudgetService.getIncomeSource();
});

app.put("/income-source", function(requestion, response) {
    initResponse(response);
    BudgetService.modifyIncomeSource();
});

app.get("/income-source", function(requestion, response) {
    initResponse(response);
    BudgetService.getIncomeSource();
});

app.delete("/income-source", function(requestion, response) {
    initResponse(response);
    BudgetService.deleteIncomeSource();
});


// API expense functions
app.post("/expense", function(requestion, response) {
    initResponse(response);
    BudgetService.addExpense();
});

app.put("/expense", function(requestion, response) {
    initResponse(response);
    BudgetService.modifyExpense();
});

app.get("/expense", function(requestion, response) {
    initResponse(response);
    BudgetService.getExpense();
});

app.delete("/expense", function(requestion, response) {
    initResponse(response);
    BudgetService.deleteExpense();
});



app.get("/db-test", function(request, response) {
   initResponse(response);

    Account.find({}).exec(function(err, accounts) {
        if (err) {
            response.send(Messages.invalidCategoryFilter);
        }

    });

});


