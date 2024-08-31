const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const handleSchema = new Schema({
    user: {
        type: String,
        required: true
    },
    handle: {
        type: String,
        required: true
    }
}, {timestamps: true});

const Handle = mongoose.model('Handle', handleSchema);
module.exports = Handle;