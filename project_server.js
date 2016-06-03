var express = require("express");
var handlebars = require("hbs");
var nodemailer = require("nodemailer");
//var mongodb = require('mongodb');
var _ = require('underscore');
var passport = require('passport');

//var mongoac = require("mongo-ac");
var mongo_con = require("mongo-connect");

var userdb = require('./user_db');
var routes = require('./routes');
var config = require('./config');
var utils = require('./utils');

var app = express();
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var GOOGLE_CLIENT_ID = config.google.google_client_id;
var GOOGLE_CLIENT_SECRET = config.google.google_client_secret;

var userprofile = new userdb.userprofile(config.authorization.mongodb);
var mongo = mongo_con.Mongo(config.mongo_connect);

app.configure(function() {
	app.use(express.cookieParser('keyboard cat'));
  	app.use(express.bodyParser());
        app.use(express.favicon());
  	app.use(express.static(__dirname + '/public'));    
  	app.set('views', __dirname + '/views');
        //app.engine('html', require('uinexpress').__express)
  	app.engine('html', handlebars.__express);  
  	//app.engine('html', handlebars.__express);  
  	app.set('view engine', 'html');      
  	app.use(express.methodOverride());
  //	app.use(express.cookieSession());
  	app.use(express.session({secret:'2WTl4fdv5SDA-Oj5MQwpLZ_E'}));
  	app.use(passport.initialize());
  	app.use(passport.session());  	
  	app.use(app.router);
});
console.log(_.range(10));

passport.serializeUser(function(user, done) {
  console.log("serializing user");
    console.log(user);
    userprofile.store(user,function(exists, user){
      done(null, user.identifier);
    });
});

passport.deserializeUser(function(identifier, done) {
  console.log("deserializing user");
  console.log(identifier);
    userprofile.retrieve(identifier, function(exists, profile){
       if(profile) {
         done(null, profile);
       } else {
         done(null, {identifier:identifier});
       }
    });
});

passport.use(new GoogleStrategy({
  clientID: GOOGLE_CLIENT_ID,
  clientSecret: GOOGLE_CLIENT_SECRET,
  callbackURL: config.site.baseUrl+'auth/google/callback'
  //enableProof: false,

  },
  function(accessToken, refreshToken, profile, done) {
    console.log(profile);
    process.nextTick(function () {
      return done(null, {identifier: profile.id, profile:profile});
    });
  }
));


app.get('/sendmail', function(req, res) {  
  console.log("test");
  console.log(req.query.query);
  var new1 = JSON.parse(req.query.query);
  console.log(new1.email);
  
  var smtpTransport = nodemailer.createTransport("SMTP",{
      service: "Gmail",
      auth: {
          user: config.mail.account,
          pass: config.mail.password 
      }
  });
 
  var mailOptions = {
      from: config.mail.account,
      to: JSON.stringify(new1.email),
      subject:  JSON.stringify(new1.name),
      text: "ส่งข้อความจากระบบอัตโนมัติ ✔"+ JSON.stringify(new1.message)+"✔ กรุณาคลิก Login ที่ปุ่ม Login With facebook ที่เมนูบนขวามือก่อนด้วยค่ะ" // plaintext body // html: "Name: <b>" + req.query.name + "</b><br>Body: " + req.query.message + "<br>Email:" + req.qyery.email
  }
 
  smtpTransport.sendMail(mailOptions, function(error, response){
      if(error){
          console.log(error);
          res.send(500, 'Something broke');
      }else{
          console.log("Message sent: " + response.message);
          smtpTransport.close();
          //res.redirect('/');
      }
  });
});


app.get('/login', function(req, res){
  res.render('login', { user: req.user });
});


app.get('/auth/google',
/*
 passport.authenticate('google', { scope:
    [ 'https://www.googleapis.com/auth/plus.login',
      'https://www.googleapis.com/auth/plus.profile.emails.read',
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile'] }
*/
  passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/plus.login'] }),
  function(req, res){
     res.redirect(config.site.baseUrl);
  });

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect(config.site.baseUrl);
  });


app.get('/user', function(req, res) {
  console.log('get user');
  if(req.user) {
    res.json({'user':req.user});
  } else {
    res.json({'user':null});
  }
});

app.get('/account', ensureAuthenticated, function(req, res){
  res.render('account', { user: req.user });
});

app.get('/logout', function(req, res){
  console.log('logout');
  req.logOut();
  res.json({"success":true});
});

app.get('/login', function(req, res){
	res.send('<form action="'+
   	config.site.baseUrl+
      	'auth/openid" method="post">'+
  			'<div>'+
  			'<label>OpenID:</label>'+
  			'<input type="text" name="openid_identifier"/><br/>'+
  			'</div>'+
  			'<div>'+
  			'<input type="submit" value="Submit"/>'+
  			'</div>'+
  	'</form>');
});

app.get('/mongo-ac/users/:user', function(req, res) {
  console.log('get user <'+req.params.user+'>');
  access_control.get_user(req.params.user, function(user) {
    res.json(user);
  });
});

app.get('/', function(req, res) {
  console.log('index ');
  res.render('index', {user: req.user, baseHref:config.site.baseUrl});
});

app.get('/currentdate', function(req, res) {
  var cdate = new Date();  
  res.json({'year':cdate.getFullYear(), 'month':cdate.getMonth(), 'date':cdate.getDate()});
});

app.get('/admin/users', admin_role, userprofile.list_user);
app.get('/admin/users/:id', admin_role ,userprofile.get_user);
app.put('/admin/users/:id', admin_role ,userprofile.update_user);

app.get('/db/:collection/:id?', mongo.query);
app.post('/db/:collection', admin_role,mongo.insert);
//app.post('/db/:collection', mongo.insert);
app.put('/db/:collection/:id', admin_role, mongo.update);
//app.put('/db/:collection/:id',  mongo.update);
app.del('/db/:collection/:id', admin_role, mongo.delete);

//app.put('/db/:collection/:id', mongo.update);
//app.del('/db/:collection/:id', mongo.delete);


function admin_role(req,res,next) {
  console.log('admin_role');
  if(req.user) {
    userprofile.check_role(req.user.identifier, ["admin","plan","academic","direct","research","press"], function(allow) {
      if(allow) {
          next();
      } else {
          next(new Error("401"));
      }
    });
  } else {
    console.log('no user signin');
    next(new Error("401"));    
  }
}

app.use(function(err,req,res,next) {  
  if(err instanceof Error){    
    if(err.message === '401'){
      res.json({'error':401});
    }
  }
});

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login');
}


app.listen(config.site.port || 3000);

console.log("Mongo Express server listening on port " + (config.site.port || 3000));
