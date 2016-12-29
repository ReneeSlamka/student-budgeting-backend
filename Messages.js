
module.exports = {
    dbConnected: "Connected successfully to server",
    dbConnectionError: "Error: Unable to connect to database",
    noResultsFound: "No results found",
    invalidPriceFilter: "Error: At least one of your filters is invalid. " +
    "Filter inputs can be positive, whole numbers only.",
    invalidCategoryFilter: "Error: Invalid category filter",

    missingParameter: function(param) {
        return "Your request was missing the following parameter: " + param;
    },

    blankParameter: function(param) {
        return "Empty strings are not legal values for " + param;
    },

    invalidParameter: function(param) {
        return "The provided " + param + " was invalid. Please try again with a different one.";
    },

    mismatchedPasswords: "Error: Password and confirmation password do not match."
};

