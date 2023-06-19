const mongoose = require('mongoose');
const {Schema} = mongoose; //it stores Schema inside of a field

const accountSchema = new Schema({
    username: String,
    password: String,
    salt: String,

    lastAuthentication: Date, 
});

mongoose.model('accounts', accountSchema);