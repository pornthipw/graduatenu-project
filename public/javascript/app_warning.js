app.config(function($routeProvider) {
    $routeProvider.when('/projects/warning/:year', {
    controller:ProjectListWarningByYearController, 
    templateUrl:'static/project_list_warning.html'
  }); 
});

function ProjectListWarningByYearController($scope,Sendmail,GradDB,$routeParams, Project,User, Logout) {
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

