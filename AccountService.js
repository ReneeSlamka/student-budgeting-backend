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

        var tempAccount = {
            username: null,
            email: null,
            password: null,
            passwordConfirmation: null
        };

        // Get provided user credentials from json body
        for (var param in API_Params) {
            if (request.query && request.query[API_Params[param]]) {
                // Return error for empty strings
                if (request.query[API_Params[param]].length() === 0) {
                    response.status(422);
                    response.send(Messages.blankParameter(param))
                }
                tempAccount[param] = request.query[API_Params[param]];
            } else {
                // Return error message indicating which parameter is missing
                response.status(400);
                response.send(Messages.missingParameter(param));
            }
        }

        // Check for credential validity (Mongoose will handle uniqueness check)
        // Todo: come up with regex requirements for username and password
        if (!HelperService.isValidEmail(tempAccount.email)) {
            response.status(422);
            response.send(Messages.invalidParameter(API_Params.email));
        }

        // Create new account in db


        // Return account (?) and success message (if successful)


        // Else return appropriate error message


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
