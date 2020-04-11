const passport = require('passport');
const fetch = require('node-fetch');

const User = require('../models/user');
const LocalStrategy = require('passport-local').Strategy;
const adminCode = "secretcode";

/*done(err,__) err as a first parameter*/
passport.serializeUser(function(user, done){
    done(null, user.id);
});

passport.deserializeUser(function(id, done){
    User.findById(id, function(err,user){
        done(err, user);
    });
});

passport.use('local.signup', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, function (req,email, password, done){
    User.findOne({'email': email}, async function(err, user){
        if(err){
            return done(err);
        }
        if(req.body.fullname=="" || req.body.username==""){
            return done(null, false, {message: 'Missing credentials'});
        }

        /* Google recaptcha v2 */
        let captcha = Object.values(req.body)[4];
        const secretKey = '6LfnnOgUAAAAAKqQYVVTGOCtaD7gGVd2Y3cnsW5N';
        if(captcha === undefined || captcha==='' || captcha === null){
            return done(null, false, {message: 'Please select captcha'});
        }
        
        const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${captcha}&remoteip=${req.connection.remoteAddress}`;
        //make request
        const body = await fetch(verifyUrl).then(res => res.json());
        //If not success
        if(body.success !== undefined && !body.success){
            return done(null, false, {message: 'Failed captcha'});
        }
        /* If reached here then recaptcha success */
        if(user){
            return done(null, false, {message: 'Email is already in use'});
        }
        if(req.body.isseller!=""){
            if(req.body.isseller!=adminCode){
                return done(null, false, {message: 'Admin Code is incorrect. Please signup as a user instead'});
            }
        }
        var newUser = new User();
        newUser.fullname = req.body.fullname;
        newUser.email = email;
        newUser.password = newUser.encryptPassword(password);
        if(req.body.isseller==adminCode){
            newUser.isSeller = true;
        }
        newUser.save(function(err, result){
            if(err){
                return done(err);
            }
            return done(null, newUser);
        });
    });
}));

passport.use('local.signin', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, function(req, email, password, done){
    User.findOne({'email': email},function(err, user){
        if(err){
            return done(err);
        }
        if(!user){
            return done(null, false, {message: 'No user found.'});
        }
        if(!user.validPassword(password)){
            return done(null, false, {message: 'Incorrect password.'});
        }
        return done(null, user);
    });
}))