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
  
  $routeProvider.when('/role', {
    controller:RoleController, 
    templateUrl:'static/role_manager.html'
  });	

  $routeProvider.when('/', {
    controller:DBController,  
    templateUrl:'static/index.html'
  }); 
  
});

function UserCtrl($scope, User, Logout) {
  $scope.user = User.get();
  
  $scope.logout = function(){
    Logout.get(function(response){
      if(response.success){
        $scope.user = null;
        $scope.$broadcast('logout');
      }
    });
  };
}

function RoleController($scope, Role, User, Logout, Admin) {   
  var orig = null;
  $scope.users = Admin.query();
  $scope.get_user = function(id) {
    Admin.get({'id':id}, function(user) {
      var ng_role = [];
      $scope.user = user;//user is object, array
      orig = user;// ???
      if(user['role']) { //found
        angular.forEach(user.role, function(value, idx) {
          ng_role.push({'name':value});//??
        });
      }
      $scope.user['role'] = ng_role; // not found
    });
  };

  $scope.update = function() {
    var db_role = [];
    angular.forEach($scope.user.role, function(value, idx) {
      db_role.push(value.name);
    });
    orig['role'] = db_role;// ?? origin -- new user
    
    var doc = angular.extend({}, orig, {_id:undefined});
    //console.log(doc);
    Admin.update({'id':orig._id}, doc, function(response) { 
      console.log(response);
      if(response.success) {
        $scope.get_user(orig._id);
      }
    });
  };
  
}

function TaskController($scope, $routeParams, $location, Project,User, Logout) {
  
  $scope.user = User.get(function(response) {
    console.log(response);
    if (response.user) {
      
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
      
      //SaveTask
      var now = new Date();
      console.log(now);
      var str = "Thu Feb 09 2012 01:50:00 GMT+0000";
//var date = Date.parse(str);
//console.log(date.toString('MM-dd-yyyy')); // 02-09-2012
//console.log(date.toString('HH:mm')); // 01:50
      
      
      $scope.task_save = function () {    
        if(!$scope.task._id) {

          Project.save({_id:undefined},angular.extend({}, 
                $scope.task,
                {_id:undefined,docID:$routeParams.projectId,owner:$scope.user.user.identifier}),function(result) { 
                  console.log(result);
                  if(result.success) {
                    Project.query({docID:$scope.project._id}, function (result2) {
                      $scope.task_list = result2;
                      });
                    }
                });
              } else {  
                
              }
        };
      
      //RemoveTask
      $scope.remove_task = function (task_id) {
          Project.delete({
            id:task_id
            },function(result) {            
              if(result.success) { 
                Project.query({docID:$scope.project._id}, function (result) {
                    $scope.task_list = result;
                    });
                }
              });
          };
      
      //CreateProject
      $scope.save = function () {		
        Project.update({      
            id:$routeParams.projectId
            }, angular.extend({}, $scope.project,
              {_id:undefined}), function(result) {
                $scope.save_result = result;
                if(result.success) {
                    //var obj = angular.extend({},$scope.schema,{_id:$routeParams.id});
                    //angular.copy(obj,self.currentDocument);
                    $location.path('/project/list');
                  } else {
                      console.log("not");
                    }
                });    
      };
      
      //DeleteProject
      $scope.del = function() {
        Project.delete({
            id:$routeParams.projectId
            },function(result) {
              console.log(result);        
              if(result.sucess) {        
                  $location.path('/project/list');
                }
              });
          };
    	//$scope.task_list = Project.quey({query:'{}'});
    }
  });
    
}

function DBController($scope, $routeParams,$http,User, Logout,Project ) {
	//$scope.db = MongoStats.info();
	 //$scope.user = {username:'pk'};
  $scope.user = User.get(function(response) {
    console.log(response);
    if (response.user) {
      Project.query(function (result) {
         //console.log(result);
        $scope.task_list = result;


      });
    }
  });
};

function ProjectController($scope, $routeParams, $location, Project,User, Logout) {
	var self = this;
   $scope.project = Project.get({id:$routeParams.projectId});

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
      			if(result.success) {
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
      	id:$routeParams.projectId
    	},function(result) {
     		console.log(result);            
      	if(result.success) {        
        		$location.path('/project/list');
      		}
    		});
  		};
}

function CreateProjectController($scope, $location, Project, $routeParams,User, Logout) {
  var self=this;
  $scope.user = User.get(function(response) {
    console.log(response);
    if (response.user.identifier) {
      console.log(response.user);
      $scope.save = function () { 
        Project.save({_id:undefined},angular.extend({}, 
          $scope.project,
          {_id:undefined,user:$scope.user.user.identifier}),function(result) { 
            console.log(result);
            if(result.success) {
              $location.path('/');
            }
          });
        } 
      /*
      $scope.save = function () {
        Project.save($scope.project,function(result) { 
          //console.log(result);
          //$location.path('/project/list');
          if (result) { }
        });
      }; */
    };
  });
}

function ProjectListController($scope, $routeParams, Project, User, Logout) {
  $scope.user = User.get(function(response) {
    console.log(response);
    if (response.user) {
      
      $scope.project_list = Project.query(); 
      console.log($scope.project_list );
      //$scope.stats = MongoStats.info();
    }
  });
}

function ProjectListByYearController($scope, $routeParams, Project,User, Logout) {
  //$scope.user = User.get();
  $scope.user = User.get(function(response) {
    console.log(response);
    if (response.user || $scope.user) {
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
  });
}


function YearListController($scope, $location, $routeParams,Project,User, Logout) {
  //$scope.user = User.get();
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
