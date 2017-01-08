/*
    Account Services module. Handles all account related functionality.
 */

// Project module imports
var Account = require("./Account.model");
var Session = require("./Session.model");
var Messages = require("./Messages");
var SessionService = require("./SessionService");
var HelperService = require("./HelperService");
var _ = require('lodash');

var QueryParams = {
    username: "username",
    email: "email",
    password: "password",
    newPassword: "newPassword",
    passwordConfirmation: "passwordConfirmation"
};

var CookieParams = {
    sessionId: "sessionId"
};

module.exports = {
    createAccount: function (request, response) {
        var requestParams = {};
        var requiredParams = _.cloneDeep(QueryParams);
        delete requiredParams.oldPassword;

        // Get provided user credentials from json body
        var paramsValid = getRequestParams(request.body, response, requestParams, requiredParams);
        if (!paramsValid) return;

        // Check for credential validity (Mongoose will handle uniqueness check)
        // Todo: come up with regex requirements for username and password
        if (!HelperService.isValidEmail(requestParams.email)) {
            response.status(422);
            response.send(HelperService.createResponseObj(false, Messages.invalidParameter(QueryParams.email)));
            return;
        }

        // Check that password and confirmation password match
        if (requestParams.password !== requestParams.passwordConfirmation) {
            response.status(422);
            response.send(HelperService.createResponseObj(false, Messages.mismatchedPasswords));
            return;
        }

        // Check that not a duplicate account
        Account.findOne({"email" : requestParams.email}).then(function(account) {
            if (account) {
                response.status(422);
                response.send(HelperService.createResponseObj(false, Messages.duplicateEmail));
            } else {
                // Create new account in db
                var newAccount = new Account({
                    username: requestParams.username,
                    password: requestParams.password,
                    email: requestParams.email,
                    budgets: []
                });

                newAccount.save(function (error, account) {
                    if (error) {
                        response.status(500); //Todo: decide on better http error code for db saving error
                        response.send(HelperService.createResponseObj(false, Messages.dbError(error)));
                        return;
                    } else {
                        response.status(200);
                        response.send(HelperService.createResponseObj(true));
                        //Todo: think of better system for creating response objects
                    }
                });
            }
        }).catch(function(error) {
            response.status(500);
            response.send(HelperService.createResponseObj(false, Messages.dbError(error)));
        });
    },

    getAccountInfo: function(request, response) {
        var responseObj;
        var tempAccountId;
        // Extract and validate accountId
        if (request.params && request.params.accountId) {
            tempAccountId = request.params.accountId;
        } else {
            response.status(400);
            response.send(HelperService.createResponseObj(false, Messages.missingParam("accountId")));
            return;
        }
        // Get sessionId from cookie
        var tempSessionId;
        if (request.cookies && request.cookies[CookieParams.sessionId]) {
            tempSessionId = request.cookies[CookieParams.sessionId];
        } else {
            response.status(400);
            response.send(HelperService.createResponseObj(false, Messages.missingParam(CookieParams.sessionId)));
            return;
        }

        var sessionValid = SessionService.validateSessionId(tempSessionId, tempAccountId, response);
        if (!sessionValid) return;

        Account.findById(tempAccountId, {'_id': 0}).select('username budgets').then(function(account) {
            if (account) {
                // Todo: add session token check to replace password check
                response.status(200);
                responseObj = HelperService.createResponseObj(true);
                responseObj.account = account;
                response.send(responseObj);
            } else {
                response.status(404);
                response.send(HelperService.createResponseObj(false, Messages.accountNotFound));
            }
        }).catch(function(error) {
            response.status(500);
            response.send(HelperService.createResponseObj(false, Messages.dbError(error)));
        });
    },

    modifyAccount: function(request, response) {
        // Extract account params from request body
        var tempAccountId;
        var requestParams = {};
        var requiredParams = _.cloneDeep(QueryParams);

        // Get accountId from url
        if (request.params && request.params.accountId) {
            tempAccountId = request.params.accountId;
        } else {
            response.status(400);
            response.send(HelperService.createResponseObj(false, Messages.missingParam("accountId")));
            return;
        }

        // Get sessionId from cookie
        var tempSessionId;
        if (request.cookies && request.cookies[CookieParams.sessionId]) {
            tempSessionId = request.cookies[CookieParams.sessionId];
        } else {
            response.status(400);
            response.send(HelperService.createResponseObj(false, Messages.missingParam(CookieParams.sessionId)));
            return;
        }

        var sessionValid = SessionService.validateSessionId(tempSessionId, tempAccountId, response);
        if (!sessionValid) return;

        // Remove unnecessary info that is not being changed
        if (!request.body[QueryParams.newPassword]) {
            delete requiredParams[QueryParams.newPassword];
            delete requiredParams[QueryParams.passwordConfirmation];
        }
        if (!request.body[QueryParams.username]) {
            delete requiredParams[QueryParams.username];
        }
        delete requiredParams[QueryParams.email];

        if (!request.body[QueryParams.newPassword] && !request.body[QueryParams.username]) {
            response.status(401);
            response.send(HelperService.createResponseObj(false, Messages.missingParam("username and/or newPassword")));
            return;
        }

        var paramsValid = getRequestParams(request.body, response, requestParams, requiredParams);
        if (!paramsValid) return;

        // If password change check that new password and confirmation entry match
        if (requestParams.newPassword && requestParams.passwordConfirmation &&
            requestParams.newPassword != requestParams.passwordConfirmation) {
            response.status(422);
            response.send(HelperService.createResponseObj(false, Messages.mismatchedPasswords));
            return;
        }

        // Use params to find account and make changes
        Account.findById(tempAccountId).then(function(account) {
            if (!account) {
                response.status(404);
                response.send(HelperService.createResponseObj(false, Messages.accountNotFound));
                return;
            } else {
                // Check password is correct
                if (account[QueryParams.password] !== requestParams[QueryParams.password]) {
                    response.status(401);
                    response.send(HelperService.createResponseObj(false, Messages.incorrectPassword));
                    return;
                }

                if (requestParams[QueryParams.username]) {
                    account[QueryParams.username] = requestParams[QueryParams.username];
                }
                if (requestParams[QueryParams.newPassword]) {
                    account[QueryParams.password] = requestParams[QueryParams.newPassword];
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

    login: function(request, response) {
        // Get credentials and validate correctness
        var requestParams = {};
        var requiredParams = {
            email: QueryParams.email,
            password: QueryParams.password
        };

        var paramsValid = getRequestParams(request.body, response, requestParams, requiredParams);
        if (!paramsValid) return;

        // Todo: necessary to checking email format for validity every time?
        // Todo: refactor the code below into a function that accepts and "else" function (getting repetitive)
        Account.findOne({"email" : requestParams.email}).then(function(account) {
            if (!account) {
                response.status(404);
                response.send(HelperService.createResponseObj(false, Messages.accountNotFound));
                return;
            } else {
                // Check password is correct
                if (account[QueryParams.password] != requestParams[QueryParams.password]) {
                    response.status(401);
                    response.send(HelperService.createResponseObj(false, Messages.incorrectPassword));
                    return;
                }
                SessionService.createNewSession(account['_id'], response);
            }
        }).catch(function(error) {
            response.status(500);
            response.send(HelperService.createResponseObj(false, Messages.dbError(error)));
        });
    },

    logout: function(request, response) {
        var tempAccountId;
        // Extract and validate accountId
        if (request.params && request.params.accountId) {
            tempAccountId = request.params.accountId;
        } else {
            response.status(400);
            response.send(HelperService.createResponseObj(false, Messages.missingParam("accountId")));
            return;
        }

        Account.findById(tempAccountId).then(function(account) {
            if (!account) {
                response.status(404);
                response.send(HelperService.createResponseObj(false, Messages.accountNotFound));
                return;
            }
        }).catch(function(error) {
            response.status(500);
            response.send(HelperService.createResponseObj(false, Messages.dbError(error)));
            return;
        });

        // Extract and validate sessionId from cookie
        var tempSessionId;

        if (request.cookies && request.cookies[CookieParams.sessionId]) {
            tempSessionId = request.cookies[CookieParams.sessionId];
        } else {
            response.status(400);
            response.send(HelperService.createResponseObj(false, Messages.missingParam(CookieParams.sessionId)));
            return;
        }

        var sessionValid = SessionService.validateSessionId(tempSessionId, tempAccountId, response);
        if (!sessionValid) return;
        SessionService.invalidateSessionId(tempSessionId, response);
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