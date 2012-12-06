var express = require("express");
var handlebars = require("hbs");

var config = require('./config');


var app = express();

app.configure(function() {
  app.use(express.bodyParser());
  app.use(express.static(__dirname + '/public'));    
  app.set('views', __dirname + '/views');
  app.engine('html', handlebars.__express);  
  app.set('view engine', 'html');      
  app.use(express.methodOverride());
});



app.get('/', function(req, res) {
  var ctx = {title : 'Graduate File', baseHref:config.site.baseUrl};    
  res.render('index', ctx);
});


app.listen(config.site.port || 3000);

console.log("Mongo Express server listening on port " + (config.site.port || 3000));
