app.config(function($routeProvider) {
 $routeProvider.when('/project/finance/list', {
    controller:ProjectFinanceListController, 
    templateUrl:'static/project_finance_list.html'
  });
 $routeProvider.when('/project/new', {
    controller:CreateNewProjectController, 
    templateUrl:'static/project_new_form.html'
    //templateUrl:'static/project_new_form.html'
  });    
  $routeProvider.when('/project/finance/create/:id', {
    controller:CreateProjectFinanceController, 
    templateUrl:'static/project_finance_form.html'
  });  
 $routeProvider.when('/task/create', {
    controller:CreateTaskByProjectController,  
    templateUrl:'static/task_create.html'
  }); 
  $routeProvider.when('/project/finance/edit/:projectId/:financeId', {
    controller:ProjectFinanceController, 
    templateUrl:'static/project_finance_form.html'
  });
  $routeProvider.when('/project/sub/:projectId', {
    controller:ProjectSubController,
    templateUrl:'static/sub_project_form.html'
  });


});

function ProjectFinanceListController($scope, $routeParams, Project, GradDB, User, Logout) {
  //var thai_year = parseInt($routeParams.id)-543;
    $scope.list_categories = {
        data: [
        {
            name: '2559'
        }, {
            name: '2558'
        }, {
            name: '2557'
        }]
    };       
    $scope.list_category = '2558';
  //var thai_year = parseInt($routeParams.id)-543;
  $scope.updateYear = function(){
  console.log($scope.list_category.name);
  var thai_year = parseInt($scope.list_category.name)-543;
  console.log(thai_year);
  
  var where_str = JSON.stringify({
    'str':'year = ? && status = ?',
    'json':[thai_year,1]
  });

 GradDB.query({'table':'grad_finance_financing',
   'where':where_str}, function(f_list) {
     var finance = f_list;
     $scope.finance_list = finance;
     var total_expend = 0;
     var total_wait = 0;
     var total_receive = 0;
     var total_out = 0;
     var total_in = 0;
     var total_kang = 0;
     var dict ={};
     if (finance.length > 0) {
       angular.forEach(finance, function(entry) { 
         
         //console.log(entry);
         var balance_start = entry.amount;
         if(!(entry.id in dict)){
           dict[entry.id] = {
             'name':entry.name,
             'found':[],
             'id':entry.id,
             'fund':entry.fund,
             'sum_expend':0,
             'sum_wait':0,
             'sum_out':0,
             'sum_in':0,
             'sum_kang':0,
             'start_balance':balance_start,
             'record':[],
             'finance':[]};
      
         }
         dict[entry.id]['finance'].push(entry);


        //Project.query({query:'{"type":"post_project","name":"'+entry.name+'", "year":"'+$routeParams.id+'"}'}, function(p) {    
        Project.query({query:'{"type":"post_project","name":"'+entry.name+'", "year":"'+$scope.list_category.name+'"}'}, function(p) {    
            if(p[0]){
               if(entry.name==p[0].name){
               dict[entry.id]['found'].push(p[0]);
               }
            }
         //});

         var where_s = JSON.stringify({
           'str':'financing_id = ?',
           'json' : [entry.id]
         });
         GradDB.query({'table':'grad_finance_record',
           'where':where_s}, function(record_list) {
             angular.forEach(record_list, function(record,key) {
               //console.log(record);
               //console.log("====="+record.financing_id);
               //console.log("เงินโอน"+record.amount);
               if(!(dict[entry.id]['record'][key] in dict)){
                 dict[entry.id]['record'][key] = {'balance_start':balance_start
                 ,'total_receive':0,'total_out':0,'total_in':0
                 ,'total_expend':0,'total_wait':0,'total_kang':0};
               }
               if (record.mode == "I") {
                 total_out+=record.amount;
                 dict[entry.id]['record'][key]['total_in']+=record.amount;
                 dict[entry.id]['sum_in']+=record.amount;
               }

               if (record.mode == "O") {
                 total_out+=record.amount;
                 dict[entry.id]['record'][key]['total_out']+=record.amount;
                 dict[entry.id]['sum_out']+=record.amount;
               }
               if (record.mode == "O"||record.mode == "E"||record.mode == "U" ||record.mode == "A") {
                 //balance_start-=record.amount;
                 total_expend+=record.amount;
                 dict[entry.id]['record'][key]['total_expend']+=record.amount;
                 dict[entry.id]['sum_expend']+=record.amount;
               }else{
                 if (record.mode == "P") {
                   total_wait+=record.amount;
                   dict[entry.id]['sum_wait']+=record.amount;
                   dict[entry.id]['record'][key]['total_wait']+=record.amount;
                 } else {
                   //balance_start+=record.amount;
                   //total_receive+=record.amount;
                   //console.log("รวมแล้ว"+balance_start);
                   // $scope.balance_start2 = balance_start; 
                   dict[entry.id]['start_balance']+=record.amount;
                   dict[entry.id]['record'][key]['balance_start']+=record.amount;
                   dict[entry.id]['record'][key]['total_receive']+=record.amount;
                 }
               }
               
               
                //dict[entry.id]['sum_expend']+=record.amount;
             });
         });
             //dict[entry.id]['end_balance']=record.amount;
         }); 

       }); 
       var result = [];
       angular.forEach(dict, function(value, key) {
         result.push({'finance_id':key, 'project':value});
       });
       $scope.p_list = result;
       console.log(result);

       $scope.currentRole = ['A','B','C','D'];
       $scope.CreateHeader = function(fund) {
         showHeader = (fund!=$scope.currentRole); 
         $scope.currentRole = fund;
         return showHeader;
      } 
     }else{

     }
 }); 
 };
};

function CreateNewProjectController($scope, $location, Project, $routeParams,User, Logout) {
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

function CreateProjectFinanceController($scope, Project,$routeParams, GradDB, User, Logout, $location) {
  
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

    
      var where_str = JSON.stringify({
        'str':'id = ?',
        //'json':[thai_year,$routeParams.id]
        'json':[$routeParams.id]
      });

      GradDB.query({'table':'grad_finance_financing',
        'where':where_str}, function(project) {
           var project_obj = [];
           project_obj = project[0]
           $scope.project =  [];
           var total_expend = 0;
           var sum_expend = 0;
           var total_wait = 0;
           var total_receive = 0;
           var total_out = 0;
           var total_in = 0;
           var total_kang = 0;
           var dict ={};
           var balance_start = project_obj.amount;
           var thai_year = parseInt(project_obj.year)+543;
           //console.log(thai_year);
           console.log(balance_start);
           if (!(project_obj.id in dict)) {
             dict[project_obj.id] = {
               'record':[],
               'sum_expend':0,
               'sum_wait':0,
               'sum_out':0,
               'sum_in':0,
               'sum_kang':0,
               'start_balance':balance_start,
               'sum_start_balance':0,
               'name':project_obj.name,
               'fund':project_obj.fund,
               'financeid':project_obj.id,
               'year':thai_year.toString()
             };
           }
           //dict[project_obj.id]['project'].push(project_obj);
           var where_s = JSON.stringify({
             'str':'financing_id = ?',
             'json' : [project_obj.id]
           });
           GradDB.query({'table':'grad_finance_record',
             'where':where_s}, function(record_list) {
               angular.forEach(record_list, function(record,key) {
                 console.log(record);
                 if(!(dict[project_obj.id] in dict)){
                   dict[project_obj.id]['record'][key] = {
                     'balance_start':balance_start
                     ,'total_receive':0,'total_out':0,'total_in':0
                     ,'total_expend':0,'total_wait':0,'total_kang':0};
                 }

                 if (record.mode == "I") {
                   total_in+=record.amount;
                 }
                 if (record.mode == "O") {
                   total_out+=record.amount;
                 }
                 if (record.mode == "O"||record.mode == "E"||record.mode == "U" ||record.mode == "A") {
                   //balance_start-=record.amount;
                   total_expend+=record.amount;
                   dict[project_obj.id]['record'][key]['total_expend']+=record.amount;
                   dict[project_obj.id]['sum_expend']+=record.amount;
                 }else{
                   if (record.mode == "P") {
                     total_wait+=record.amount;
                     dict[project_obj.id]['sum_wait']+=record.amount;
                     dict[project_obj.id]['record'][key]['total_wait']+=record.amount;
                   } else {
                     balance_start+=record.amount;
                     total_receive+=record.amount;
                     dict[project_obj.id]['start_balance']+=record.amount;
                     //console.log("รวมแล้ว"+balance_start);
                     // $scope.balance_start2 = balance_start;
                     dict[project_obj.id]['record'][key]['balance_start']+=record.amount;
                     dict[project_obj.id]['record'][key]['total_receive']+=record.amount;
                   }
                 }

               });
           });
           var result = [];
           angular.forEach(dict, function(value, key) {
             var total = 0;
             console.log(value);
             result.push(value);
           });
           $scope.project = result[0];
           $scope.projectfinance = result[0];
           //$scope.project.push(result);
           //console.log($scope.project);
           $scope.save = function () {
             Project.save({_id:undefined},angular.extend({},
             $scope.project,
             //{_id:undefined,user:$scope.user.user.identifier,"type":"post_project"}),
             {_id:undefined,"type":"post_project"}),
               function(result) {
                 console.log(result);
                 if(result.success) {
                   //console.log("Ok");
                   var thai_year = parseInt($scope.project.year)+543;
                   $location.path('/project/finance/list/');
                 }
               });
             }

      });
    }
    
 });
};

function CreateTaskByProjectController($scope, $filter, GradDB, User,Project ,$routeParams ) {   

  User.get(function(response) {
    $scope.tasktype_list = [
      {'name':'ติดต่อวิทยากร'},
      {'name':'ติดต่อสถานที่'},
      {'name':'ยืมเงิน'},
      {'name':'ประชาสัมพันธ์'},
      {'name':'ประสานงานผู้เกี่ยวข้อง'},
      {'name':'หนังสือเชิญวิทยากร'},
      {'name':'คำกล่าวรายงาน'},
      {'name':'ประชุมเตรียมการ'},
      {'name':'เอกสารประกอบโครงการ'},
      {'name':'อาหารว่าง/เคร่ืองดื่ม'},
      {'name':'ป้ายตั้งโต๊ะ'},
      {'name':'แบบประเมิน'},
      {'name':'นัดหมายการแต่งกาย'},

    ];
    getMoney(GradDB, Project,"52ccee70f564a17d4100002b", function(m, a, b, c ,o, i, k) {
       console.log(m);
        //owner_dict[res.owner]['total_start']+=m;      
    });

    $scope.user_logon = response.user?true:false;
    if($scope.user_logon) {
        $scope.user = response.user;
        console.log($scope.user);
       // var year = '2559';
        if($scope.user.role[0]=='plan'){
            var query = '{"type":"post_project","status":"กำลังดำเนินการ","owner":"งานแผนและสารสนเทศ"}';
        } else {
            if($scope.user.role[0]=='acdemic'){
              var query = '{"type":"post_project","status":"กำลังดำเนินการ","owner":"งานวิชาการ"}';
            } else {
              if($scope.user.role[0]=='research'){
                var query = '{"type":"post_project","status":"กำลังดำเนินการ","owner":"งานวิจัยและวิเทศสัมพันธ์"}';
              } else {
                if($scope.user.role[0]=='press'){
                  var query = '{"type":"post_project","status":"กำลังดำเนินการ","owner":"สำนักพิมพ์มหาวิทยาลัยนเรศวร"}';
                } else {
                  if($scope.user.role[0]=='direct'){
                    var query = '{"type":"post_project","status":"กำลังดำเนินการ","owner":"งานอำนวยการ"}';
                  } else {
                    var query = '{"type":"post_project","status":"กำลังดำเนินการ"}';
                  }
                }
              }
            }
          }
        } else {
          var query = '{"type":"post_project","status":"กำลังดำเนินการ","year":"'+year+'"}';
        }
      //});

  //$scope.project_list = Project.query({query:'{"type":"post_project","status":"กำลังดำเนินการ"}'}, function(res) {
      $scope.project_list = Project.query({query:query}, function(res) {

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
          var x = angular.extend({}, $scope.current_message,{project_id:$scope.current_project._id});
          //console.log(x);
      
          Project.save(angular.extend({}, $scope.current_message,
            {project_id:$scope.current_project._id
          }),function(result) {
            console.log(result);
            if(result.success) {                
              var query = {'type':"post_message",'project_id':$scope.current_project._id};
              $scope.message_list = Project.query({query:JSON.stringify(query)});                        
            }
          });
      
        } else {
          Project.update({id:$scope.current_message._id},
          angular.extend({}, $scope.current_message, {_id:undefined,
              project_id:$scope.current_project._id
          }),function(result) {      
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
    
   }); 
};

function ProjectFinanceController($scope, GradDB, $routeParams, $location, Project,User, Logout) {
 
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
             });  
          });  

          $scope.save = function () {		
            Project.update({      
              id:$routeParams.projectId
            }, angular.extend({}, $scope.project,{_id:undefined}), 
              function(result) {
                $scope.save_result = result;
                if(result.success) {
                  self.messageAlert("บันทึกข้อมูลเรียบร้อยแล้ว");
                  $location.path('/project/finance/info/'+$scope.project._id+'/'+$scope.project.financeid);
                }else{
                   self.messageAlert("ข้อมูลยังไม่บันทึก");
                }
              });    
          };

          $scope.save_form = function () {
            Project.update({
              id:$routeParams.projectId
            }, angular.extend({}, $scope.project,{_id:undefined}),
              function(result) {
                $scope.save_result = result;
                if(result.success) {
                  self.messageAlert("บันทึกข้อมูลเรียบร้อยแล้ว");
                  $location.path('/project/finance/edit/'+$scope.project._id+'/'+$scope.project.financeid);
                }else{
                   self.messageAlert("ข้อมูลยังไม่บันทึก");
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

function ProjectSubController($scope, $routeParams, $location, Project,User, Logout) {
  var self = this;
  self.messageAlert = function(messageAlert) {
    $scope.messageAlert= messageAlert;
    setTimeout(function() {      
      $scope.$apply(function() {
        $scope.messageAlert = null;
      });
    }, 3000);
  };

  self.messageValidate = function(messageValidate) {
    $scope.messageValidate= messageValidate;
    setTimeout(function() {
      $scope.$apply(function() {
        $scope.messageValidate = null;
      });
    }, 3000);
  };

  //$scope.user = User.get(function(response) {
    $scope.views = {
      project_form : 'static/project_form.html'
    }
    Project.get({id:$routeParams.projectId},function (response) {
      $scope.project = response;
      $scope.current_id = $scope.project._id;
      //console.log($scope.project._id);
      if (response) {
        console.log(response);
        var query_obj = {"project_id":$scope.project._id, 
             type:"post_subproject"}; 
        Project.query({query:JSON.stringify(query_obj)}, function (result) {
          $scope.subproject_list = result;
          console.log(result);
        });
      }
    });

    //if (!response.user) {
      //self.messageAlert("You are not authorized to update content");  
    //} else {
      //updateMessage
      $scope.editField = function(mes) {
        $scope.selectMessage = mes;
        console.log($scope.selectMessage);
        $scope.subproject = Project.get({id:$scope.selectMessage},function(result){
          console.log(result);
        });
      }

      //createMessage
      $scope.createMessage = function(){
        $scope.subproject = null;
        Project.save({_id:undefined},
          angular.extend({}, 
          {_id:undefined,subname:"sub",
            project_id:$routeParams.projectId,
            //owner:$scope.user.user.profile.name.givenName,
            type:"post_subproject"}),
          function(result) { 
            console.log(result);
            if(result.success) {
              self.messageAlert("Message Saved");
              Project.query({project_id:$routeParams.projectId}, function (result2) {
                $scope.subproject_list = result2;
              });
            } else {
              self.messageAlert("Message don't Saved");
            }
            var query_obj = {"project_id":$scope.project._id}; 
            Project.query({query:JSON.stringify(query_obj)}, function (result2) {
              $scope.subproject_list = result2;
            });
          });
      };

      //SaveTask
      $scope.subProjectSave = function () { 
        if(!$scope.selectMessage) {
          Project.save({_id:undefined},
            angular.extend({}, 
            $scope.subproject,
            {_id:undefined,project_id:$routeParams.projectId,
              //owner:$scope.user.user.profile.name.givenName,
              type:"post_subproject"}),
            function(result) { 
              //console.log(result);
              if(result.success) {
                self.messageAlert("Message Saved");
                Project.query({project_id:$routeParams.projectId}, function (result2) {
                  $scope.subproject_list = result2;
                });
              } else {
                self.messageAlert("Message don't Saved");
              }

              var query_obj = {"project_id":$scope.project._id}; 
              Project.query({query:JSON.stringify(query_obj)}, function (result2) {
                $scope.subproject_list = result2;
              });
            });
        } else {
          if(!$scope.subproject.ptypeinfo){
            self.messageValidate("Message don't Saved You Must fill!");
          }else{
            Project.update({
              id:$scope.selectMessage
            }, angular.extend({},
              $scope.subproject,
              {_id:undefined,
                project_id:$routeParams.projectId,
                //owner:$scope.user.user.profile.name.givenName,
                type:"post_subproject"}),
             function(result) {
               if(result.success) {
                 self.messageAlert("Message Saved");
                 var query_obj = {"project_id":$scope.project._id};
                 Project.query({query:JSON.stringify(query_obj)}, function (result2) {
                   $scope.subproject_list = result2;
                 });
               }
             });
          }
        }
      };

      //RemoveTask
      $scope.remove_message = function (sub_id) {
        Project.delete({
          id:sub_id
        },function(result) {
          if(result.success) {
            var query_obj = {"project_id":$scope.project._id};
            Project.query({query:JSON.stringify(query_obj)}, function (result) {
                $scope.subproject_list = result;
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

    //};
   //});

}
