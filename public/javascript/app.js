var app = angular.module('projectplan', ['mongolab_service']);

app.config(function($routeProvider) {
  
  $routeProvider.when('/add/project', {
    controller:CreateProjectController, 
    templateUrl:'static/project_form.html'
  });    	
  
  
  $routeProvider.when('/edit/project/:projectId', {
    controller:ProjectController, 
    templateUrl:'static/project_form.html'
  });    	
  
  $routeProvider.when('/projects/:year', {
    controller:ProjectListByYearController, 
    templateUrl:'static/index.html'
  });    	
  
  $routeProvider.when('/', {
    controller:ProjectListController, 
    templateUrl:'static/index.html'
  });    	
});

function ProjectController($scope, $routeParams, $location, Project) {
  var self = this;
  
  Project.get({id:$routeParams.projectId}, function(response) {
    self.original = response;
    $scope.project = new Project(self.original);
    //console.log(response);
  }); 
  
  $scope.save = function() {        
    $scope.project.update(function() {
      $location.path('/');
    });    
  };     
  
  $scope.destroy = function() {
    self.original.destroy(function(response) {
      console.log(response);
      $location.path('/');
    });
  };
}


function CreateProjectController($scope, $location, Project) {
  $scope.save = function() {    
    Project.save($scope.project, function(response) {
      $location.path('/');
    });    
  };  
}


function ProjectListController($scope, Project) {
  $scope.project_list = Project.query();    
}

function ProjectListByYearController($scope, $routeParams, Project) {
  Project.query(function(response) {
    var project_list = [];
    for(var idx=0;idx<response.length;idx++) {      
      var project = response[idx];
      if(project.year == $routeParams.year) {
        project_list.push(project);
      }
    }
    $scope.project_list = project_list;
  });
}


function YearListController($scope, $location, Project) {
  Project.query(function(response) {
    var years = {}; // {'2556':1}
    var year_list = [];
    
    for(var idx=0;idx<response.length;idx++) {      
      var project = response[idx];
      if(project.year && !years[project.year]) {
        years[project.year] = 1;
        year_list.push(project.year);             
      }      
    }    
    year_list.sort();
    console.log(year_list);
    $scope.year_list = year_list;    
  });  
  
  $scope.filter = function(year) {
    $location.path('/projects/'+year);
  };
  
}
