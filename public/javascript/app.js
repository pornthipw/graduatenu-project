var app = angular.module('projectplan', ['mongorest_service','codemirror','$strap.directives','highcharts-ng','app.filters']);

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

app.filter('gt', function () {
    return function ( project_list, value ) {
        var filteredItems = []
        angular.forEach(project_list, function ( project ) {
            if ( project > value ) {
                filteredItems.push(project);
            }
        });
        return filteredItems;
    }
})

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
  
  $routeProvider.when('/project/list/:year', {
    controller:ProjectListController, 
    templateUrl:'static/project_list.html'
  });

  $routeProvider.when('/projects/:year/dept', {
    controller:ProjectListByYearStatusDeptController, 
    templateUrl:'static/project_status_dept.html'
  });

  $routeProvider.when('/project/finance/edit/:projectId/:financeId', {
    controller:ProjectFinanceController, 
    templateUrl:'static/project_finance_form.html'
  });    

  $routeProvider.when('/project/finance/list/:id', {
    controller:ProjectFinanceListController, 
    templateUrl:'static/project_finance_list.html'
  });

  $routeProvider.when('/project/finance/info/:projectId/:financeId', {
    controller:ProjectFinanceViewController, 
    templateUrl:'static/project_finance_info.html'
  });
  
  $routeProvider.when('/project/finance/create/:id', {
    controller:CreateProjectFinanceController, 
    templateUrl:'static/project_finance_form.html'
  });    
  $routeProvider.when('/project/new', {
    controller:CreateNewProjectController, 
    templateUrl:'static/project_new_form.html'
    //templateUrl:'static/project_new_form.html'
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
  $routeProvider.when('/projects/warning/:year', {
    controller:ProjectListWarningByYearController, 
    templateUrl:'static/project_list_warning.html'
  });   

  $routeProvider.when('/projects/:year', {
    controller:ProjectListByYearController, 
    templateUrl:'static/project_main.html'
  });   
/*
  $routeProvider.when('/projects/report/:year', {
    controller:ProjectListReportByYearController, 
    templateUrl:'static/report_list.html'
  });   
*/
  $routeProvider.when('/projects/:year/status', {
    controller:ProjectListByYearStatusController, 
    templateUrl:'static/project_status.html'
  });   

  $routeProvider.when('/task/create', {
    controller:CreateTaskByProjectController,  
    templateUrl:'static/task_create.html'
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
  $scope.user = User.get(function(res) {
    console.log(res);
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

function MainController($scope, $filter, GradDB, User,Project ) {   

};

function CreateTaskByProjectController($scope, $filter, GradDB, User,Project ) {   
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

      getMoney(GradDB, Project,"52ccee70f564a17d4100002b", function(m, a, b, c ,o) {
       console.log(m);
        //owner_dict[res.owner]['total_start']+=m;      
      });
  
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
  console.log("test");
  var orig = null;
  $scope.users = Admin.query();
  //console.log($scope.users);
  $scope.get_user = function(id) {
    Admin.get({'id':id}, function(user) {
      //console.log(user);
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
    //console.log($scope.user);
    angular.forEach($scope.user.role, function(value, idx) {
      db_role.push(value.name);
      //console.log(value);
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
  /*
  $scope.user = User.get(function(response) {
    console.log("test");
    console.log(response);
    if (response.user | $scope.user) {
      Project.query(function(response){
  
      }); 
    }
  });
  */

  $scope.current_year = $routeParams.year;
  $scope.selectedStatus = [];
  $scope.statusList = [{
        status: 'อยู่ระหว่างดำเนินการ'
    }, {
        status: 'ดำเนินการแล้ว'
    }, {
        status: 'ยังไม่ได้ดำเนินการ'
    }, {
        status: 'ยกเลิก'
    }];
  //Project.query({query:'{"type":"post_project", "year":"'+$routeParams.year+'"}'}, function(project_list) {    
  Project.query({query:'{"type":"post_project", "year":"'+$routeParams.year+'"}'}, function(project_list) {    
    $scope.project_list = project_list;
    //$scope.selectedOwner = [];
    console.log("test"); 
    console.log(project_list); 
  });
 $scope.setSelectedStatus = function () {
        var status = this.status;
        if (_.contains($scope.selectedStatus, status)) {
            $scope.selectedStatus = _.without($scope.selectedStatus, status);
        } else {
            $scope.selectedStatus.push(status);
        }
        return false;
    };
    $scope.isChecked = function (status) {
        if (_.contains($scope.selectedStatus, status)) {
            return 'icon-ok pull-right';
        }
        return false;
    };
 $scope.checkAll = function () {
        $scope.selectedStatus = _.pluck($scope.statusList, 'status');
    };


}
function getThaiDate(datevalue, cb) {
      var date_new = {};
      date_new['date'] = datevalue.date;
      date_new['year'] = datevalue.year + 543;
      date_new['month'] = datevalue.month + 1;
      var month_array = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"];
      date_new['month'] = month_array[datevalue.month];
      cb(date_new);
   //cb(finance.amount, total_wait, total_expend, total_receive);
}

function getMoney(GradDB, Project, projectId, cb) {
  Project.get({id:projectId},function(project) {
    var where_str = JSON.stringify({
      'str':'id = ?',
      'json':[project.financeid]
    });

    GradDB.query({'table':'grad_finance_financing',
      'where':where_str}, function(f_list) {
       var total_expend = 0;
       var total_wait = 0;
       var total_receive = 0;
       var total_out = 0;
       var dict ={};
       if(f_list.length > 0) {
         var finance = f_list[0];
         var where_s = JSON.stringify({
           'str':'financing_id = ?',
           'json' : [finance.id]
         });
         GradDB.query({'table':'grad_finance_record','where':where_s}, function(record_list) {
           angular.forEach(record_list, function(record,key) {
             if (record.mode == "O"||record.mode == "E"||record.mode == "U" ) {
               total_expend+=record.amount;
             } else{
               if (record.mode == "P") {
                 total_wait+=record.amount;
               } else {
                   total_receive+=record.amount;
               }
             }
              
               if (record.mode == "O") {
                   total_out+=record.amount;
               }
            }
           );
           cb(finance.amount, total_wait, total_expend, total_receive, total_out);
         }); 
       } 
     });
   });
}

function ProjectListWarningByYearController($scope, GradDB,$routeParams, Project,User, Logout) {
    $scope.current_year = $routeParams.year;
    //
    var t_year = parseInt($routeParams.year)-543;
    $scope.chk = "";
    $scope.filterProject = function (valchk) {
      $scope.chk = parseInt(valchk);
    }
    //$scope.filterProject = function (valchk) {
      //console.log("test");
      //console.log(val);
      //$scope.chk = parseInt(valchk);
      var fstrDate = 03+'/'+31+'/'+t_year;
      var fstatusDate =  new Date(fstrDate).getTime();
      var estrDate = 09+'/'+30+'/'+t_year;
      var estatusDate =  new Date(estrDate).getTime();
      var d = new Date();
      var curr_date = d.getDate();
      var curr_month = d.getMonth()+1;
      var curr_year = d.getFullYear();
      var ndateToday = Date.parse(curr_month + "/" + curr_date + "/" + curr_year);
      //if (valchk==1 ||valchk==2){
        //var fstrDate = 03+'/'+31+'/'+t_year;
        //var fstatusDate =  new Date(fstrDate).getTime();
        //$scope.fdateRange = fstatusDate;
        //var estrDate = 09+'/'+30+'/'+t_year;
        //var estatusDate =  new Date(estrDate).getTime();
        //$scope.edateRange = estatusDate;
        //console.log(fstrDate);
        //console.log(fstatusDate);
      //}
       //else{
    //}
        //if (val=='' || val==0){
            //Current Date
            //var d = new Date();
            //var curr_date = d.getDate();
            //var curr_month = d.getMonth()+1;
            //var curr_year = d.getFullYear();
    
            //$scope.dateToday = Date.parse(curr_month + "/" + curr_date + "/" + curr_year);
            //$scope.dateRange = ""; 
            //console.log($scope.dateToday);
        //}
      //}
            $scope.dateToday = Date.parse(curr_month + "/" + curr_date + "/" + curr_year);

      

    Project.query({query:'{"type":"post_project","year":"'+$routeParams.year+'"}'}, 
    //Project.query({query:'{"type":"post_project","status":"ยังไม่ได้ดำเนินการ" ,"year":"'+$routeParams.year+'"}'}, 
      function(project_list) {    
        //console.log("test");
        //$scope.project_list = project_list;
        dict = {}; 
        dict_late = {}; 
        owner_dict = {}; 
        var dict_sum = {};
        $scope.sum = [];
        angular.forEach(project_list, function(project) {
          if(!(project.year in dict)) {
            dict[project.year] = {
             'type':{},
             'alert1':0,
             'late':0,
             'owner':{}
            }
          }

          if(!(project.owner in owner_dict)) {
            owner_dict[project.owner] = {'working':0,
              'finish':0,
              'cancle':0,
              'no':0,
              'all':0,
              'total_start':0,
              'total_expend':0,
              'total_wait':0,
              'total_receive':0,
              'total_out':0,
              'fund':{}
            };
          }      
          if(!project.fund) {
            project.fund = 'Z';
          }
      
          if(!(project.fund in owner_dict[project.owner]['fund'])) {
            owner_dict[project.owner]['fund'][project.fund] = [];
          } 
         
          if(!(project.owner in dict[project.year]['owner'])) {
            dict[project.year]['owner'][project.owner] = {'late':0,'alert':0};
          } 


          if(!(project.year in dict_sum)) {
            dict_sum[project.year]={'start':0,
            'wait':0,'receive':0,'expend':0,'balance':0,'out':0};
            //dict_sum.push(project.year);
          }
          owner_dict[project.owner]['fund'][project.fund].push(project);
          if (project.date_plan){
            var date_plan = project.date_plan;
            //var end_date_plan = project.end_date_plan;
            var dateSplitted = date_plan.split('/');
            var formattedDate = dateSplitted[1]+'/'+dateSplitted[0]+'/'+dateSplitted[2];
            var new_date_plan =  new Date(formattedDate).getTime();
            project.new_date_plan =  new Date(formattedDate).getTime();
            //console.log(new_date_plan);
            var formattedDate_check = dateSplitted[1]+'/'+dateSplitted[0]+'/'+dateSplitted[2];
            var new_date_check =  new Date(formattedDate_check);
            var day_check = new_date_check.getDate()+30;
            //console.log(day_check);
            var formattedDate_new = dateSplitted[1]+'/'+day_check+'/'+dateSplitted[2];
            //console.log(formattedDate_new);
            var new_date =  new Date(formattedDate_new).getTime();
            //console.log(new_date);
            project.new_date_check =  new_date;

            //console.log($scope.dateToday);
          if (new_date_plan < ndateToday) {
            project.type = 'current';
          }

          if (new_date_plan <= fstatusDate) {
            project.type = 'first';
          } else {
            project.type = 'second';
          }
            if(!(project.type in dict[project.year]['type'])) {
               dict[project.year]['type'][project.type] = {'w':0,
                 'f':0,
                 'n':0,
                 'a':0,
                 'c':0,
                 'list_alert':[],
                 'alertowner':{},
                 'allowner':{},
                 'lateowner':{},
                 'list_late':[],
                 'list_project':[],
                 'alert':0,
                 'late':0};
            }
         
            if(!(project.owner in dict[project.year]['type'][project.type]['alertowner'])) {
               dict[project.year]['type'][project.type]['alertowner'][project.owner] = 
                {'list':[]};
                 //dict[project.year]['type'][project.type]['list_alert'].push(project);
            }
            if(!(project.owner in dict[project.year]['type'][project.type]['lateowner'])) {
               dict[project.year]['type'][project.type]['lateowner'][project.owner] = 
                {'list':[]};
                 //dict[project.year]['type'][project.type]['list_alert'].push(project);
            }
            if(!(project.owner in dict[project.year]['type'][project.type]['allowner'])) {
               dict[project.year]['type'][project.type]['allowner'][project.owner] = 
                {'list':[]};
                 //dict[project.year]['type'][project.type]['list_alert'].push(project);
            }

            if( project.new_date_plan < ndateToday && ndateToday < project.new_date_check){
                 dict[project.year]['type'][project.type]['list_project'].push(project);
                 dict[project.year]['type'][project.type]['allowner'][project.owner]['list'].push(project);
            } else {
              if(project.new_date_plan < ndateToday && ndateToday > project.new_date_check){
                 dict[project.year]['type'][project.type]['list_project'].push(project);
                 dict[project.year]['type'][project.type]['allowner'][project.owner]['list'].push(project);
              }
            }

            if(project.status == "ยังไม่ได้ดำเนินการ" && project.new_date_plan < ndateToday && ndateToday < project.new_date_check){
                 dict[project.year]['alert1']+=1;
                 dict[project.year]['owner'][project.owner]['alert']+=1;
                 dict[project.year]['type'][project.type]['alert']+=1;
                 dict[project.year]['type'][project.type]['list_alert'].push(project);
                 dict[project.year]['type'][project.type]['alertowner'][project.owner]['list'].push(project);
            }else{
                if(project.status == "ยังไม่ได้ดำเนินการ" && project.new_date_plan < ndateToday && ndateToday > project.new_date_check){
                  dict[project.year]['late']+=1;
                  dict[project.year]['owner'][project.owner]['late']+=1;
                  dict[project.year]['type'][project.type]['late']+=1;
                  dict[project.year]['type'][project.type]['list_late'].push(project);
                  dict[project.year]['type'][project.type]['lateowner'][project.owner]['list'].push(project);
                }
            }

            if (project.new_date_plan <= fstatusDate ){
                dict[project.year]['type'][project.type]['a']+=1;
                if(project.status == "ยังไม่ได้ดำเนินการ"){  
                    dict[project.year]['type'][project.type]['n']+=1;
                }else {
                    if(project.status == "ดำเนินการแล้ว") {
                        dict[project.year]['type'][project.type]['f']+=1;
                    }else{
                      if(project.status == "กำลังดำเนินการ") {
                        dict[project.year]['type'][project.type]['w']+=1;
                      }else{
                        if(project.status == "ยกเลิก") {
                          dict[project.year]['type'][project.type]['c']+=1;
                        //dict[project.year]['type'][project.type]['a']+=1;
                        }
                      }
                    }
                }
             }else {
                if (project.new_date_plan > fstatusDate ){
                    dict[project.year]['type'][project.type]['a']+=1;
                    if(project.status == "ยังไม่ได้ดำเนินการ"){  
                        dict[project.year]['type'][project.type]['n']+=1;
                    }else {
                        if(project.status == "ดำเนินการแล้ว") {
                            dict[project.year]['type'][project.type]['f']+=1;
                        }else{
                            if(project.status == "กำลังดำเนินการ") {
                                dict[project.year]['type'][project.type]['w']+=1;
                            }else{
                              if(project.status == "ยกเลิก") {
                                dict[project.year]['type'][project.type]['c']+=1;
                              }
                            }
                        }
                    }
                 }
             }


          }
          //dict[project.fund]['listproject'].push(project);      


          if(project.status == "กำลังดำเนินการ") {
            owner_dict[project.owner]['working']+=1;
          }else {
            if(project.status == "ดำเนินการแล้ว") {
              owner_dict[project.owner]['finish']+=1;
             }else{
               if(project.status == "ยังไม่ได้ดำเนินการ") {
                 owner_dict[project.owner]['no']+=1;
               }else{
                 if(project.status == "ยกเลิก") {
                   owner_dict[project.owner]['cancle']+=1;
                 }
               }
             }
          }
          if((project.status == "กำลังดำเนินการ") ||(project.status == "ดำเนินการแล้ว") ||(project.status == 'ยังไม่ได้ดำเนินการ')||(project.status == 'ยกเลิก')) {
              owner_dict[project.owner]['all']+=1;
          }


          //console.log(new_date_plan);
          //console.log(project.new_date_check);
          if (!(project.year in dict_late)){
            dict_late[project.year] = {'project':[]}; 
          }
          dict_late[project.year]['project'].push(project); 

        });
        var result = [];
    
        angular.forEach(owner_dict, function(value, name) {
          result.push({'owner':name, 'count':value});
        });
    
        //$scope.result = result;
        //$scope.project_list =  project_list;
        $scope.year = $routeParams.year;
        //console.log(result);

        var result_alert =[];
        angular.forEach(dict,function (value,key) {
          result_alert.push({'year':key,'list':value});
        });
        //console.log(result_alert);

        var result_late =[];
        angular.forEach(dict_late,function (value,key) {
          result_late.push({'year':key,'list':value});
        });
      //console.log(result[0].list.project);
        $scope.project_list = result_late[0].list.project;
        $scope.project_list_new = result_alert[0].list.type;
        console.log(result_alert[0]);
        $(function () {
    	  // Radialize the colors
            // Build the chart
           $('#container1').highcharts({
              chart: {
                  plotBackgroundColor: null,
                  plotBorderWidth: null,
                  plotShadow: false
              },
              title: {
                //text: 'สรุปสถานภาพโครงการที่"ยังไม่ได้ดำเนินการ"ประจำปี '+$routeParams.year
                text: 'สรุปสถานภาพโครงการประจำปี '+$routeParams.year
              },
              tooltip: {
        	    pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>',
                    percentageDecimals:1 
              },
              plotOptions: {
                pie: {
                    allowPointSelect: true,
                    cursor: 'pointer',
                    dataLabels: {
                        enabled: true,
                        color: '#000000',
                        connectorColor: '#000000',
                        formatter: function() {
                            return '<b>'+ this.point.name +'</b>: '+ this.percentage.toFixed(2) +' %';
                        }
                    }
                }
              },
              series: [{
                type: 'pie',
                name: 'คิดเป็น',
                data: [
                    ['โครงการครึ่งปีแรก',   result_alert[0].list.type.first.a],
                    ['โครงการครึ่งปีหลัง', result_alert[0].list.type.second.a]
                    //['โครงการที่ต้องเร่งรัด',   result_alert[0].list.alert1],
                    //['โครงการที่ล่าช้า(ณ วันที่ปัจจุบัน)',       result_alert[0].list.late]
                ]
              }]
           });
        });

        //niew gedeelte
        var options = {
          colors: [],
          chart: {
            renderTo: 'container1',
            defaultSeriesType: 'spline'
          },
          series: []
        };
        $("#change").click(function(){
          if ($("#list").val() == "A")
          {
            //options.colors: ["#FE9A2E", "#21610B", "#0B173B", "#DF0101"]
            options.series = [{
                type: 'pie',
                name: 'คิดเป็น',
                //data: [[result_alert[0].list.type.first.a]]
                data: [
                    ['โครงการครึ่งปีแรก',   result_alert[0].list.type.first.a],
                    ['โครงการครึ่งปีหลัง', result_alert[0].list.type.second.a]
                ]

            }]
            //$.get('/dough/includes/live-chart.php?mode=month'
          }
          else
          
          {
           
            if ($("#list").val() == "B")
              {
              options.series = [{
                  type: 'pie',
                  name: 'สถานภาพโครงการครึ่งปีแรกปี'+$routeParams.year, 
                  data: [
                    ['ยังไม่ได้ดำเนินการ',   result_alert[0].list.type.first.n],
                    ['อยู่ระหว่างดำเนินการ', result_alert[0].list.type.first.w],
                    ['ดำเนินการแล้ว', result_alert[0].list.type.first.f],
                    ['ยกเลิก', result_alert[0].list.type.first.c]
                  ]
                  //data: [3,2,1,2,3]
              }]
              //$.get('/dough/includes/live-chart.php?mode=newmode'
             } 
            else
 
             {
            if ($("#list").val() == "C")
              {
              options.series = [{
                  type: 'pie',
                  name: 'สถานภาพโครงการครึ่งปีหลังปี'+$routeParams.year, 
                  data: [
                    ['ยังไม่ได้ดำเนินการ',   result_alert[0].list.type.second.n],
                    ['อยู่ระหว่างดำเนินการ', result_alert[0].list.type.second.w],
                    ['ดำเนินการแล้ว', result_alert[0].list.type.second.f],
                    ['ยกเลิก', result_alert[0].list.type.second.c]
                  ]
                  //data: [3,2,1,2,3]
              }]
              //$.get('/dough/includes/live-chart.php?mode=newmode'

             }

             else
             {
               options.series = [{
                  type: 'pie',
                  name: 'สถานภาพโครงการที่ยังไม่ได้ดำเนินการปี'+$routeParams.year,
                  data: [
                    ['โครงการที่ต้องเร่งรัด',   result_alert[0].list.alert1],
                    ['โครงการที่ล่าช้า(ณ วันที่ปัจจุบัน)',       result_alert[0].list.late]
                  ]
                  //data: [3,2,1,2,3]
              }]
             }
           }
          } 
          
          var chart = new Highcharts.Chart(options);    
       });

       // nieuw gadeelte
       var options = { 
         chart: {
           renderTo: 'container1',
           defaultSeriesType: 'spline',
           plotBackgroundColor: null,
           plotBorderWidth: null,
           plotShadow: false
         },
         series: []
       };


    ////// 

    });

    /*
    $scope.eventDateFilter = function(column) {
        if(column === 'today') {
            $scope.dateRange = $scope.dateToday;
        } else if (column === 'pastWeek') {
            //need logic
        } else if (column === 'pastMonth') {
            //need logic            
        } else if (column === 'future') {
            //need logic
        } else {
            $scope.dateRange = "";
        }
    }
    */
   //}
}

function ProjectListByYearController($scope, GradDB,$routeParams, Project,User, Logout) {
  $scope.current_year = $routeParams.year;
  //Project.query({query:'{"type":"post_project", "year":"'+$routeParams.year+'"}'}, function(project_list) {    
  Project.query({query:'{"type":"post_project", "year":"'+$routeParams.year+'"}'}, function(project_list) {    
    //var owner_dict = {};

    var owner_dict = {};
    var dict_sum = {};
    $scope.test = [];
    console.log("nook");
    $scope.sum = [];
    
    angular.forEach(project_list, function(project) {
      if(!(project.owner in owner_dict)) {
        owner_dict[project.owner] = {'working':0,
            'finish':0,
            'no':0,
            'cancle':0,
            'all':0,
            'total_start':0,
            'total_expend':0,
            'total_wait':0,
            'total_receive':0,
            'total_out':0,
            'fund':{},
            'listproject':[]
            };
      }      
      if(!project.fund) {
        project.fund = 'Z';
      }
      
      if(!(project.fund in owner_dict[project.owner]['fund'])) {
        owner_dict[project.owner]['fund'][project.fund] = [];
      } 

      if(!(project.year in dict_sum)) {
        dict_sum[project.year]={'start':0,
           'wait':0,'receive':0,'expend':0,'balance':0,'out':0,
           'status_working':0,'status_finish':0,'status_no':0,'status_cancle':0};
        //dict_sum.push(project.year);

      }
      owner_dict[project.owner]['fund'][project.fund].push(project);
      // console.log(owner_dict);
      getMoney(GradDB, Project, project._id, function(m, a, b, c, o) {
        owner_dict[project.owner]['total_start']+=m;      
        owner_dict[project.owner]['total_expend']+=b;      
        owner_dict[project.owner]['total_wait']+=a;      
        owner_dict[project.owner]['total_receive']+=c;      
        owner_dict[project.owner]['total_out']+=o;      
        dict_sum[project.year]['start']+=m;
        dict_sum[project.year]['wait']+=a;
        dict_sum[project.year]['receive']+=c;
        dict_sum[project.year]['out']+=o;
        dict_sum[project.year]['expend']+=b;
        dict_sum[project.year]['balance']+=m+c-b;


        project.start_balance = m+c-b;
        project.sum_expend = b;
        project.sum_out = o;
        //owner_dict[project.owner]['listproject'].push(project);      
        //console.log('getMoney');
        var f_b = parseFloat(b);
        var f_m = parseFloat(m);
        var f_c = parseFloat(c);
        //var f_b2 = Math.round(f_b);
        var f_b2 = f_b.toFixed(1);
        var f_m2 = f_m.toFixed(1);
        var f_c2 = f_c.toFixed(1);
        //console.log(f_b2);
       
        //$scope.Piechart['series'][0]['data'][0][1]+=f_b2;
        //$scope.Piechart['series'][0]['data'][1][1]+=(f_m2+f_c2)-f_b2;
        $scope.Piechart['series'][0]['data'][0][1]+=f_b;
        $scope.Piechart['series'][0]['data'][1][1]+=(f_m+f_c)-f_b;
      });
      if(project.status == "กำลังดำเนินการ") {
        owner_dict[project.owner]['working']+=1;
        dict_sum[project.year]['status_working']+=1;
      }else {
        if(project.status == "ดำเนินการแล้ว") {
          owner_dict[project.owner]['finish']+=1;
          dict_sum[project.year]['status_finish']+=1;
        }else{
          if(project.status == "ยกเลิก") {
            owner_dict[project.owner]['cancle']+=1;
            dict_sum[project.year]['status_cancle']+=1;
            $scope.t_cancle+=1;
          }else{
            owner_dict[project.owner]['no']+=1;
            dict_sum[project.year]['status_no']+=1;
            $scope.t_no+=1;
          }
        }
      }
      if((project.status == "กำลังดำเนินการ") ||(project.status == "ดำเนินการแล้ว") ||(project.status == 'ยังไม่ได้ดำเนินการ')||(project.status == 'ยกเลิก')) {
        owner_dict[project.owner]['all']+=1;

      }

    });    
    var r_fund = [];
    angular.forEach(dict_sum, function(value, key) {
      //console.log('408 -'+value);
      r_fund.push({'name':key,'count':value});
    });
    $scope.r_fund_new = r_fund[0];
    //console.log(r_fund_new.count);
   
    var result = [];
    
    angular.forEach(owner_dict, function(value, owner_name) {
      result.push({'owner':owner_name, 'count':value});
    });

    $scope.result = result;
    console.log(result);
    console.log(r_fund);
    $scope.project_list =  project_list;
    $scope.year = $routeParams.year;
    //graph 2

    $scope.Piechart = {
      options: {
        chart: {
            plotBackgroundColor: null,
            plotBorderWidth: null,
            plotShadow: false
        }
      },
      title: {
        text: 'การใช้เงินงบประมาณ'
      },
      tooltip: {
        pointFormat: '{series.name}: <b>{point.percentage}%</b>',
        percentageDecimals:1 
      },
      plotOptions: {
        series: {
          allowPointSelect: true,
          cursor: 'pointer',
          dataLabels: {
              enabled: true,
              color: '#000000',
              connectorColor: '#000000',
              format: '<b>{point.name}</b>: {point.percentage:.1f} %'
          }
        }
      },
      series: [{
        type: 'pie',
        name: 'จำนวนเงิน',
        data: [
                ['ใช้ไป',0.0],
                ['คงเหลือ',0.0]
            ]
        }],

      loading: false
    }
    /*
    $(function () {
        $('#container').highcharts({
            chart: {
                type: 'column'
            },
            title: {
                text: 'สรุปสถานภาพของโครงการในแผนฏิบัติการประจำปี '+ $routeParams.year
            },
            xAxis: {
                categories: [
                   result[0].owner, 
                   result[1].owner, 
                   result[2].owner, 
                   result[3].owner,
                   result[4].owner]
            },
            yAxis: {
                min: 0,
                title: {
                    text: 'จำนวน (โครงการ)',
                }
            },
            tooltip: {
                pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.y}</b> ({point.percentage:.0f}%)<br/>',
                shared: true
            },
            plotOptions: {
                column: {
                    stacking: 'percent'
                }
            },
            series: [{
              name: 'อยู่ระหว่างดำเนินการ',
              data: [result[0].count.working,
                result[1].count.working,
                result[2].count.working,
                result[3].count.working,
                result[4].count.working]
              }, {
              name: 'ดำเนินการแล้ว',
              data: [result[0].count.finish,
                result[1].count.finish,
                result[2].count.finish,
                result[3].count.finish,
                result[4].count.finish]
              }, {
              name: 'ยังไม่ได้ดำเนินการ',
              data: [result[0].count.no,
                result[1].count.no,
                result[2].count.no,
                result[3].count.no,
                result[4].count.no]
            }],
        });
    });
    */
    
    //$scope.bbarchart = {
   // var chart2; 
    $(function () {
      $('#container3').highcharts({
           colors: ["#FE9A2E", "#21610B", "#0B173B", "#DF0101", "#aaeeee", "#ff0066", "#eeaaee","#55BF3B", "#DF5353", "#7798BF", "#aaeeee"],
            chart: {
                type: 'column'
            },
            title: {
                text: 'สรุปสถานภาพของโครงการในแผนฏิบัติการประจำปี '+ $routeParams.year
            },
            xAxis: {
                categories: [
                   result[0].owner, 
                   result[1].owner, 
                   result[2].owner, 
                   result[3].owner,
                   result[4].owner]
            },
            yAxis: {
                min: 0,
                title: {
                    text: 'จำนวน (โครงการ)',
                },
                stackLabels: {
                    enabled: true,
                    style: {
                        fontWeight: 'bold',
                        color: (Highcharts.theme && Highcharts.theme.textColor) || 'gray'
                    }
                }
            },
            legend: {
                align: 'right',
                x: -70,
                verticalAlign: 'top',
                y: 20,
                floating: true,
                backgroundColor: (Highcharts.theme && Highcharts.theme.legendBackgroundColorSolid) || 'white',
                borderColor: '#CCC',
                borderWidth: 1,
                shadow: false
            },
            tooltip: {
                formatter: function() {
                    return '<b>'+ this.x +'</b><br/>'+
                        this.series.name +': '+ this.y +'<br/>'+
                        'Total: '+ this.point.stackTotal;
                }
            },
            plotOptions: {
                column: {
                    stacking: 'normal',
                    dataLabels: {
                        enabled: true,
                        color: (Highcharts.theme && Highcharts.theme.dataLabelsColor) || 'white'
                    }
                }
            },
            series: [{
              name: 'อยู่ระหว่างดำเนินการ',
              data: [result[0].count.working,
                result[1].count.working,
                result[2].count.working,
                result[3].count.working,
                result[4].count.working]
              }, {
              name: 'ดำเนินการแล้ว',
              data: [result[0].count.finish,
                result[1].count.finish,
                result[2].count.finish,
                result[3].count.finish,
                result[4].count.finish]
              }, {
              name: 'ยกเลิก',
              data: [result[0].count.cancle,
                result[1].count.cancle,
                result[2].count.cancle,
                result[3].count.cancle,
                result[4].count.cancle]
              }, {
              name: 'ยังไม่ได้ดำเนินการ',
              data: [result[0].count.no,
                result[1].count.no,
                result[2].count.no,
                result[3].count.no,
                result[4].count.no]
            }],

        });
    });
  });



}

function ProjectListByYearStatusDeptController($scope, CurrentDate,GradDB,$routeParams, Project,User, Logout) {
  $scope.current_year = $routeParams.year;
  //Project.query({query:'{"type":"post_project", "year":"'+$routeParams.year+'"}'}, function(project_list) {    

  Project.query({query:'{"type":"post_project", "year":"'+$routeParams.year+'"}'}, function(project_list) {    
    var owner_dict = {};
    angular.forEach(project_list, function(project) {
      if(!(project.owner in owner_dict)) {
        owner_dict[project.owner] = {'working':0,
            'finish':0,
            'no':0,
            'all':0,
            'cancle':0,
            'total_start':0,
            'total_expend':0,
            'total_wait':0,
            'total_receive':0,
            'total_out':0,
            'fund':{},
            'listproject':[]
            };
      }      
      if(!project.fund) {
        project.fund = 'Z';
      }
      
      if(!(project.fund in owner_dict[project.owner]['fund'])) {
        owner_dict[project.owner]['fund'][project.fund] = [];
      } 

      owner_dict[project.owner]['fund'][project.fund].push(project);
      // console.log(owner_dict);
      getMoney(GradDB, Project, project._id, function(m, a, b, c, o) {
        owner_dict[project.owner]['total_start']+=m;      
        owner_dict[project.owner]['total_expend']+=b;      
        owner_dict[project.owner]['total_wait']+=a;      
        owner_dict[project.owner]['total_receive']+=c;      
        owner_dict[project.owner]['total_out']+=o;      

        project.start_balance = m+c;
        project.sum_expend = b;
        project.sum_out = o;
        //console.log('Money  s ' + project.name+ ' '+m);
        //console.log('Money  a ' + project.name+ ' '+a);
        //console.log('Money  b'+b);
        //console.log('Money  c'+c);
        //owner_dict[project.owner]['listproject'].push(project);      
      });
      
      //owner_dict[project.owner]['total_start']+=project.start_balance;      
      //owner_dict[project.owner]['total_expend']+=project.sum_expend;      
      if(project.status == "กำลังดำเนินการ") {
        owner_dict[project.owner]['working']+=1;
      }else {
        if(project.status == "ดำเนินการแล้ว") {
          owner_dict[project.owner]['finish']+=1;
        }else{
          if(project.status == "ยังไม่ได้ดำเนินการ") {
            owner_dict[project.owner]['no']+=1;
          } else {
            owner_dict[project.owner]['cancle']+=1;
          }
        }
      }
      if((project.status == "กำลังดำเนินการ") ||(project.status == "ดำเนินการแล้ว") ||(project.status == 'ยังไม่ได้ดำเนินการ')||(project.status == 'ยกเลิก')) {
        owner_dict[project.owner]['all']+=1;

      }

    });    
    //console.log(owner_dict);
    
    var result = [];
    
    angular.forEach(owner_dict, function(value, owner_name) {
      result.push({'owner':owner_name, 'count':value});
    });
    
    $scope.result = result;
    $scope.project_list =  project_list;
    $scope.year = $routeParams.year;

    //$scope.project_list =  project_list;
    //console.log(project_list);

    //$scope.project['sum_expend']=result[0].sum_expend;
    //$scope.project['sum_wait']=result[0].sum_wait;
    //$scope.project['record']=result[0].record;

    $scope.currentOwner = ['งานอำนวยการ','งานแผนและสารสนเทศ','งานวิชาการ','งานวิจัยและวิเทศสัมพันธ์','สำนักพิมพ์มหาวิทยาลัยนเรศวร'];
    $scope.CreateOwnerHeader = function(owner) {
      showOwnerHeader = (owner!=$scope.currentOwner); 
      $scope.currentOwner = owner;
      return showOwnerHeader;
    } 
  });
  
}


function ProjectListByYearStatusController($scope, GradDB,$routeParams, Project,User, Logout) {
  $scope.current_year = $routeParams.year;

  Project.query({query:'{"type":"post_project", "year":"'+$routeParams.year+'"}'}, function(project_list) {    
    var dict = {};
    var status_dict = {};
    angular.forEach(project_list, function(project) {
      if(!(project.fund in dict)) {
        dict[project.fund] = {'working':0,
            'finish':0,
            'no':0,
            'all':0,
            'cancle':0,
            'total_start':0,
            'total_expend':0,
            'total_wait':0,
            'total_receive':0,
            'total_out':0,
            'owner':{},
            'listproject':[]
            };
      }      
      /*
      if(!project.fund) {
        project.fund = 'Z';
      }
      */
      if(!(project.year in status_dict)) {
        status_dict[project.year]={'status_working':0,
           'status_cancle':0,
           'status_no':0,
           'status_finish':0,
           'status_all':0};
      }
      
      if(!(project.owner in dict[project.fund]['owner'])) {
        //dict[project.fund]['owner'][project.owner] = [];
        dict[project.fund]['owner'][project.owner] = {'project':[],'w':0,'f':0,'n':0,'c':0};
      } 
      dict[project.fund]['owner'][project.owner]['project'].push(project);
      // console.log(owner_dict);
      getMoney(GradDB, Project, project._id, function(m, a, b, c, o) {
        dict[project.fund]['total_start']+=m;      
        dict[project.fund]['total_expend']+=b;      
        dict[project.fund]['total_wait']+=a;      
        dict[project.fund]['total_receive']+=c;      
        dict[project.fund]['total_out']+=o;      

        project.start_balance = m+c;
        project.sum_expend = b;
        project.sum_out = o;
      });
       dict[project.fund]['listproject'].push(project);      
      if(project.status == "กำลังดำเนินการ") {
        dict[project.fund]['working']+=1;
        status_dict[project.year]['status_working']+=1;
        dict[project.fund]['owner'][project.owner]['w']+=1;
      }else {
        if(project.status == "ดำเนินการแล้ว") {
          dict[project.fund]['finish']+=1;
          status_dict[project.year]['status_finish']+=1;
          dict[project.fund]['owner'][project.owner]['f']+=1;
        }else{
          if(project.status == "ยังไม่ได้ดำเนินการ") {
            dict[project.fund]['no']+=1;
            status_dict[project.year]['status_no']+=1;
            dict[project.fund]['owner'][project.owner]['n']+=1;
          } else {
            dict[project.fund]['cancle']+=1;
            status_dict[project.year]['status_cancle']+=1;
            dict[project.fund]['owner'][project.owner]['c']+=1;
          }
        }
      }
      if((project.status == "กำลังดำเนินการ") ||(project.status == "ดำเนินการแล้ว") ||(project.status == 'ยังไม่ได้ดำเนินการ')||(project.status == 'ยกเลิก')) {
        dict[project.fund]['all']+=1;
        status_dict[project.year]['status_all']+=1;

      }

    });    
    console.log(dict);
   /*---csv----*/ 

    var result = [];
    
    angular.forEach(dict, function(value, name) {
      result.push({'owner':name, 'count':value});
    });
    var status_result = [];
    angular.forEach(status_dict, function(value, name) {
      status_result.push({'status':name, 'count':value});
    });
    
    $scope.status_result = status_result[0];
    console.log(status_result[0]);
    $scope.result = result;
    $scope.project_list =  project_list;
    $scope.year = $routeParams.year;
    $scope.exportData = function () {
        var blob = new Blob([document.getElementById('exportable').innerHTML], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8"
        });
        saveAs(blob, "Report.xls");
    };

  });
  


};


function YearListController($scope, GradDB,$location, $timeout,$routeParams,Project,User, Logout) {
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
  }
  $scope.filter1 = function(year) {
    $location.path('/projects/warning/'+year);
  }
  $scope.filter2 = function(year) {
    $location.path('/projects/'+year+'/status');
  }
  $scope.filter3 = function(year) {
    $location.path('/projects/'+year+'/dept');
  }
  $scope.filter4 = function(year) {
    $location.path('/task/create');
  }
  $scope.filter5 = function(year) {
    $location.path('/project/list/'+year);
  }
}

function YearListReportController($scope, GradDB,$location, $timeout,$routeParams,Project,User, Logout) {
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
    $location.path('/projects/Reports/'+year);
  
  }
}


function highChartController($scope) {
    $scope.initConfig=function(config,item) {
        debugger;
        $scope.config=angular.copy(config);
        $scope.config.title.text=item.name;
        $scope.config.type=item.type;
        $scope.config.options.chart.type=item.type;
        $scope.config.series[0].data[0]=item.data;
    }
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
  $scope.project = Project.get({id:$routeParams.projectId},function(){
    var query_obj = {'type':"post_message",'project_id':$scope.project._id};
    Project.query({query:JSON.stringify(query_obj)}, function (result) {
      $scope.message_list = result;
      console.log($scope.message_list);
    });
  });  
}


function ProjectFinanceListController($scope, $routeParams, GradDB, User, Logout) {

  var thai_year = parseInt($routeParams.id)-543;
  //console.log(thai_year);
  
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
     var dict ={};
     if (finance.length > 0) {
       angular.forEach(finance, function(entry) { 
         
         //console.log(entry);
         var balance_start = entry.amount;
         if(!(entry.id in dict)){
           dict[entry.id] = {
             'name':entry.name,
             'id':entry.id,
             'fund':entry.fund,
             'sum_expend':0,
             'sum_wait':0,
             'sum_out':0,
             'start_balance':balance_start,
             'record':[],
             'finance':[]};
      
         }
         dict[entry.id]['finance'].push(entry);
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
                 ,'total_receive':0,'total_out':0
                 ,'total_expend':0,'total_wait':0};
               }

               if (record.mode == "O") {
                 total_out+=record.amount;
                 dict[entry.id]['record'][key]['total_out']+=record.amount;
                 dict[entry.id]['sum_out']+=record.amount;
               }
               if (record.mode == "O"||record.mode == "E"||record.mode == "U" ) {
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
             //dict[entry.id]['end_balance']=record.amount;
         }); 
       }); 
       var result = [];
       angular.forEach(dict, function(value, key) {
         result.push({'finance_id':key, 'project':value});
       });
       //console.log(result);
       $scope.p_list = result;
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

function ProjectFinanceViewController($scope, User,Project, $routeParams, GradDB) {
  Project.get({id:$routeParams.projectId},function(project){
             //$scope.project['record']=result[0].record;
    var dict = {};
      if(!(project.name in dict)) {
        dict[project.name] = {
            'total_start':0,
            'total_expend':0,
            'total_wait':0,
            'total_receive':0,
            'total_out':0
            };
      }      
      getMoney(GradDB, Project, project._id, function(m, a, b, c, o) {
        dict[project.name]['total_start']+=m;      
        dict[project.name]['total_expend']+=b;      
        dict[project.name]['total_wait']+=a;      
        dict[project.name]['total_receive']+=c;      
        dict[project.name]['total_out']+=o;      

      });
    
    var result = [];
    
    angular.forEach(dict, function(value, key) {
         result.push({'name':key, 'money':value});
    });
       $scope.project = result;
       $scope.project['project'] = project;
       $scope.doTheBack = function() {
         window.history.back();
       };

       console.log($scope.project);
    var query_obj = {'type':"post_message",'project_id':$scope.project.project._id};
    Project.query({query:JSON.stringify(query_obj)}, function (result) {
      $scope.message_list = result;
      console.log($scope.message_list);
    });
  });  
  //console.log($scope.project);
};

function CreateProjectFinanceController($scope, Project,$routeParams, GradDB, User, Logout, $location) {
 //var thai_year = parseInt($routeParams.year)-543;
  
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
                     ,'total_receive':0,'total_out':0
                     ,'total_expend':0,'total_wait':0};
                 }

                 if (record.mode == "O") {
                   total_out+=record.amount;
                 }
                 if (record.mode == "O"||record.mode == "E"||record.mode == "U" ) {
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
                   $location.path('/project/finance/list/'+$scope.project.year);
                 }
               });
             }

      });
    }
    
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
             /*
             getMoney(GradDB, Project, $routeParams.projectId, function(m, a, b, c) {
               $scope.project.start_balance = m+c;
               $scope.project.sum_expend = b;
             });
             */
             //var average = $scope.project.average.toString();
             //var percent = $scope.project.percent.toString();
             var query_obj = {"project_id":$scope.project._id}; 
             Project.query({query:JSON.stringify(query_obj)}, function (result) {
               $scope.message_list = result;
               //console.log(result);
             });
          });  
          //console.log($scope.project);

          $scope.save = function () {		
            Project.update({      
              id:$routeParams.projectId
            }, angular.extend({}, $scope.project,{_id:undefined}), 
              function(result) {
                $scope.save_result = result;
                if(result.success) {
                  $location.path('/project/finance/info/'+$scope.project._id+'/'+$scope.project.financeid);
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

angular.module('app.filters', []).filter('companyFilter', [function () {
    return function (project_list, selectedStatus) {
        if (!angular.isUndefined(project_list) && !angular.isUndefined(selectedStatus) && selectedStatus.length > 0) {
            var tempProject_lists = [];
            angular.forEach(selectedStatus, function (status) {
                angular.forEach(project_list, function (project) {
                    if (angular.equals(project.status, status)) {
                        tempPorject_lists.push(project);
                    }
                });
            });
            return tempProject_lists;
        } else {
            return project_list;
        }
    };
}]);
