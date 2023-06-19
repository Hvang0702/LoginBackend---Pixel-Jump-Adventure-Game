const mongoose = require('mongoose');
const Account = mongoose.model('accounts'); //has to be beneath

const argon2i = require('argon2-ffi').argon2i; 
const crypto = require('crypto');

const passwordRegex = new RegExp("(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,24})");

module.exports = app => {

    //Routes
    app.post('/account/login', async (req, res) => {

        var response = { };


        const { rUsername, rPassword } = req.body;
        if(rUsername == null || !passwordRegex.test(rPassword) ){
            response.code = 1;
            response.msg = "Invalid credentials";
            res.send(response);
            return;
        }

        var userAccount = await Account.findOne({ username: rUsername}, 'username adminFlag password' );
        console.log(userAccount);
        if(userAccount != null){
            //if the account is already found
            argon2i.verify(userAccount.password, rPassword).then(async (success) => {
                if(success) {
                    userAccount.lastAuthentication = Date.now();
                    await userAccount.save();

                    response.code = 0; //success is 0
                    response.msg = "Account found";
                    response.data = (({username,adminFlag}) => ({username, adminFlag}) )(userAccount);
                    res.send(response);

                    return;
                } else {
                    response.code = 1;
                    response.msg = "Invalid credentials";
                    res.send(response);
                    return;
                }
            });
        }
        else{
            response.code = 1;
            response.msg = "Invalid credentials";
            res.send(response);
            return;
        }
    });

    //for creating a new account
    app.post('/account/create', async (req, res) => {

        var response = { };

        const { rUsername, rPassword } = req.body;
        if(rUsername == null || rUsername.length < 3 || rUsername.length > 24){

            response.code = 1;
            response.msg = "Invalid credentials";
            res.send(response);            
            return;
        }

        if(!passwordRegex.test(rPassword)){
            response.code = 3;
            response.msg = "Unsafe password";
            res.send(response);            
            return;
        }

        var userAccount = await Account.findOne({ username: rUsername}, '_id');
        if(userAccount == null){
            //create a new account
            console.log("Create a new account...");

            //1. Generate a unique access token
            crypto.randomBytes(32, function(err, salt){
                if(err){
                    console.log(err);
                }
                
                argon2i.hash(rPassword, salt).then(async (hash) => {

                    var newAccount = new Account({
                        username : rUsername,
                        password : hash,
                        salt: salt,
        
                        lastAuthentication : Date.now()
                    });
                    await newAccount.save(); 

                    response.code = 0; //success is 0
                    response.msg = "Account found";
                    response.data = (({username}) => ({username}) )(newAccount);
                    res.send(response);

                    return;
                });
            });

        }else{
            //if there is already an account with the same username
            response.code = 2;
            response.msg = "Username is already taken";
            res.send(response);
        }
        return;
    });
}