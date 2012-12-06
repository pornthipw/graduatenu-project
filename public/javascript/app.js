var app = angular.module('projectplan', ['mongorest_service','mongo_stats_service']);

app.config(function($routeProvider) {
  
  $routeProvider.when('/project/create', {
    controller:CreateProjectController, 
    templateUrl:'static/project_form.html'
  });    	
  
  $routeProvider.when('/project/edit/:projectId', {
    controller:ProjectController, 
    templateUrl:'static/project_form.html'
  });    
  
  $routeProvider.when('/project/list', {
    controller:ProjectListController, 
    templateUrl:'static/project_list.html'
  });
  	
  $routeProvider.when('/projects/:year', {
    controller:ProjectListByYearController, 
    templateUrl:'static/project_list.html'
  });    	

  $routeProvider.when('/', {
    controller:DBController,  
    templateUrl:'static/index.html'
  }); 
  
});

function DBController($scope, $routeParams, MongoStats) {
  $scope.db = MongoStats.info();
};

function ProjectController($scope, $routeParams, $location, Project) {
  var self = this;
  
  /*
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
  */
  
  
  Project.get({document:$routeParams.projectId}, function(response) {
    $scope.project = response; 
  });

  /*
  $scope.add_field = function() { 
    console.log("add_field");
    $scope.schema.fields.push({'name':'', 'title':''});
    
  }
  */
  
  $scope.save = function () {		
    Project.update({      
      document:$routeParams.projectId
    }, angular.extend({}, $scope.project,
      {_id:undefined}), function(result) {
      $scope.save_result = result;
      if(result.ok) {
        //var obj = angular.extend({},$scope.schema,{_id:$routeParams.id});
        //angular.copy(obj,self.currentDocument);
        $location.path('/project/list');
      } else {
        console.log("not");
      }
    });    
  };
  
  /*
  $scope.del_field = function(idx) {
    $scope.schema.fields.splice(idx,1);
  }
  */
  
}

function CreateProjectController($scope, $location, Project, $routeParams) {
  var self=this;
  
  $scope.save = function () {
    Project.save($scope.project,function(result) { 
      console.log(result);
      $location.path('/project/list');
    });
  }; 
}

function ProjectListController($scope, $routeParams, Project, MongoStats) {
  
  $scope.project_list = Project.query(); 
  console.log($scope.project_list );
  $scope.stats = MongoStats.info();
     
}

function ProjectListByYearController($scope, $routeParams, Project, MongoStats) {
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


function YearListController($scope, $location, $routeParams,Project, MongoStats) {
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
