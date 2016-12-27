var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var AccountSchema = new Schema({
    username: {
        type: String,
        required: true //Todo: maybe rethink this
    },
    password: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    budgets: Array
});

module.exports = mongoose.model("Account", AccountSchema);