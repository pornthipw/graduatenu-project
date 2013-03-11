var app = angular.module('projectplan', ['mongorest_service','codemirror','$strap.directives']);

app.config(function($routeProvider) {
  
  $routeProvider.when('/project/create', {
    controller:CreateProjectController, 
    templateUrl:'static/project_form.html'
  });    
  
  $routeProvider.when('/project/task/:projectId', {
    controller:MessageController, 
    templateUrl:'static/task_form.html'
  }); 	
  /*
  $routeProvider.when('/project/edit/field/:projectId', {
    controller:ProjectEditController, 
    //templateUrl:'static/project_form.html'
    templateUrl:'static/project_edit.html'
  });  
  */
  $routeProvider.when('/project/edit/:projectId', {
    controller:ProjectController, 
    templateUrl:'static/project_form.html'
  });    
  
  $routeProvider.when('/project/list', {
    controller:ProjectListController, 
    templateUrl:'static/project_list.html'
  });
  
  /*
  $routeProvider.when('/report', {
    controller:ReportyYearController,  
    templateUrl:'static/report.html'
  });  
  	 */
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

function MainController($scope, $routeParams,$http,User, Logout,Project ) {          
  Project.query({
    query:'{"type":"post_messsge"}'
  }, function (result) {      
    var dict = {}; //       
    angular.forEach(result, function(message) {
      if(!(message.project_id in dict)) {
        Project.get({id:message.project_id}, function(project) {
          message['project'] = project;
          dict[message.project_id] = project;
        });
      } else {
        message['project'] = dict[message.project_id];
      }
      
    });
    $scope.message_list = result;
  });  
  
  $scope.project_list = Project.query({
    query:'{"type":"post_project"}'
  });
};

function RoleController($scope, Role, User, Logout, Admin) {   
  var orig = null;
  $scope.users = Admin.query();
  $scope.get_user = function(id) {
    Admin.get({'id':id}, function(user) {
      var ng_role = [];
      $scope.user = user;
      orig = user;
      if(user['role']) { 
        angular.forEach(user.role, function(value, idx) {
          ng_role.push({'name':value});
        });
      }
      $scope.user['role'] = ng_role; 
    });
  };

  $scope.update = function() {
    var db_role = [];
    angular.forEach($scope.user.role, function(value, idx) {
      db_role.push(value.name);
    });
    orig['role'] = db_role;
    
    var doc = angular.extend({}, orig, {_id:undefined});
    Admin.update({'id':orig._id}, doc, function(response) { 
      console.log(response);
      if(response.success) {
        $scope.get_user(orig._id);
      }
    });
  };
}

function ProjectListController($scope, $routeParams, Project, User, Logout) {
  $scope.user = User.get(function(response) {
    console.log(response);
    if (response.user | $scope.user) {
      Project.query(function(response){
  
      }); 
    }
  });
}

function ProjectListByYearController($scope, $routeParams, Project,User, Logout) {
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
    $scope.year_list = year_list;    
  });  

  $scope.filter = function(year) {
    $location.path('/projects/'+year);
  };
  
}

function ProjectController($scope, $routeParams, $location, Project,User, Logout) {
  var self = this;
  self.messageAlert = function(messageAlert) {
    $scope.messageAlert= messageAlert;
    setTimeout(function() {      
      $scope.$apply(function() {
        $scope.messageAlert = null;
      });
    }, 3000);
  };
  $scope.user = User.get(function(response) {
    if (!response.user) {
      self.messageAlert("You are not authorized to update content");  
    } else {
      $scope.project = Project.get({id:$routeParams.projectId});  
      $scope.save = function () {		
        Project.update({      
          id:$routeParams.projectId
        }, angular.extend({}, $scope.project,{_id:undefined}), 
          function(result) {
            $scope.save_result = result;
            if(result.success) {
              $location.path('/projects/'+$scope.project.year);
            }
          });    
        };
    
      $scope.del = function() {
        Project.delete({
          id:$routeParams.projectId
        },function(result) {
          console.log(result);            
          if(result.success) {        
            $location.path('/projects/'+$scope.project.year);
          }
        });
      };
    }
  });
}

function MessageController($scope, $routeParams, $location, Project,User, Logout) {
  var self = this;
  self.messageAlert = function(messageAlert) {
    $scope.messageAlert= messageAlert;
    setTimeout(function() {      
      $scope.$apply(function() {
        $scope.messageAlert = null;
      });
    }, 3000);
  };

  $scope.user = User.get(function(response) {
    $scope.views = {
      project_form : 'static/project_form.html'
    }
    Project.get({id:$routeParams.projectId},function (response) {
      $scope.project = response;
      $scope.current_id = $scope.project._id;
      //console.log($scope.project._id);
      if (response) {
        Project.query({project_id:$scope.project._id}, function (result) {
          $scope.message_list = result;
        });
      }
    });
      
    if (!response.user) {
      self.messageAlert("You are not authorized to update content");  
    } else {
   
      $scope.editField = function(mes) {
        $scope.selectMessage = mes;
        console.log($scope.selectMessage);
        $scope.message = Project.get({id:$scope.selectMessage},function(result){
          console.log(result);
        });
      }
      
      //createMessage
      $scope.createMessage = function(){
        $scope.message = null;
        Project.save({_id:undefined},
          angular.extend({}, 
          {_id:undefined,task_name:"task_name",
            project_id:$routeParams.projectId,
            owner:$scope.user.user.profile.name.givenName,
            type:"post_messsge"}),
          function(result) { 
            console.log(result);
            if(result.success) {
              self.messageAlert("Message Saved");
              Project.query({project_id:$routeParams.projectId}, function (result2) {
                $scope.message_list = result2;
              });
            } else {
              self.messageAlert("Message don't Saved");
            }
            Project.query({project_id:$scope.project._id}, function (result2) {
              $scope.message_list = result2;
            });
          });
      };
        
      //SaveTask
      $scope.messageSave = function () { 
        if(!$scope.selectMessage) {
          Project.save({_id:undefined},
            angular.extend({}, 
            $scope.message,
            {_id:undefined,project_id:$routeParams.projectId,
              owner:$scope.user.user.profile.name.givenName,
              type:"post_messsge"}),
            function(result) { 
              console.log(result);
              if(result.success) {
                self.messageAlert("Message Saved");
                Project.query({project_id:$routeParams.projectId}, function (result2) {
                  $scope.message_list = result2;
                });
              } else {
                self.messageAlert("Message don't Saved");
              }
              Project.query({project_id:$scope.project._id}, function (result2) {
                $scope.message_list = result2;
              });
            });
        } else {
          Project.update({
            id:$scope.selectMessage
          }, angular.extend({}, 
            $scope.message, 
            {_id:undefined,
              project_id:$routeParams.projectId,
              owner:$scope.user.user.profile.name.givenName,
              type:"post_messsge"}), 
          function(result) {      
            if(result.success) {
              self.messageAlert("Message Saved");
              Project.query({project_id:$scope.project._id}, function (result2) {
                $scope.message_list = result2;
              });                
            }
          });
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
        
      //UpdateProject
      $scope.save = function () {		
        Project.update({      
          id:$routeParams.projectId
        }, angular.extend({}, $scope.project,
          {_id:undefined}), function(result) {
            $scope.save_result = result;
            if(result.success) {
              self.messageAlert("Project Updated");
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
            self.messageAlert("Project Deleted");    
          }
        });
      };
    }
  });
}

function CreateProjectController($scope, $location, Project, $routeParams,User, Logout) {
  var self = this;
  self.messageAlert = function(messageAlert) {
    $scope.messageAlert= messageAlert;
    setTimeout(function() {      
      $scope.$apply(function() {
        $scope.messageAlert = null;
      });
    }, 3000);
  };
  $scope.user = User.get(function(response) {
    if (!response.user) {
      self.messageAlert("You are not authorized to update content");  
    } else {
      console.log(response.user);
      $scope.save = function () { 
        Project.save({_id:undefined},angular.extend({}, 
          $scope.project,
          {_id:undefined,user:$scope.user.user.identifier,"type":"post_project"}),
          function(result) { 
            console.log(result);
            if(result.success) {
              $location.path('/projects/'+$scope.project.year);
            }
        });
      } 
    };
  });
}

function ProjectEditController($scope, $routeParams, $location, Project,User, Logout) {
  var self = this;
  self.messageAlert = function(messageAlert) {
    $scope.messageAlert = messageAlert;
    setTimeout(function() {      
      $scope.$apply(function() {
        $scope.messageAlert = null;
      });
    }, 3000);
  };
  
  $scope.project = Project.get({id:$routeParams.projectId});  
  $scope.editField = function(field) {
    $scope.selectField = field;
    $scope.selectValue = $scope.project[field];
  }
  
  $scope.update = function() {
    $scope.project[$scope.selectField] = $scope.selectValue;
    Project.update({
      id:$routeParams.id
    }, angular.extend({}, $scope.project, {_id:undefined}), function(result) {      
      if(result.success) {
        self.messageAlert("Project Saved");                
      }
    });
  }  
  
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
