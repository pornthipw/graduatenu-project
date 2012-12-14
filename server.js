var express = require("express");
var handlebars = require("hbs");
var mongodb = require('mongodb');
var _ = require('underscore');
var passport = require('passport');
var mongoac = require("mongo-ac");

var userdb = require('./user_db');

var routes = require('./routes');
var config = require('./config');
//var utils = require('./utils');

var app = express();
var OpenIDStrategy = require('passport-openid').Strategy;

var userprofile = new userdb.userprofile({
  host:config.authorization.mongodb.server, 
  port:config.authorization.mongodb.port,
  db:config.authorization.mongodb.db,
  collection_name:config.authorization.mongodb.collection
});

var access_control = new mongoac.MongoAC({	
	host:config.authorization.mongodb.server, 
  	port:config.authorization.mongodb.port,
  	db:config.authorization.mongodb.db,
  	collection_name:config.authorization.mongodb.collection
});

app.configure(function() {
	app.use(express.cookieParser());
  	app.use(express.bodyParser());
  	app.use(express.static(__dirname + '/public'));    
  	app.set('views', __dirname + '/views');
  	app.engine('html', handlebars.__express);  
  	app.set('view engine', 'html');      
  	app.use(express.methodOverride());
  	app.use(express.session({ secret: 'keyboard cat' }));
  	app.use(passport.initialize());
  	app.use(passport.session());
  	app.use(access_control.guard());
  	app.use(app.router);
});

app.use(function(err,req,res,next) {
    if(err instanceof Error){
        if(err.message === '401'){
            res.json({'error':401});
            //res.render();
        }
    }
});

passport.serializeUser(function(user, done) {
  console.log('serializeUser');
  //console.log(user);
  userprofile.store(user, function(exists, user) {
    //console.log('done serializeUser');
    done(null, user.identifier);
  });
  
	
});

passport.deserializeUser(function(identifier, done) {
  //console.log('deserializeUser');
  //console.log(identifier);
  userprofile.retrieve(identifier, function(exists, profile) {  
    if(profile) {
      //console.log(profile);
      done(null, profile);
    } else {
      done(null, {identifier : identifier});
    }
  });
});

passport.use(new OpenIDStrategy({
  returnURL: config.site.baseUrl+'auth/openid/return',
  realm: config.site.baseUrl,
  profile: true}, function(identifier, profile, done) {
    process.nextTick(function () {    
      	return done(null, {identifier: identifier, profile:profile})
    });
  }
));

app.post('/auth/openid', 
	passport.authenticate('openid', { failureRedirect: '/login' }),
  		function(req, res) {
    		res.redirect(config.site.baseUrl);
});
  
app.get('/auth/openid/return', 
	passport.authenticate('openid', { failureRedirect: '/login' }),
  		function(req, res) {
    		res.redirect(config.site.baseUrl);
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
  
  userprofile.check_role(req.user, 'admin', function(error) {
    if(!error) {
    }
  });
  
  //console.log(req.user) 
  
	var ctx = {title : 'Graduate File', baseHref:config.site.baseUrl};    
  	res.render('index', ctx);
});

app.get('/addrole', function(req, res) {
  console.log(req.user);
  userprofile.addrole(req.user.identifier, req.body.role_name,function(error) {
      if (!error)  {
        console.log("OK");
      } else {
        console.log("No-OK");
      }
  });
  
});

app.listen(config.site.port || 3000);

console.log("Mongo Express server listening on port " + (config.site.port || 3000));
