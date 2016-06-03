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

app.factory('Sendmail', function($resource) {
    var Sendmail  = $resource('sendmail/', {},{});                 
    return Sendmail;
});


app.factory('User', function($resource) {
    var User = $resource(prefix + '/user', {}, {});    
    //var User = $resource('/apps/grad-project/user', {}, {});    
   // var User  = $resource('user',{}, {});   
    return User;   
});

app.factory('Admin', function($resource) {
  //var Admin = $resource(prefix + '/admin/users/:id', {
  var Admin = $resource('/apps/grad-project/admin/users/:id', {
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

app.factory('GradDB', function($resource) {
  var GradDB = $resource(
    //prefix + '/gradnu/:table/:mode', 
    '/apps/core/gradnu/:table/:mode', 
    //'http://www.db.grad.nu.ac.th/apps/core/gradnu/:table/:mode', 
    {},{
     'save':{method:'POST'},
     'update':{method:'PUT'},
     'remove':{method:'POST'},
    }
  );                         
  return GradDB;
});

app.factory('CurrentDate', function($resource) {
  var CDate = $resource(
    prefix+'/currentdate',     
    {         
    });                         
  return CDate;    
});

/*
app.factory('Student', function($resource) {
    var Student = $resource(
      'http://www.db.grad.nu.ac.th/django/rest/students/:id', 
      {callback:'JSON_CALLBACK'}, 
      {
	'query':  {method:'JSONP', isArray:true},
	'get':  {method:'JSONP'}
      });                         
    return Student;    
});
*/
