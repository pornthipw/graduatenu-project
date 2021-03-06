
app.config(function($routeProvider) {
  
  $routeProvider.when('/project/finance/info/:projectId/:financeId', {
    controller:ProjectFinanceViewController, 
    templateUrl:'static/project_finance_info.html'
  });
  $routeProvider.when('/projects/:year/status', {
    controller:ProjectListByYearStatusController, 
    templateUrl:'static/project_status.html'
  });  

  $routeProvider.when('/project/create', {
    controller:CreateProjectController, 
    templateUrl:'static/project_form.html'
  });    
  
  $routeProvider.when('/project/edit/field/:projectId', {
    controller:ProjectEditController, 
    templateUrl:'static/project_edit.html'
  });  
 $routeProvider.when('/project/list', {
    controller:ProjectSearchController,
    templateUrl:'static/project_list.html'
  });

  $routeProvider.when('/project/edit/:projectId', {
    controller:ProjectController, 
    templateUrl:'static/project_form.html'
  });    
  
  $routeProvider.when('/project/info/:projectId', {
    controller:ProjectViewController, 
    templateUrl:'static/project_info.html'
  });   
  
  $routeProvider.when('/project/report/:projectId/:financeId', {
    controller:ProjectReportController, 
    templateUrl:'static/report_project.html'
  });

  $routeProvider.when('/project/task/:projectId', {
    controller:MessageController, 
    templateUrl:'static/task_form.html'
  });
  $routeProvider.when('/projects/warning/:year', {
    controller:ProjectListWarningByYearController,
    templateUrl:'static/project_list_warning.html'
  });

  
  /*
  $routeProvider.when('/report', {
    controller:ReportyYearController,  
    templateUrl:'static/report.html'
  });  
  	 */

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

});



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
       var total_in = 0;
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
               if (record.mode == "W") {
                 total_wait+=record.amount;
               } else {
                    if (record.mode == "P" ) {
                    }else{
                      total_receive+=record.amount;
                    }
               }
             }
              
               if (record.mode == "O") {
                   total_out+=record.amount;
               }
               if (record.mode == "I") {
                   total_in+=record.amount;
               }
            }
           );
           cb(finance.amount, total_wait, total_expend, total_receive, total_out, total_in );
         }); 
       } 
     });
   });
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
            'total_in':0,
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
           'wait':0,'receive':0,'expend':0,'balance':0,'out':0,'in':0,
           'status_working':0,'status_finish':0,'status_no':0,'status_cancle':0};
        //dict_sum.push(project.year);

      }
      owner_dict[project.owner]['fund'][project.fund].push(project);
      // console.log(owner_dict);
      getMoney(GradDB, Project, project._id, function(m, a, b, c, o,i) {
        owner_dict[project.owner]['total_start']+=m;      
        owner_dict[project.owner]['total_expend']+=b;      
        owner_dict[project.owner]['total_wait']+=a;      
        owner_dict[project.owner]['total_receive']+=c;      
        owner_dict[project.owner]['total_out']+=o;      
        owner_dict[project.owner]['total_in']+=i;      
        dict_sum[project.year]['start']+=m;
        dict_sum[project.year]['wait']+=a;
        dict_sum[project.year]['receive']+=c;
        dict_sum[project.year]['out']+=o;
        dict_sum[project.year]['in']+=i;
        dict_sum[project.year]['expend']+=b;
        dict_sum[project.year]['balance']+=m+c-b;


        project.start_balance = m+c-b;
        project.sum_expend = b;
        project.sum_out = o;
        project.sum_in = i;
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
/*    
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
 */   
    //$scope.bbarchart = {
   // var chart2; 
    $(function () {
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

function ProjectListByYearStatusController($scope, GradDB,$routeParams, Project,User, Logout) {
  $scope.current_year = $routeParams.year;
  $scope.year = $routeParams.year;

  Project.query({query:'{"type":"post_project", "year":"'+$scope.current_year+'"}'}, function(project_list) {    
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
            'total_in':0,
            'owner':{},
            'listproject':[]
            };
      }      

      if(!(project.year in status_dict)) {
        status_dict[project.year]={'status_working':0,
           'status_cancle':0,
           'status_no':0,
           'status_finish':0,
           'status_all':0};
      }
      
      if(!(project.owner in dict[project.fund]['owner'])) {
        dict[project.fund]['owner'][project.owner] = {'project':[],'w':0,'f':0,'n':0,'c':0,'type':{}};
      } 

         if(!(project.name in dict[project.fund]['owner'][project.owner]['type'])) {
           dict[project.fund]['owner'][project.owner]['type'][project.name] = {'project':[],'subpname':{}};
          }
      dict[project.fund]['owner'][project.owner]['type'][project.name]['project'].push(project);
      /* var query_obj_sub = {'type':"post_subproject",'project_id':project._id};
       Project.query({query:JSON.stringify(query_obj_sub)}, function (result1) {
          console.log(result1);
       });
       */

      dict[project.fund]['owner'][project.owner]['project'].push(project);

      getMoney(GradDB, Project, project._id, function(m, a, b, c, o, i) {
        dict[project.fund]['total_start']+=m;      
        dict[project.fund]['total_expend']+=b;      
        dict[project.fund]['total_wait']+=a;      
        dict[project.fund]['total_receive']+=c;      
        dict[project.fund]['total_out']+=o;      
        dict[project.fund]['total_in']+=i;      

        project.start_balance = m+c;
        project.sum_expend = b;
        project.sum_out = o;
        project.sum_in = i;
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

function ProjectReportController($scope, User,Project, $routeParams, GradDB) {
  console.log("test");

 $scope.exportData = function () {
        var blob = new Blob([document.getElementById('exportable').innerHTML], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8"
        });
        saveAs(blob, "Report.xls");
    };
  Project.get({id:$routeParams.projectId},function(project){
             //$scope.project['record']=result[0].record;
    var dict = {};
      if(!(project.name in dict)) {
        dict[project.name] = {
            'total_start':0,
            'total_expend':0,
            'total_wait':0,
            'total_receive':0,
            'total_out':0,
            'total_in':0
            };
      }      
      getMoney(GradDB, Project, project._id, function(m, a, b, c, o, i) {
        dict[project.name]['total_start']+=m;      
        dict[project.name]['total_expend']+=b;      
        dict[project.name]['total_wait']+=a;      
        dict[project.name]['total_receive']+=c;      
        dict[project.name]['total_out']+=o;      
        dict[project.name]['total_in']+=i;      

      });
    
      var result = [];
    
      angular.forEach(dict, function(value, key) {
         result.push({'name':key, 'money':value});
      });
      $scope.project = result;
      console.log($scope.project);
      $scope.project['project'] = project;
      $scope.doTheBack = function() {
         window.history.back();
      };

       var query_obj_sub = {'type':"post_subproject",'project_id':$scope.project.project._id};
       Project.query({query:JSON.stringify(query_obj_sub)}, 
           function (result1) {
              $scope.p_list = result1;
              $scope.p = result1[0];
              $scope.p1 = result1[1];
              $scope.p2 = result1[2];
              $scope.p3 = result1[3];
              console.log(result1)
       });

   });

}

function ProjectFinanceViewController($scope, Sendmail, User,Project, $routeParams, GradDB,$location) {
  Project.get({id:$routeParams.projectId},function(project){
             //$scope.project['record']=result[0].record;
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
    }else{

    }
  });
    var dict = {};
      if(!(project.name in dict)) {
        dict[project.name] = {
            'total_start':0,
            'total_expend':0,
            'total_wait':0,
            'total_receive':0,
            'total_out':0,
            'total_in':0,
            };
      }      
      getMoney(GradDB, Project, project._id, function(m, a, b, c, o, i) {
        dict[project.name]['total_start']+=m;      
        dict[project.name]['total_expend']+=b;      
        dict[project.name]['total_wait']+=a;      
        dict[project.name]['total_receive']+=c;      
        dict[project.name]['total_out']+=o;      
        dict[project.name]['total_in']+=i;      

      });
    
      var result = [];
    
      angular.forEach(dict, function(value, key) {
         result.push({'name':key, 'money':value});
      });
      $scope.project = result;
      console.log($scope.project);
      $scope.project['project'] = project;
      $scope.doTheBack = function() {
         window.history.back();
      };
      $scope.reportclick = function(){
        console.log("test");
        $location.path('/project/report/'+$routeParams.projectId+'/'+$routeParams.financeId);
      };
      
      $scope.trackclick = function(){
      console.log("testtracklick");
      var d = new Date();
      var curr_date = d.getDate();
      var curr_month = d.getMonth()+1;
      var curr_year = d.getFullYear();
      var ndateToday = Date.parse(curr_month + "/" + curr_date + "/" + curr_year);
      var currenttime_date =  new Date(ndateToday).getTime();

      var date_plan = $scope.project.project.date_plan;
            //var end_date_plan = project.end_date_plan;
      var dateSplitted = date_plan.split('/');
      var formattedDate = dateSplitted[1]+'/'+dateSplitted[0]+'/'+dateSplitted[2];
      var new_date_plan =  new Date(formattedDate).getTime();
      $scope.project.project.new_date_plan =  new Date(formattedDate).getTime();
      //console.log(new_date_plan);
      var formattedDate_check = dateSplitted[1]+'/'+dateSplitted[0]+'/'+dateSplitted[2];
      var new_date_check =  new Date(formattedDate_check);
      var day_check = new_date_check.getDate()+30;
      //console.log(day_check);
      var formattedDate_new = dateSplitted[1]+'/'+day_check+'/'+dateSplitted[2];
      //console.log(formattedDate_new);
      var new_date =  new Date(formattedDate_new).getTime();
      //console.log(new_date);
      $scope.project.project.new_date_check =  new_date;
      //-----------------------------------------------------
      var date_permit = $scope.project.project.date_approval;
      var date_manage = $scope.project.project.date_manage;
      var datepermitSplitted = date_permit.split('/');
      var datemanageSplitted = date_manage.split('/');
      var formattedpermitDate = datepermitSplitted[1]+'/'+datepermitSplitted[0]+'/'+datepermitSplitted[2];
      var formattedmanageDate = datemanageSplitted[1]+'/'+datemanageSplitted[0]+'/'+datemanageSplitted[2];
      var new_date_permit =  new Date(formattedpermitDate).getTime();
      var new_date_manage =  new Date(formattedmanageDate).getTime();
      //$scope.project.project.new_date_permit =  new Date(formattedpermitDate).getTime();
      //$scope.project.project.new_date_manage =  new Date(formattedmanageDate).getTime();
      var formattedmanageDate_check = datemanageSplitted[1]+'/'+datemanageSplitted[0]+'/'+datemanageSplitted[2];
      var new_date_manage_check =  new Date(formattedmanageDate_check);
      var day_check_2 = new_date_manage_check.getDate()+3;
      var formattedmanageDate_new = datemanageSplitted[1]+'/'+day_check_2+'/'+datemanageSplitted[2];
      var new_date2 =  new Date(formattedmanageDate_new).getTime();
      //----------------------------------------------------------

       //console.log($scope.project);
       //$scope.sendEmail = function(){
       //console.log(formattedpermitDate);
       //console.log(new_date_permit);
       //console.log(formattedmanageDate_new);
       //console.log(new_date_manage);
       if ((currenttime_date < new_date && new_date_plan<new_date) && (new_date_permit == "")){
         var subject = "กรุณาขออนุมัติ"+$scope.project.project.name; 
         var str = "เข้าสู่ระบบติดตามโครงการ/กิจกรรม เพื่อขออนุมัติโครงการ!";
         var URL = "http://www.db.grad.nu.ac.th/apps/grad-project/#/project/finance/info/"+$scope.project.project._id+"/"+$scope.project.project.financeid;
         var body = str.link(URL);
         var query_obj = {
             'name':subject,
             'message':body,
             'email':$scope.project.project.contactmail};
         Sendmail.get({query:JSON.stringify(query_obj)}, function (result) {
           console.log("ok");
         });
       }
       if ($scope.project.project.date_manage){
           if (currenttime_date > new_date2 && (new_date_manage<new_date2 && $scope.project.project.status == 'กำลังดำเนินการ')){
                var subject = "กรุณา ปรับปรุงสถานะ"+$scope.project.project.name+" ที่ท่านรับผิดชอบให้เป็นปัจจุบัน"; 
                //var body = "สามารถเข้าไปที่"+$location.path('/project/finance/list/'+$scope.project.year);
                var str = "เข้าสู่ระบบติดตามโครงการ/กิจกรรม!";
                var URL = "http://www.db.grad.nu.ac.th/apps/grad-project/#/project/finance/info/"+$scope.project.project._id+"/"+$scope.project.project.financeid;
                var body = str.link(URL);

                var query_obj = {
                    'name':subject,
                    'message':body,
                    'email':$scope.project.project.contactmail
                    };
                console.log(query_obj);
                Sendmail.get({query:JSON.stringify(query_obj)}, 
                    function (result) {
                        console.log("ok");
                });
           }
       }
       };
       //}; 
       /*
       var query_obj = {'type':"post_message",'project_id':$scope.project.project._id};
       Project.query({query:JSON.stringify(query_obj)}, function (result) {
         $scope.message_list = result;
       });
       */
       var query_obj_sub = {'type':"post_subproject",'project_id':$scope.project.project._id};
       Project.query({query:JSON.stringify(query_obj_sub)}, function (result1) {
         $scope.p_list = result1;
         $scope.p = result1[0];
         $scope.p1 = result1[1];
         $scope.p2 = result1[2];
         $scope.p3 = result1[3];
         console.log(result1)
       });
         
  });  
  //console.log($scope.project);
};


function ProjectSearchController($scope, $routeParams, Project, User, Logout) {
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

   $scope.list_years = {
        data: [
        {
            name: '2559'
        }, {
            name: '2558'
        }, {
            name: '2557'
        }]
    };
    $scope.list_year = '2558';
  //var thai_year = parseInt($routeParams.id)-543;
  //$scope.updateYear = function(){
  $scope.updateYear = function(){

  $scope.current_year = $routeParams.year;
  $scope.selectedStatus = [];
  $scope.statusList = [{
        'status': 'กำลังดำเนินการ'
    }, {
        'status': 'ดำเนินการแล้ว'
    }, {
        'status': 'ยังไม่ได้ดำเนินการ'
    }, {
        'status': 'ยกเลิก'
    }];
  //Project.query({query:'{"type":"post_project", "year":"'+$routeParams.year+'"}'}, function(project_list) {    
  //Project.query({query:'{"type":"post_project", "year":"'+$routeParams.year+'"}'}, function(project_list) {    
  Project.query({query:'{"type":"post_project", "year":"'+$scope.list_year.name+'"}'}, function(project_list) {    
    $scope.project_list = project_list;
    //$scope.selectedOwner = [];
    console.log("test"); 
    console.log(project_list); 
  });
 $scope.setSelectedStatus = function () {
        var self = this;
        var status = self.project.status;
        console.log(self);
        if (_.contains($scope.selectedStatus, status)) {
            $scope.selectedStatus = _.without($scope.selectedStatus, status);
        } else {
            $scope.selectedStatus.push(status);
        }
        return false;
    };
    $scope.isChecked = function (status) {
        if (_.contains($scope.selectedStatus, status)) {
            return 'glyphicon glyphicon-ok pull-right';
        }
        return false;
    };
 $scope.checkAll = function () {
        $scope.selectedStatus = _.pluck($scope.statusList, 'status');
    };
 }

}

function ProjectListWarningByYearController($scope,Sendmail,GradDB,$routeParams, Project,User, Logout) {
 $scope.user = User.get(function(response) {
   if (!response.user) {
      // self.messageAlert("You are not authorized to update content");
   } else {

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
              'total_in':0,
              'total_kang':0,
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
            'wait':0,'receive':0,'expend':0,'balance':0,'out':0,'in':0};
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
              } else {
                if(project.new_date_plan > ndateToday && ndateToday < project.new_date_check){
                 dict[project.year]['type'][project.type]['list_project'].push(project);
                 dict[project.year]['type'][project.type]['allowner'][project.owner]['list'].push(project);
              
                }
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
     $scope.user = User.get(function(response) {
          if (!response.user) {
            //self.messageAlert("You are not authorized to update content");
          } else {
           console.log(response.user);
 $scope.trackclick = function(id,name,fid,mail){
              console.log(mail);
              var subject = "กรุณาขออนุมัติ"+name;
              var str = "เข้าสู่ระบบติดตามโครงการ/กิจกรรม เพื่อขออนุมัติโครงการ!";
              var URL = "http://www.db.grad.nu.ac.th/apps/grad-project/#/project/finance/info/"+id+"/"+fid;
              var body = str.link(URL);
              var query_obj = {
                'name':subject,'message':body,
                'email':mail};
              Sendmail.get({query:JSON.stringify(query_obj)},
                function (result) {
                  console.log("ok");
                });
            }
          }
                });
     }
  });

}



angular.module('app.filters', []).filter('companyFilter', [function () {
    return function (project_list, selectedStatus) {
        if (!angular.isUndefined(project_list) && !angular.isUndefined(selectedStatus) && selectedStatus.length > 0) {
            var tempProject_lists = [];
            angular.forEach(selectedStatus, function (status) {
                angular.forEach(project_list, function (project) {
                    if (angular.equals(project.status, status)) {
                        tempProject_lists.push(project);
                    }
                });
            });
            return tempProject_lists;
        } else {
            return project_list;
        }
    };
}]);


