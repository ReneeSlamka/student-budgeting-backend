/*
    Account Services module. Handles all account related functionality.
 */

// Project module imports
var Account = require("./Account.model");
var Messages = require("./Messages");
var HelperService = require("./HelperService");
var _ = require('lodash');

var API_Params = {
    username: "username",
    email: "email",
    password: "password",
    oldPassword: "oldPassword",
    passwordConfirmation: "passwordConfirmation"
};

module.exports = {
    createAccount: function (request, response) {
        var responseObj;
        var requestParams = {};
        var requiredParams = _.cloneDeep(API_Params);
        delete requiredParams.oldPassword;

        // Get provided user credentials from json body
        var paramsValid = getRequestParams(request.body, response, requestParams, requiredParams);
        if (!paramsValid) {
            return;
        }

        // Check for credential validity (Mongoose will handle uniqueness check)
        // Todo: come up with regex requirements for username and password
        if (!HelperService.isValidEmail(requestParams.email)) {
            response.status(422);
            responseObj = HelperService.createResponseObj(false, Messages.invalidParameter(API_Params.email));
            response.send(responseObj);
            return;
        }

        // Check that password and confirmation password match
        if (requestParams.password !== requestParams.passwordConfirmation) {
            response.status(422);
            responseObj = HelperService.createResponseObj(false, Messages.mismatchedPasswords);
            response.send(responseObj);
            return;
        }

        // Check that not a duplicate account
        Account.findOne({"email" : requestParams.email}).then(function(account) {
            if (account) {
                response.status(422);
                responseObj = HelperService.createResponseObj(false, Messages.duplicateEmail);
                response.send(responseObj);
            } else {
                // Create new account in db
                var newAccount = new Account({
                    username: requestParams.username,
                    password: requestParams.password,
                    email: requestParams.email,
                    budgets: []
                });

                newAccount.save(function (error) {
                    if (error) {
                        response.status(500); //Todo: decide on better http error code for db saving error
                        response.send(HelperService.createResponseObj(false, Messages.dbError(error)));
                        return;
                    }
                });

                response.status(200);
                responseObj = HelperService.createResponseObj(true);
                response.send(responseObj);
                //Todo: think of better system for creating response objects
            }
        }).catch(function(error) {
            response.status(500);
            responseObj = HelperService.createResponseObj(false, Messages.dbError(error));
            response.send(responseObj);
        });
    },

    getAccountInfo: function(request, response) {
        var responseObj;
        var requestParams = {};
        var queryObject = {};
        var requiredParams = {
            email: API_Params.email,
        };
        var paramsValid = getRequestParams(request.query, response, requestParams, requiredParams);
        if (!paramsValid) {
            return;
        }
        if (HelperService.isValidEmail(requestParams.email)) {
            queryObject.email = requestParams.email;
        }

        Account.findOne(queryObject, {'_id': 0}).select('username budgets').then(function(account) {
            if (account) {
                // Todo: add session token check to replace password check
                response.status(200);
                responseObj = HelperService.createResponseObj(true);
                responseObj.account = account;
                response.send(responseObj);
            } else {
                response.status(404);
                responseObj = HelperService.createResponseObj(false, Messages.accountNotFound);
                response.send(responseObj);
            }
        }).catch(function(error) {
            response.status(500);
            responseObj = HelperService.createResponseObj(false, Messages.dbError(error));
            response.send(responseObj);
        });
    },

    modifyAccount: function(request, response) {
        // Extract account params from request body
        var requestParams = {};
        var requiredParams = _.cloneDeep(API_Params);

        // Remove unnecessary info that is not being changed
        if (!request.body[API_Params.password]) {
            delete requiredParams[API_Params.password];
            delete requiredParams[API_Params.passwordConfirmation];
        }

        if (!request.body[API_Params.username]) {
            delete requiredParams[API_Params.username];
        }

        var paramsValid = getRequestParams(request.body, response, requestParams, requiredParams);
        if (!paramsValid) {
            return;
        }

        // If password change check that new password and confirmation entry match
        if (requestParams.password && requestParams.passwordConfirmation &&
            requestParams.password != requestParams.passwordConfirmation) {
            response.status(422);
            response.send(HelperService.createResponseObj(false, Messages.mismatchedPasswords));
            return;
        }

        // Use params to find account and make changes
        Account.findOne({"email" : requestParams.email}).then(function(account) {
            if (!account) {
                response.status(404);
                response.send(HelperService.createResponseObj(false, Messages.accountNotFound));
                return;
            } else {
                // Check password is correct
                if (account[API_Params.password] !== requestParams[API_Params.oldPassword]) {
                    response.status(401);
                    response.send(HelperService.createResponseObj(false, Messages.incorrectPassword))
                    return;
                }

                for (var attribute in requestParams) {
                    if (account[attribute] && account[attribute] !== requestParams[attribute]) {
                        account[attribute] = requestParams[attribute];
                    }
                }
            }
            // Save updated version of account (return error if db error occurs)
            account.save(function (error) {
                if (error) {
                    response.status(500); //Todo: decide on better http error code for db saving error
                    response.send(HelperService.createResponseObj(false, Messages.dbError(error)));
                    return;
                }
            });
            response.status(200);
            response.send(HelperService.createResponseObj(true));
        });
    },

    login: function() {

    },

    logout: function() {

    }
};

/*
    Function to extract params from either JSON body or query object of request (i.e. first param is
    either request.body or request.query). Returns FALSE if one or more are missing or empty strings.
 */
function getRequestParams(requestParamSrc, response, paramContainerObj, requiredParams) {
    // Get provided user credentials from json body
    for (var param in requiredParams) {
        if (requestParamSrc && requestParamSrc[requiredParams[param]]) {
            // Return error for empty strings
            if (requestParamSrc[requiredParams[param]].length === 0) {
                response.status(422);
                response.send(HelperService.createResponseObj(false, Messages.blankParam(param)));
                return false;
            }
            paramContainerObj[param] = requestParamSrc[requiredParams[param]];
        } else {
            // Return error message indicating which parameter is missing
            response.status(400);
            response.send(HelperService.createResponseObj(false, Messages.missingParam(param)));
            return false;
        }
    }
    return true;
}