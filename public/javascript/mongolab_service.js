var app = angular.module('mongolab_service', ['ngResource']);
/*
app.factory('Project', function($resource) {
    var Project  = $resource('https://api.mongolab.com/api/1/databases/projectplan/collections/project/:id', {
      id:'@id',
      apiKey:'506b96b5e4b0b2e219506689'},{
      update: { method: 'PUT' }
    });           
    
    Project.prototype.update = function(cb) {
        return Project.update({id: this._id.$oid},
            angular.extend({}, this, {_id:undefined}), cb);
    };
    
    Project.prototype.destroy = function(cb) {
        return Project.remove({id: this._id.$oid}, cb);
      };
    
    return Project;
});
*/
factory('Project', function($resource) {
  var Project = $resource('http://www.db.grad.nu.ac.th/apps/mongodb/databases/projectplan/collections/project/:document', {    
    document: '@document'
  },
  {update: { method:'PUT' }});
  return MongoDB;
});

angular.module('mongo_stats_service', ['ngResource']).
factory('MongoStats', function($resource) {
  var MongoStats = $resource('http://www.db.grad.nu.ac.th/apps/mongodb/stats/projectplan/project', {
    collection: '@collection'
  },
  {info: { method:'GET' }});
  return MongoStats;
});
