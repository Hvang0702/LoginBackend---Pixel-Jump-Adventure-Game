const express = require('express'); //requiring a package
const keys = require('./config/keys.js');
const app = express();
const bodyParser = require('body-parser');

//parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}));

// setting up DB
const mongoose = require('mongoose');
// console.log(keys.mongoURI);
mongoose.connect(keys.mongoURI, {useNewUrlParser: true, useUnifiedTopology: true});

// Setup database models
require('./model/Account');

// Setup the routes
require('./routes/authenticationRoutes')(app);

app.listen(keys.port, () => {
    console.log("listening on " + keys.port);
});

