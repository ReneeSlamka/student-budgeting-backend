var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var SessionSchema = new Schema({
    accountId: {
        type: String, //todo: re-add once sure what type this is
        required: true,
        unique: false
    },
    sessionId: {
        type: String,
        required: true,
        unique: true
    },
    timestamp: {
        type: Date,
        required: true,
        default: Date.now
    }
});

module.exports = mongoose.model("Session", SessionSchema);