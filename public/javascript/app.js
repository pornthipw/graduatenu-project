var app = angular.module('projectplan', ['mongorest_service',
'codemirror',
'$strap.directives']);

app.config(function($routeProvider) {
  
  $routeProvider.when('/project/create', {
    controller:CreateProjectController, 
    templateUrl:'static/project_form.html'
  });    
  
  $routeProvider.when('/project/task/:projectId', {
    controller:MessageController, 
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
    controller:MainController,  
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

function MessageController($scope, $routeParams, $location, Project,User, Logout) {
  var self = this;
  /*
  self.messageAlert = function(messageAlert) {
    $scope.messageAlert = messageAlert;
    setTimeout(function() {      
      $scope.$apply(function() {
        $scope.messageAlert = null;
      });
    }, 3000);
  };
  */
  
  $scope.user = User.get(function(response) {
    //console.log(response);
    if (response.user ||$scope.user ) {
      
      $scope.statuses = [
        {
          id: 's',
          name: 'เริ่มดำเนินการ'},
        {
          id: 'p',
          name: 'กำลังดำเนินงาน'},
        {
          id: 'f',
          name: 'เสร็จสิ้น'},
      ];
      
      $scope.views = {
        project_form : 'static/project_form.html'
        }
        
        var self = this;
        
        Project.get({id:$routeParams.projectId},function (response) {
            $scope.project = response;
            $scope.current_id = $scope.project._id;
            console.log($scope.project._id);
            if (response) {
                Project.query({project_id:$scope.project._id}, function (result) {
                  $scope.message_list = result;
                });
            }
        });
      
      //SaveTask
      $scope.message_save = function (mid) { 
        $scope.cur = mid;  
         
        if(!$scope.cur) {
          Project.save({_id:undefined},angular.extend({}, 
                $scope.message,
                {_id:undefined,project_id:$routeParams.projectId,owner:$scope.user.user.profile.name.givenName,type:"post_messsge"}),function(result) { 
                  console.log(result);
                  if(result.success) {
                    //self.message("Message Saved");
                    $scope.messageAlert = "Message Saved";
                    setTimeout(function() {      
                      $scope.$apply(function() {
                        $scope.messageAlert = null;
                      });
                    }, 3000);
                    Project.query({project_id:$routeParams.projectId}, function (result2) {
                      $scope.message_list = result2;
                      });
                    } else {
                      //self.messageAlert("Message don't Saved");
                    }
                    Project.query({project_id:$scope.project._id}, function (result2) {
                      $scope.message_list = result2;
                      });
                });
              } else {  
                console.log("test");
                $scope.message = Project.get({id:$scope.cur});

              }
        };
      
      //RemoveTask
      $scope.remove_message = function (message_id) {
          Project.delete({
            id:message_id
            },function(result) {            
              if(result.success) { 
                Project.query({project_id:$scope.project._id}, function (result) {
                    $scope.message_list = result;
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
    }
  });
}

function MainController($scope, $routeParams,$http,User, Logout,Project ) {          
    Project.query({query:'{"type":"post_message"}'}, function (result) {      
      //console.log(result);
      var dict = {}; //       
      angular.forEach(result, function(message) {
        if(!(message.project_id in dict)) {
          Project.get({id:message.project_id}, function(project) {
            message['project'] = project;
            dict[message.project_id] = project;
            //console.log(project);
          });
        } else {
          message['project'] = dict[message.project_id];
        }
        
      });
      $scope.message_list = result;
    });    
};

function ProjectController($scope, $routeParams, $location, Project,User, Logout) {
	var self = this;
   $scope.project = Project.get({id:$routeParams.projectId});

	$scope.save = function () {		
   	Project.update({      
      	id:$routeParams.projectId
    		}, angular.extend({}, $scope.project,
      		{_id:undefined}), function(result) {
      			$scope.save_result = result;
      			if(result.success) {
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
    if (response.user.identifier ||$scope.user.identifier) {
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
    if (response.user | $scope.user) {
      
      $scope.project_list = Project.query(); 
      console.log($scope.project_list );
      //$scope.stats = MongoStats.info();
    }
  });
}

function ProjectListByYearController($scope, $routeParams, Project,User, Logout) {
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
