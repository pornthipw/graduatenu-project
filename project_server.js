var express = require("express");
var handlebars = require("hbs");
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
var OpenIDStrategy = require('passport-openid').Strategy;

//var userprofile = new userdb.userprofile(config.authorization.mongodb);
/*var userprofile = new userdb.userprofile({
  host:config.authorization.mongodb.host, 
  port:config.authorization.mongodb.port,
  db:config.authorization.mongodb.db,
  collection_name:config.authorization.mongodb.collection_name
});*/

var userprofile = new userdb.userprofile(config.authorization.mongodb);
var mongo = mongo_con.Mongo(config.mongo_connect);
/*
var mongo = mongo_con.Mongo({
  host:'10.10.20.75',
  //host:'localhost',
  db:'projectplan'
});
*/


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
  	app.use(express.session());
  	app.use(passport.initialize());
  	app.use(passport.session());  	
  	app.use(app.router);
});
console.log(_.range(10));

passport.serializeUser(function(user, done) {
  console.log("test");
  userprofile.store(user, function(exists, user) {  
    done(null, user.identifier);
  });
});

passport.deserializeUser(function(identifier, done) {  
  userprofile.retrieve(identifier, function(exists, profile) {  
    if(profile) {    
      done(null, profile);
    } else {
      done(null, {identifier : identifier});
    }
  });
});

passport.use(new OpenIDStrategy({
  returnURL: config.site.baseUrl+'auth/openid/return',
  // realm: config.site.baseUrl,
  realm:'http://www.db.grad.nu.ac.th/', 
  profile: true}, function(identifier, profile, done) {
    //console.log(profile);
    process.nextTick(function () {    
      	return done(null, {identifier: identifier, profile:profile})
    });
  }
));

app.get('/auth/openid', 
	passport.authenticate('openid', { failureRedirect: '/login' }),
  		function(req, res) {
        console.log('Hello');
    		res.redirect(config.site.baseUrl);
});
  
app.get('/auth/openid/return', 
	passport.authenticate('openid', { failureRedirect: '/login' }),
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
  res.render('index', {baseHref:config.site.baseUrl});
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
app.put('/db/:collection/:id', admin_role, mongo.update);
app.del('/db/:collection/:id', admin_role, mongo.delete);

//app.put('/db/:collection/:id', mongo.update);
//app.del('/db/:collection/:id', mongo.delete);


function admin_role(req,res,next) {
  console.log('admin_role');
  if(req.user) {
    userprofile.check_role(req.user.identifier, ["admin","plan"], function(allow) {
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


app.listen(config.site.port || 3000);

console.log("Mongo Express server listening on port " + (config.site.port || 3000));
