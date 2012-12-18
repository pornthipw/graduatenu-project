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
              console.log(result);
              callback(false, user);
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
  
  this.add_role = function(identifier,role_name, callback) {    
    pool.acquire(function(err,db) {
      db.collection(config.collection_name, function(err, collection) {
        collection.findOne({'identifier':identifier}, function(err, profile) {                                                  
          if(profile) {              
            var idx = 0;
            if(!profile.role) {            
              profile['role'] = [];
            }
            idx = profile.role.indexOf(role_name);
            if(idx == -1) {                      
              profile['role'].push(role_name);            
              collection.update({'identifier':identifier}, profile, function(err, result) { 
                pool.release(db);           
                callback(profile);                
              });                           
            } else { 
              pool.release(db);
              callback(profile);
            }           
          } else {
            pool.release(db);
            callback(null);
          }
        });
      });
    });    
  };

  this.check_role = function(identifier, role_names, callback) {
    pool.acquire(function(err,db) {
      db.collection(config.collection_name, function(err, collection) {
        collection.findOne({'identifier':identifier}, function(err, profile) {                                                  
          if(!profile.role) {   
            callback(false);
          } else {  
            var found = false;
            for(var i=0;i<role_names.length;i++) {
              idx = profile.role.indexOf(role_names[i]);
              if(idx == -1) { 
                found = true;                
                break;
              } 
            }
            if(found) {
              callback(true);
            } else {
              callback(false);
            }
          }
        });
      });
    });    
  };
  
};


exports.userprofile = UserProfile;
