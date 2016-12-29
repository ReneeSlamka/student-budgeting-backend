/*
    Account Services module. Handles all account related functionality.
 */

// Project module imports
var Account = require("./Account.model");
var Messages = require("./Messages");
var HelperService = require("./HelperService");

var API_Params = {
    username: "username",
    email: "email",
    password: "password",
    passwordConfirmation: "passwordConfirmation"
};

module.exports = {
    createAccount: function (request, response) {
        var responseObj;
        var tempAccount = {
            username: null,
            email: null,
            password: null,
            passwordConfirmation: null
        };

        // Get provided user credentials from json body
        for (var param in API_Params) {
            if (request.body && request.body[API_Params[param]]) {
                // Return error for empty strings
                if (request.body[API_Params[param]].length === 0) {
                    response.status(422);
                    responseObj = HelperService.createResponseObj(false, Messages.blankParameter(param));
                    response.send(responseObj);
                    return;
                }
                tempAccount[param] = request.body[API_Params[param]];
            } else {
                // Return error message indicating which parameter is missing
                response.status(400);
                responseObj = HelperService.createResponseObj(false, Messages.missingParameter(param));
                response.send(responseObj);
                return;
            }
        }

        // Check for credential validity (Mongoose will handle uniqueness check)
        // Todo: come up with regex requirements for username and password
        if (!HelperService.isValidEmail(tempAccount.email)) {
            response.status(422);
            responseObj = HelperService.createResponseObj(false, Messages.invalidParameter(API_Params.email));
            response.send(responseObj);
            return;
        }

        // Check that password and confirmation password match
        if (tempAccount.password !== tempAccount.passwordConfirmation) {
            response.status(422);
            responseObj = HelperService.createResponseObj(false, Messages.mismatchedPasswords);
            response.send(responseObj);
            return;
        }

        // Create new account in db
        var newAccount = new Account({
            username: tempAccount.username,
            password: tempAccount.password,
            email: tempAccount.email,
            budgets: []
        });

        newAccount.save(function (error) {
            if (error) {
                response.status(500); //Todo: decide on better http error code for db saving error
                response.send(error);//Todo: figure out how to get informative error message
                return;
            }
        });

        response.status(200);
        responseObj = HelperService.createResponseObj(true);
        //Todo: think of better system for creating response objects
        response.send(responseObj);
    },

    getAccountInfo: function() {
        Account.find({}).exec(function(err, accounts) {
            if (err) {
                response.send(Messages.invalidCategoryFilter);
            }
            console.log(accounts);
            response.json(accounts);
        });
    },

    modifyAccount: function(request, response) {

    },

    login: function() {

    },

    logout: function() {

    }
};



function changePassword() {

}

function changeEmail() {

}
