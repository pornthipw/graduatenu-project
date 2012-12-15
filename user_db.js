var mongodb = require('mongodb');
var BSON = require('mongodb').pure().BSON;
var generic_pool = require('generic-pool');

var UserProfile = function(config) {
  
  var pool = generic_pool.Pool({
    name: 'mongodb',
    max: 2,
    create: function(callback) {
      var db = new mongodb.Db(config.db, 
        new mongodb.Server(config.host, config.port),
        {safe:false, auto_reconnect:true,poolSize:4
      });      
      db.open(function(err,db) {
        console.log('Open DB');
        if(err) {
          console.log(err);
        }
        callback(err,db);
      });
    },
    destroy: function(db) {
      db.close();
    }
  });
  
  this.store = function(user,callback) {
    pool.acquire(function(err,db) {
      db.collection(config.collection_name, function(err, collection) {
        collection.findOne({'identifier':user.identifier}, function(err, profile) {          
          if(profile) {
            pool.release(db);
            callback(true, profile);
          } else {            
            collection.insert(user, function(err, result) {                            
              pool.release(db);
              callback(false, result);
            });
          }                    
        });
      });
    });
  }; 
  
  this.retrieve = function(identifier, callback) {
    pool.acquire(function(err,db) {
      db.collection(config.collection_name, function(err, collection) {
        collection.findOne({'identifier':identifier}, function(err, profile) {          
          pool.release(db);            
          if(profile) {                        
            callback(true, profile);
          } else {
            callback(false, null);                        
          }                    
        });
      });
    });
  };   
  
  this.addrole = function(user,role, callback) {
    var name = role;
    pool.acquire(function(err,db) {
      db.collection(config.collection_name, function(err, collection) {
        collection.findOne({'identifier':user.identifier}, function(err, profile) {
          if(profile) {  
            var idx = profile.role.indexOf(name);
            if(idx != -1) {
              user['role'] = [name];
              collection.update({'identifier':user.identifier}, user, function(err, result) { 
                pool.release(db);           
                if(result) {                        
                  callback(true,result);
                } else {
                  callback(false, null);                        
                }   
              }); 
            }
              
          } else { 
            pool.release(db);
            callback(false, null);
             } 
        });
      });
    });    

  };

  
  this.check_role = function(user, role, callback) {
  };
  
};


    

exports.userprofile = UserProfile;
