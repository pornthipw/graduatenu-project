var app = angular.module('projectplan', ['mongorest_service']);

app.config(function($routeProvider) {
  
  $routeProvider.when('/project/create', {
    controller:CreateProjectController, 
    templateUrl:'static/project_form.html'
  });    
  
  $routeProvider.when('/project/task/:projectId', {
    controller:TaskController, 
    templateUrl:'static/task_form.html'
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

function UserCtrl($scope, User, Logout) {
  $scope.user = User.get(function(response) {
    
  });
  
  $scope.logout = function(){
    Logout.get(function(response){
      if(response.success){
        $scope.user = null;
        $scope.$broadcast('logout');
      }
    });
  };
}

function TaskController($scope, $routeParams, $location, Project) {
	$scope.views = {
   	project_form : 'static/project_form.html'
  	}
    
  	var self = this;
		Project.get({id:$routeParams.projectId},function (response) {
      	$scope.project = response;
    		console.log($scope.project._id);
    		if (response) {
      		//Project.query({query:'{"docID":"$scope.doc ._id"}'}, function (result) {
        		Project.query({docID:$scope.project._id}, function (result) {
          		$scope.task_list = result;
        		});
    		}
  	});

  	$scope.task_save = function () {    
   	if(!$scope.task._id) {
   		Project.save({_id:undefined},angular.extend({}, 
        		$scope.task,
        		{_id:undefined,docID:$routeParams.projectId}),function(result) { 
        			console.log(result);
        			if(result.ok) {
          			Project.query({docID:$scope.project._id}, function (result) {
            			$scope.task_list = result;
          				});
        				}
      			});
    			} else {   }
  	};
  
 	$scope.remove_task = function (task_id) {
  		Project.delete({
      	document:task_id
    		},function(result) {            
      		if(result.ok) { 
         		Project.query({docID:$scope.project._id}, function (result) {
          			$scope.task_list = result;
        				});
      			}
    			});
  		};
  
  	$scope.save = function () {		
   	Project.update({      
      	id:$routeParams.projectId
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
  
	$scope.del = function() {
   	Project.delete({
      	id:$routeParams.projectId
    		},function(result) {
      		console.log(result);        
      		if(result.ok) {        
        			$location.path('/project/list');
      			}
    			});
  		};
    	//$scope.task_list = Project.quey({query:'{}'});
    
}

function DBController($scope, $routeParams,$http ) {
	//$scope.db = MongoStats.info();
	 //$scope.user = {username:'pk'};
  $scope.allow= function() {        
    $http.post('mongo-ac/allow', {user:$scope.user, url:$scope.url, method:$scope.method}).success(function(result) {
    	console.log(result);
      if(result.success) {     
        console.log(result);     
        //$scope.user = result.user;        
      }
    });                                    
  };  
  
  $scope.notallow= function() {        
    $http.post('mongo-ac/notallow', {user:$scope.user, url:$scope.url, method:$scope.method}).success(function(result) {
      console.log(result);
      if(result.success) {      
        console.log(result);    
        //$scope.user = result.user;        
      }
    });                                    
  };  
  
  $scope.protect= function() {        
    $http.post('mongo-ac/protect', {url:$scope.url, method:$scope.method}).success(function(result) {
      if(result.success) {      
        console.log(result);    
        //$scope.user = result.user;        
      }
    });                                    
  }; 
  
  $scope.release= function() {        
    $http.post('mongo-ac/release', {url:$scope.url, method:$scope.method}).success(function(result) {
      if(result.success) {      
        console.log(result);    
        //$scope.user = result.user;        
      }
    });                                    
  }; 
	};

function ProjectController($scope, $routeParams, $location, Project) {
	var self = this;
   $scope.project = Project.get({document:$routeParams.projectId});

 	 /*
  	$scope.add_field = function() { 
    	console.log("add_field");
    	$scope.schema.fields.push({'name':'', 'title':''}); 
  	}
  */
  
	$scope.save = function () {		
   	Project.update({      
      	id:$routeParams.projectId
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
	$scope.del = function() {
   	Project.delete({
      	document:$routeParams.projectId
    	},function(result) {
     		console.log(result);            
      	if(result.ok) {        
        		$location.path('/project/list');
      		}
    		});
  		};
  		
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

function ProjectListController($scope, $routeParams, Project) {
  
  $scope.project_list = Project.query(); 
  console.log($scope.project_list );
  //$scope.stats = MongoStats.info();
     
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


function YearListController($scope, $location, $routeParams,Project) {
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
