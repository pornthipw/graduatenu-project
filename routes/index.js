//Add routes from other files
//var db = require('./database');
//var coll = require('./collection');
//var gridstore = require('./gridstore');

var mongodb = require('mongodb');
var config = require('../config');


// exports.viewDocument = doc.viewDocument;
exports.index = function(req, res) {
  var ctx = {
    title: 'Mongo Express',
  };
  //console.log('request index.js');
  res.render('index', ctx);
}
