/*
    Module containing random helper functions.
 */

module.exports = {
    stringIsNumber: function(string) {
        return string.match(/^[0-9]+$/);
    },

    isValidEmail: function(string) {
        var re = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
        return string.match(re);
    },

    createResponseObj: function(succeededBool, message) {
        var responseObj = {};
        responseObj.succeeded = succeededBool;

        if (message) {
            responseObj.message = message;
        }

        return responseObj;
    }
};
