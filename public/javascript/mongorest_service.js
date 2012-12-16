var app = angular.module('mongorest_service', ['ngResource']);

app.factory('Project', function($resource) {
  //var Project = $resource('http://www.db.grad.nu.ac.th/apps/mongodb/databases/projectplan/collections/project/:document', {   
  var Project = $resource('query/project/:id', {     
    id: '@id'
  },
  {update: { method:'PUT' }});
  return Project;
});




