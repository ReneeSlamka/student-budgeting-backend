
module.exports = {
    dbConnected: "Connected successfully to server",
    dbConnectionError: "Error: Unable to connect to database",
    dbError: function(errorMessage) {
        return "The following database error occurred: " + errorMessage;
    },
    accountNotFound: "Account not found. Either it does not exist or invalid email " +
    "was entered.",
    invalidPriceFilter: "Error: At least one of your filters is invalid. " +
    "Filter inputs can be positive, whole numbers only.",
    invalidCategoryFilter: "Error: Invalid category filter",

    missingParam: function(param) {
        return "Your request was missing the following parameter: " + param;
    },

    blankParam: function(param) {
        return "Empty strings are not legal values for " + param;
    },

    invalidParameter: function(param) {
        return "The provided " + param + " was invalid. Please try again with a different one.";
    },

    mismatchedPasswords: "Error: Password and confirmation password do not match.",
    duplicateEmail: "An account already exists with this email. Please use another one.",
    incorrectPassword: "The password you entered is incorrect. Please try again.",
    invalidSessionId: "Either account not currently logged in or the session id provided is invalid."
};

