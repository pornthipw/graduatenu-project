var app = angular.module('mongorest_service', ['ngResource']);

var prefix = '/apps/grad-project';
//var prefix = '';
               

app.factory('Project', function($resource) {
   //var Project = $resource('http://www.db.grad.nu.ac.th/apps/mongodb/databases/projectplan/collections/project/:document', {   
  var Project = $resource(prefix + '/db/project/:id', {    
    id: '@id'
  },
  {update: { method:'PUT' }});
  return Project;
});

app.factory('FileDB', function($resource) {
  var FileDB = $resource(prefix + '/db/fs.files/:id', {    
    id: '@id'
  },
  {update: { method:'PUT' }});
  return FileDB;
});

app.factory('GridDB', function($resource) {
    var GridDB  = $resource('file/:id', {id:'@id'},{});                 
    return GridDB;
});


app.factory('User', function($resource) {
    var User  = $resource('user',{}, {});   
    return User;   
});

app.factory('Admin', function($resource) {
  var Admin = $resource(prefix + '/admin/users/:id', {
  },
  {update: { method:'PUT' }});
  return Admin;
});

app.factory('Logout', function($resource) {
    var Logout  = $resource('logout',{}, {});   
    return Logout ;   
});

app.factory('Role', function($resource) {
  var Role = $resource(prefix + '/db/nook_ac_2/:id', {    
    id: '@id'
  },
  {update: { method:'PUT' }});
  return Role;
});





