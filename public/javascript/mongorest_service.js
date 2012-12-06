var app = angular.module('mongorest_service', ['ngResource']);

app.factory('Project', function($resource) {
  var Project = $resource('http://www.db.grad.nu.ac.th/apps/mongodb/databases/projectplan/collections/project/:document', {    
    document: '@document'
  },
  {update: { method:'PUT' }});
  return Project;
});

angular.module('mongo_stats_service', ['ngResource']).
factory('MongoStats', function($resource) {
  var MongoStats = $resource('http://www.db.grad.nu.ac.th/apps/mongodb/stats/projectplan/project', {
    collection: '@collection'
  },
  {info: { method:'GET' }});
  return MongoStats;
});
