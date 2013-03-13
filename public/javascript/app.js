var app = angular.module('projectplan', ['mongorest_service','codemirror','$strap.directives']);

app.filter('skip', function() {
  return function(input, start) {
    start=+start;
    if(input) {
      return input.slice(parseInt(start));
    }
  }
});

app.filter('hide', function() {
  return function(input, key) {
    if(input) {
      var result = [];
      angular.forEach(input, function(v) {
        if(!v.hide) {
          result.push(v);
        }
      });
      return result;
    }
  }
});

app.config(function($routeProvider) {
  
  $routeProvider.when('/project/create', {
    controller:CreateProjectController, 
    templateUrl:'static/project_form.html'
  });    
  
  $routeProvider.when('/project/edit/field/:projectId', {
    controller:ProjectEditController, 
    templateUrl:'static/project_edit.html'
  });  
  
  $routeProvider.when('/project/edit/:projectId', {
    controller:ProjectController, 
    templateUrl:'static/project_form.html'
  });    
  
  $routeProvider.when('/project/info/:projectId', {
    controller:ProjectViewController, 
    templateUrl:'static/project_info.html'
  });   
  
  $routeProvider.when('/project/list', {
    controller:ProjectListController, 
    templateUrl:'static/project_list.html'
  });
  
  $routeProvider.when('/project/task/:projectId', {
    controller:MessageController, 
    templateUrl:'static/task_form.html'
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

function MainController($scope, $filter, User,Project ) {   
  $scope.project_list = Project.query({query:'{"type":"post_project","status":"กำลังดำเนินการ"}'}, function(res) {
    if(res.length>0) {
      $scope.current_project = res[0];
      var query = {'type':"post_message",'project_id':$scope.current_project._id};
        $scope.message_list = Project.query({query:JSON.stringify(query)});          
    }
  });
      
    
  $scope.select_project = function(project) {
    $scope.current_project = project;
    var query = {'type':"post_message",'project_id':project._id};
    $scope.message_list = Project.query({query:JSON.stringify(query)});
  };
  
  
  $scope.current_message = {'type':"post_message"};
  
  $scope.select_message = function(message) {
    $scope.current_message = message;   
  }
  
  $scope.new_message = function() {
    
    $scope.current_message = {'type':"post_message"};
    $scope.current_message['date_record'] = $filter('date')(new Date(),"dd/MM/yyyy");
    $scope.current_message['task_name'] = "[กรุณาเพิ่มข้อมูลส่วนนี้]";
  }
  
  $scope.save_message = function() {    
    if(!$scope.current_message._id) {
      var x = angular.extend({}, $scope.current_message,{project_id:$scope.current_project._id,owner:$scope.user});
      //console.log(x);
      
      Project.save(angular.extend({}, $scope.current_message,
       {project_id:$scope.current_project._id,owner:$scope.user}),
        function(result) {
          console.log(result);
          if(result.success) {                
            var query = {'type':"post_message",'project_id':$scope.current_project._id};
            $scope.message_list = Project.query({query:JSON.stringify(query)});                        
          }
      });
      
    } else {
      Project.update({id:$scope.current_message._id},
        angular.extend({}, $scope.current_message, {_id:undefined,
              project_id:$scope.current_project._id,
              owner:$scope.user}), 
        function(result) {      
           if(result.success) {
              var query = {'type':"post_message",'project_id':$scope.current_project._id};
              $scope.message_list = Project.query({query:JSON.stringify(query)});                        
           }
        });
    }                
  }
  
    //RemoveTask
  $scope.remove_message = function () {
    //console.log($scope.current_message._id);
    Project.delete({
      id:$scope.current_message._id
    },function(result) {            
      if(result.success) {                
        var query = {'type':"post_message",'project_id':$scope.current_project._id};
        $scope.message_list = Project.query({query:JSON.stringify(query)});                        
      }
    });
    
  };
    
  User.get(function(response) {    
    $scope.user_logon = response.user?true:false;
    if($scope.user_logon) {
      $scope.user = response.user;
    }
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
  
  Project.query({query:'{"type":"post_project", "year":"'+$routeParams.year+'"}'}, function(project_list) {    
    var owner_dict = {};
    angular.forEach(project_list, function(project) {
      if(!(project.owner in owner_dict)) {
        owner_dict[project.owner] = {'working':0};
      }      
      if(project.status == "กำลังดำเนินการ") {
        owner_dict[project.owner]['working']+=1;
      }
    });    
    console.log(owner_dict);
    
    var result = [];
    
    angular.forEach(owner_dict, function(value, owner_name) {
      result.push({'owner':owner_name, 'count':value});
    });
    
    console.log(result);
    $scope.result = result;
    $scope.project_list =  project_list;
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
      $scope.project = Project.get({id:$routeParams.projectId},function () {
        console.log($scope.project._id);
          var query_obj = {"project_id":$scope.project._id}; 
          Project.query({query:JSON.stringify(query_obj)}, function (result) {
           $scope.message_list = result;
           //console.log(result);
          });
      });  
        
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
          angular.forEach($scope.message_list, function(e_msg) {
            console.log(e_msg['project_id']);
            //console.log($scope.message_list.indexOf(e_msg));
            Project.delete({
              id:e_msg['_id']
            },function(result) {   
              //console.log(result);         
              $scope.success = result.success;
            });
            
          });
          
          Project.delete({
            id:$routeParams.projectId
          },function(result) {
            //console.log(result);            
            if(result.success) {        
              //$location.path('/projects/'+$scope.project.year);
              $location.path('/');
            }
          });
        }
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
        var query_obj = {"project_id":$scope.project._id}; 
        Project.query({query:JSON.stringify(query_obj)}, function (result) {
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
            var query_obj = {"project_id":$scope.project._id}; 
            Project.query({query:JSON.stringify(query_obj)}, function (result2) {
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
              var query_obj = {"project_id":$scope.project._id}; 
              Project.query({query:JSON.stringify(query_obj)}, function (result2) {
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
              var query_obj = {"project_id":$scope.project._id}; 
              Project.query({query:JSON.stringify(query_obj)}, function (result2) {
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
            var query_obj = {"project_id":$scope.project._id}; 
            Project.query({query:JSON.stringify(query_obj)}, function (result) {
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

function ProjectViewController($scope, $routeParams, $location, Project) {
  console.log("OK");
  $scope.project = Project.get({id:$routeParams.projectId});  
}
