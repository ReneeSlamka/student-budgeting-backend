/*
    Session Services module. Contains methods relevant to authentication.
 */

// Project module imports
var Session = require("./Session.model");
var Messages = require("./Messages");
var HelperService = require("./HelperService");

module.exports = {

    createNewSession: function(tempAccountId, response) {
        // Create new session record and save
        var tempSessionId = generateSessionId(tempAccountId);
        var newSession = new Session({
            accountId: tempAccountId.toString(),
            sessionId: tempSessionId,
            timestamp: +new Date
        });

        newSession.save(function (error) {
            if (error) {
                response.status(500); //Todo: decide on better http error code for db saving error
                response.send(HelperService.createResponseObj(false, Messages.dbError(error)));
            } else {
                // Return session token as header cookie
                response.status(200);
                response.cookie('sessionId', tempSessionId, {httpOnly: true});
                response.send(HelperService.createResponseObj(true));
            }
        });
    },

    /*
        method to valid session id accompanying account activity requests. Returns true
        if session id is valid, false if it is not.
     */
    validateSessionId: function(sessionId, accountId, response) {
        Session.findOne({"sessionId" : sessionId}).then(function(session) {
            if (!session) {
                response.status(404);
                response.send(HelperService.createResponseObj(false, Messages.invalidSessionId));
                return false;
            } else if (session.accountId != accountId) {
                response.status(401);
                response.send(HelperService.createResponseObj(false, "Error: either accountId or sessionId is invalid"));
                return false;
            }
            return true;
        }).catch(function(error) {
            response.status(500);
            response.send(HelperService.createResponseObj(false, Messages.dbError(error)));
            return false;
        });
    },

    invalidateSessionId: function(sessionId, response) {
        Session.remove({"sessionId" : sessionId}, function(error) {
            if (error) {
                response.status(500);
                response.send(HelperService.createResponseObj(false, Messages.dbError(error)));
            } else {
                response.status(200);
                response.send(HelperService.createResponseObj(true));
            }
        });
    }
};

function generateSessionId(accountId) {
    var randomNum = Math.floor((Math.random() * 100) + 1);
    return accountId.toString() + "-" + randomNum.toString();
}


