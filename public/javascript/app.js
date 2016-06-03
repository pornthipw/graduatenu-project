
var app = angular.module('projectplan', ['mongorest_service','codemirror','$strap.directives','highcharts-ng','app.filters']); 


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
  
  $routeProvider.when('/', {
    controller:MainController,  
    templateUrl:'static/index.html'
  }); 
 $routeProvider.when('/role', {
    controller:RoleController, 
    templateUrl:'static/role_manager.html'
  });
  
});
function CalendarCtrl($scope, User, Logout) {
 $("#jqxCalendar").jqxCalendar({
      theme: 'energyblue',
      width: '180px',
      height: '180px',
      stepMonths: 3
  });


}

function UserCtrl($scope, User, Logout) {
  var orig;
  var role1;

  $scope.user = User.get(function(res) {
    //console.log(res);
    if(res.user!=null){
    var ng_role = [];
    orig = res.user;
      if(orig['role']) { 
        angular.forEach(orig.role, function(value, idx) {
          ng_role.push({'name':value});
        });
      }
      $scope.user['role'] = ng_role; 
      role1 = ng_role; 
      $scope.role = role1.name; 
      //console.log(role1.name);
      //console.log($scope.role);
      
    }
  });
  
  $scope.logout = function(){
    Logout.get(function(response){
      if(response.success){
        $scope.user = null;
        $scope.role = null;
        $scope.$broadcast('logout');
      }
    });
  };

}

function MainController($scope, $filter, GradDB, Logout, User,Project ) {   
 $scope.user = User.get(function(response) {
   if (!response.user) {
      // self.messageAlert("You are not authorized to update content");
   } else {
     var year = '2559';
     console.log($scope.user);
     if($scope.user.user.role[0]=='plan'){
       var query = '{"type":"post_project","owner":"งานแผนและสารสนเทศ","year":"'+year+'"}';
     } else {
       if($scope.user.user.role[0]=='academic'){
         var query = '{"type":"post_project","owner":"งานวิชาการ","year":"'+year+'"}';
       } else {
         if($scope.user.user.role[0]=='research'){
           var query = '{"type":"post_project","owner":"งานวิจัยและวิเทศสัมพันธ์","year":"'+year+'"}';
         } else {
           if($scope.user.user.role[0]=='press'){
             var query = '{"type":"post_project","owner":"สำนักพิมพ์มหาวิทยาลัยนเรศวร","year":"'+year+'"}';
           } else {
             if($scope.user.user.role[0]=='direct'){
               var query = '{"type":"post_project","owner":"งานอำนวยการ","year":"'+year+'"}';

             } else {
               var query = '{"type":"post_project","year":"'+year+'"}';
             }
           } 
         }
       }
     }
     $scope.project_list = Project.query({query:query}, function(res) {
       //console.log(res);
     });
     //test 
     Project.query({query:'{"type":"post_project","year":"'+year+'"}'}, 
      function(project_list) {    
        var dict = {};

        angular.forEach(project_list, function(project) {
         //console.log(project);
          if(!(year in dict)){
            dict[year] = {'projectname':[],'name':{}};
          } 
          
          if(!(project.name in dict[year]['projectname'])){
            dict[year]['projectname'].push(project.name);
          }
          if(!(project.name in dict[year]['name'])){
            dict[year]['name'][project.name]=project.name;
          }

        });
        var result=[];
        angular.forEach(dict, function(value, idx) {
          result.push({'year':idx,'project':value});
        });
        console.log(result[0]);
        var c = result[0].project.projectname;

        $(function () {
           // Define tasks
/*
*/

       if($scope.user.user.role[0]=='plan'){
           
	   var c = 'container1';
           var m = 5;
           var b = ["โครงการประชาสัมพันธ์บัณฑิตศึกษา",
                 "โครงการติดตามคุณภาพนิสิตระดับบัณฑิตศึกษา",
                 "โครงการสนับสนุนการผลิตสื่อการสอนในรูปแบบสื่ออิเล็กทรอนิกส์ระดับบัณฑิตศึกษา",
                 "โครงการสนับสนุนการจัดประชุมวิชาการ",
                 "โครงการจัดการความรู้ (KM)",
                 "โครงการประกันคุณภาพการศึกษา"]

            var tasks = [
             {
                name: "โครงการประกันคุณภาพการศึกษา",
                intervals: [{ // From-To pairs
                    from: Date.UTC(2016,08, 1),
                    to: Date.UTC(2016, 08, 30),
                    label: "โครงการประกันคุณภาพการศึกษา",
                    tooltip_data: 'this data'
                }]
             },{
                name: "โครงการจัดการความรู้ (KM)",
                intervals: [{ // From-To pairs
                    from: Date.UTC(2016,04, 1),
                    to: Date.UTC(2016, 04, 31),
                    label: "โครงการจัดการความรู้ (KM)",
                    tooltip_data: 'this data'
                }]
             },{
                name: "โครงการสนับสนุนการจัดประชุมวิชาการ",
                intervals: [{ // From-To pairs
                    from: Date.UTC(2015,09, 1),
                    to: Date.UTC(2016, 08, 30),
                    label: "โครงการสนับสนุนการจัดประชุมวิชาการ",
                    tooltip_data: 'this data'
                }]
             },{
                name: "โครงการสนับสนุนการผลิตสื่อการสอนในรูปแบบสื่ออิเล็กทรอนิกส์ระดับบัณฑิตศึกษา",
                intervals: [{ // From-To pairs
                    from: Date.UTC(2015,09, 1),
                    to: Date.UTC(2016, 06, 31),
                    label: "โครงการสนับสนุนการผลิตสื่อการสอนในรูปแบบสื่ออิเล็กทรอนิกส์ระดับบัณฑิตศึกษา",
                    tooltip_data: 'this data'
                }]
             },{
                name: "โครงการติดตามคุณภาพนิสิตระดับบัณฑิตศึกษา",
                intervals: [{ // From-To pairs
                    from: Date.UTC(2015,09, 1),
                    to: Date.UTC(2016, 08, 30),
                    label: "โครงการติดตามคุณภาพนิสิตระดับบัณฑิตศึกษา",
                    tooltip_data: 'this data'
                }]
             },{
                name: "โครงการประชาสัมพันธ์บัณฑิตศึกษา",
                intervals: [{ // From-To pairs
                    from: Date.UTC(2016,06, 1),
                    to: Date.UTC(2016, 06, 31),
                    label: "โครงการประชาสัมพันธ์บัณฑิตศึกษา",
                    tooltip_data: 'this data'
                }]
             }
            ];
       } else {

           if($scope.user.user.role[0]=='academic' ){
	       var c = 'container1';
               var m = 4;
               var b =[ "โครงการสัมมนานิสิตบัณฑิตศึกษา",
                        "โครงการสัมมนาคณาจารย์บัณฑิตศึกษา",
                        "โครงการติดตามสถานภาพนิสิตบัณฑิตศึกษา",
                        "โครงการอบรมจริยธรรมการวิจัยระดับบัณฑิตศึกษา",
                        "โครงการสอบประมวลความรู้นิสิตปริญญาโท แผน ข"]

               var tasks = [
                   {
                       name: "โครงการสอบประมวลความรู้นิสิตปริญญาโท แผน ข",
                       intervals: [{ // From-To pairs
                           from: Date.UTC(2015,09, 1),
                           to: Date.UTC(2016, 09, 30),
                           label: "โครงการสอบประมวลความรู้นิสิตปริญญาโท แผน ข",
                           tooltip_data: 'this data'
                       }]
                    },{
                       name: "โครงการอบรมจริยธรรมการวิจัยระดับบัณฑิตศึกษา",
                       intervals: [{ // From-To pairs
                           from: Date.UTC(2015,10, 1),
                           to: Date.UTC(2015,10, 30),
                           label: "ระยะที่ 1",
                           tooltip_data: 'this data'
                       },{ // From-To pairs
                           from: Date.UTC(2016,02, 1),
                           to: Date.UTC(2016, 02, 31),
                           label: "ระยะที่ 2",
                           tooltip_data: 'this data'
                       },{ // From-To pairs
                           from: Date.UTC(2016,05, 1),
                           to: Date.UTC(2016, 05, 30),
                           label: "ระยะที่ 3",
                           tooltip_data: 'this data'
                       }]
                    },{
                       name: "โครงการติดตามสถานภาพนิสิตบัณฑิตศึกษา",
                       intervals: [{ // From-To pairs
                           from: Date.UTC(2016,01, 1),
                           to: Date.UTC(2016, 01, 29),
                           label: "โครงการติดตามสถานภาพนิสิตบัณฑิตศึกษา",
                           tooltip_data: 'this data'
                       }]
                    },{
                       name: "โครงการสัมมนาคณาจารย์บัณฑิตศึกษา",
                       intervals: [{ // From-To pairs
                           from: Date.UTC(2015,10, 1),
                           to: Date.UTC(2015, 10, 30),
                           label: "โครงการสัมมนาคณาจารย์บัณฑิตศึกษา",
                           tooltip_data: 'this data'
                       }]
                    },{
                       name: "โครงการสัมมนานิสิตบัณฑิตศึกษา",
                       intervals: [{ // From-To pairs
                           from: Date.UTC(2016,02, 1),
                           to: Date.UTC(2016, 02, 31),
                           label: "โครงการสัมมนานิสิตบัณฑิตศึกษา",
                           tooltip_data: 'this data'
                       }]
                    }
                   ];
           } else {
        //} 
               if($scope.user.user.role[0]=='direct' ){
	           var c = 'container1';
                   var m = 10;
                   var b =[ "โครงการประชุมวิชาการเสนอผลงานวิจัยระดับบัณฑิตศึกษาแห่งชาติ ครั้งที่ 38",
                            "โครงการพัฒนาสุนทรียภาพทางวัฒนธรรม",
                            "โครงการสืบสานวัฒนธรรม",
                            "โครงการส่งเสริมกิจกรรมสโมสรนิสิตบัณฑิตศึกษา",
                            "โครงการปฐมนิเทศระดับบัณฑิตศึกษา (ครู อาจารย์ประจำการ)",
                            "โครงการปฐมนิเทศระดับบัณฑิตศึกษา",
                            "โครงการพัฒนาองค์กร",
                            "โครงการพัฒนาสมรรถนะด้านการสื่อสารภาษาอังกฤษของบุคลากร",
                            "โครงการเสริมสร้างสุขภาพบุคลากร",
                            "โครงการศึกษาดูงานและพัฒนาทักษะของผู้บริหารในการจัดการศึกษาระดับบัณฑิตศึกษา"]
                    var tasks = [
                        {
                            name: "โครงการศึกษาดูงานและพัฒนาทักษะของผู้บริหารในการจัดการศึกษาระดับบัณฑิตศึกษา",
                            intervals: [{ // From-To pairs
                                from: Date.UTC(2015,12, 1),
                                to: Date.UTC(2015, 12, 31),
                                label: "โครงการศึกษาดูงานและพัฒนาทักษะของผู้บริหารฯ",
                                tooltip_data: 'this data'
                            }]
                        },{
                            name: "โครงการเสริมสร้างสุขภาพบุคลากร",
                            intervals: [{ // From-To pairs
                                from: Date.UTC(2016,06, 1),
                                to: Date.UTC(2016, 06, 31),
                                label: "โครงการเสริมสร้างสุขภาพฯ",
                                tooltip_data: 'this data'
                            }]
                        },{
                            name: "โครงการพัฒนาสมรรถนะด้านการสื่อสารภาษาอังกฤษของบุคลากร",
                            intervals: [{ // From-To pairs
                                from: Date.UTC(2016,02, 1),
                                to: Date.UTC(2016, 08, 31),
                                label: "โครงการพัฒนาสมรรถนะด้านการสื่อสารภาษาอังกฤษของบุคลากร",
                                tooltip_data: 'this data'
                            }]
                        },{
                            name: "โครงการพัฒนาองค์กร",
                            intervals: [{ // From-To pairs
                                from: Date.UTC(2016,03, 1),
                                to: Date.UTC(2016, 06, 31),
                                label: "โครงการพัฒนาองค์กร",
                                tooltip_data: 'this data'
                            }]
                        },{
                            name: "โครงการปฐมนิเทศระดับบัณฑิตศึกษา",
                            intervals: [{ // From-To pairs
                                from: Date.UTC(2016,05, 1),
                                to: Date.UTC(2016, 05, 31),
                                label: "โครงการปฐมนิเทศระดับบัณฑิตศึกษา",
                                tooltip_data: 'this data'
                            }]
                        },{
                            name: "โครงการปฐมนิเทศระดับบัณฑิตศึกษา (ครู อาจารย์ประจำการ)",
                            intervals: [{ // From-To pairs
                                from: Date.UTC(2016,02, 1),
                                to: Date.UTC(2016, 02, 31),
                                label: "โครงการปฐมนิเทศฯ (ครู อาจารย์ประจำการ)",
                                tooltip_data: 'this data'
                            }]
                        },{
                            name: "โครงการส่งเสริมกิจกรรมสโมสรนิสิตบัณฑิตศึกษา",
                            intervals: [{ // From-To pairs
                                from: Date.UTC(2015,09, 1),
                                to: Date.UTC(2016, 08, 30),
                                label: "โครงการส่งเสริมกิจกรรมสโมสรนิสิตบัณฑิตศึกษา",
                                tooltip_data: 'this data'
                            }]
                        },{
                            name: "โครงการสืบสานวัฒนธรรม",
                            intervals: [{ // From-To pairs
                                from: Date.UTC(2016,03, 1),
                                to: Date.UTC(2016, 03, 30),
                                label: "ระยะที่ 1",
                                tooltip_data: 'this data'
                            },{ // From-To pairs
                                from: Date.UTC(2016,06, 1),
                                to: Date.UTC(2016, 06, 30),
                                label: "ระยะที่ 2",
                                tooltip_data: 'this data'
                            }]
                        },{
                            name: "โครงการพัฒนาสุนทรียภาพทางวัฒนธรรม",
                            intervals: [{ // From-To pairs
                                from: Date.UTC(2016,06, 1),
                                to: Date.UTC(2016, 06, 31),
                                label: "โครงการพัฒนาสุนทรียภาพทางวัฒนธรรม",
                                tooltip_data: 'this data'
                            }]
                        },{
                            name: "โครงการประชุมวิชาการเสนอผลงานวิจัยระดับบัณฑิตศึกษาแห่งชาติ ครั้งที่ 38",
                            intervals: [{ // From-To pairs
                                from: Date.UTC(2016,01, 1),
                                to: Date.UTC(2016, 01, 31),
                                label: "โครงการประชุมวิชาการเสนอผลงานวิจัยระดับบัณฑิตศึกษาแห่งชาติ ครั้งที่ 38",
                                tooltip_data: 'this data'
                            }]
                        }
                    ];

               }else{

                   if($scope.user.user.role[0]=='press' ){

	               var c = 'container1';
                       var m = 4;
                       var b =[ "โครงการอบรมการใช้หลักภาษาที่ถูกต้องเพื่อการจัดทำผลงานวิชาการ",
                                "โครงการประชาสัมพันธ์สำนักพิมพ์มหาวิทยาลัยนเรศวร",
                                "โครงการสัมมนากองบรรณาธิการสำนักพิมพ์มหาวิทยาลัยนเรศวร",
                                "โครงการบริหารจัดการสำนักพิมพ์มหาวิทยาลัยนเรศวร"]
                       var tasks = [
                           {
                               name: "โครงการบริหารจัดการสำนักพิมพ์มหาวิทยาลัยนเรศวร",
                               intervals: [{ // From-To pairs
                                   from: Date.UTC(2015,09, 1),
                                   to: Date.UTC(2016, 09, 30),
                                   label: "โครงการบริหารจัดการสำนักพิมพ์มหาวิทยาลัยนเรศวร",
                                   tooltip_data: 'this data'
                               }]
                           },{
                               name: "โครงการสัมมนากองบรรณาธิการสำนักพิมพ์มหาวิทยาลัยนเรศวร",
                               intervals: [{ // From-To pairs
                                   from: Date.UTC(2015,10, 1),
                                   to: Date.UTC(2016, 06, 30),
                                   label: "โครงการสัมมนากองบรรณาธิการสำนักพิมพ์มหาวิทยาลัยนเรศวร",
                                   tooltip_data: 'this data'
                               }]
                           },{
                               name: "โครงการประชาสัมพันธ์สำนักพิมพ์มหาวิทยาลัยนเรศวร",
                               intervals: [{ // From-To pairs
                                   from: Date.UTC(2015,09, 1),
                                   to: Date.UTC(2016, 09, 30),
                                   label: "โครงการประชาสัมพันธ์สำนักพิมพ์มหาวิทยาลัยนเรศวร",
                                   tooltip_data: 'this data'
                               }]
                           },{
                               name: "โครงการอบรมการใช้หลักภาษาที่ถูกต้องเพื่อการจัดทำผลงานวิชาการ",
                               intervals: [{ // From-To pairs
                                   from: Date.UTC(2016,05, 1),
                                   to: Date.UTC(2016, 05, 30),
                                   label: "โครงการอบรมการใช้หลักภาษาที่ถูกต้องเพื่อการจัดทำผลงานวิชาการ",
                                   tooltip_data: 'this data'
                               }]
                           }
                       ];
                   }else{
                       if($scope.user.user.role[0]=='research' ){
	                   var c = 'container1';
                           var m = 5;
                           var b =["โครงการสนับสนุนทุนการนำเสนอผลงานวิทยานิพนธ์ในเวทีต่างประเทศ",
                                   "โครงการจัดทำวารสารมหาวิทยาลันนเรศวร: วิทยาศาสตร์และเทคโนโลยี",
                                   "โครงการจัดทำวารสารการวิจัยเพื่อพัฒนาชุมชน (มนุษยศาสตร์และสังคมศาสตร์)",
                                   "โครงการอบรมเชิงปฏิบัติการด้านการเขียน การนำเสนอบทความฯ",
                                   "โครงการส่งเสริม สนับสนุนการจัดการศึกษาสำหรับนิสิตระดับบัณฑิตศึกษา (ต่างชาติ)"]
                           var tasks =[ 
                               {
                                   name: "โครงการส่งเสริม สนับสนุนการจัดการศึกษาสำหรับนิสิตระดับบัณฑิตศึกษา (ต่างชาติ)",
                                   intervals: [{ // From-To pairs
                                       from: Date.UTC(2015,12, 1),
                                       to: Date.UTC(2015, 12, 31),
                                       label: "โครงการส่งเสริม สนับสนุนการจัดการศึกษาสำหรับนิสิตระดับบัณฑิตศึกษา (ต่างชาติ)",
                                       tooltip_data: 'this data'
                                   }]
                               },{
                                   name: "โครงการอบรมเชิงปฏิบัติการด้านการเขียน การนำเสนอบทความฯ",
                                   intervals: [{ // From-To pairs
                                       from: Date.UTC(2015,11, 1),
                                       to: Date.UTC(2015, 11, 31),
                                       label: "โครงการอบรมเชิงปฏิบัติการด้านการเขียน การนำเสนอบทความฯ",
                                       tooltip_data: 'this data'
                                   }]
                               },{
                                   name: "โครงการจัดทำวารสารการวิจัยเพื่อพัฒนาชุมชน (มนุษยศาสตร์และสังคมศาสตร์)",
                                   intervals: [{ // From-To pairs
                                       from: Date.UTC(2015,09, 1),
                                       to: Date.UTC(2016, 08, 30),
                                       label: "โครงการจัดทำวารสารการวิจัยเพื่อพัฒนาชุมชน (มนุษยศาสตร์และสังคมศาสตร์)",
                                       tooltip_data: 'this data'
                                   }]
                               },{
                                   name: "โครงการจัดทำวารสารมหาวิทยาลันนเรศวร: วิทยาศาสตร์และเทคโนโลยี",
                                   intervals: [{ // From-To pairs
                                       from: Date.UTC(2015,09, 1),
                                       to: Date.UTC(2016, 08, 30),
                                       label: "โครงการจัดทำวารสารมหาวิทยาลันนเรศวร: วิทยาศาสตร์และเทคโนโลยี",
                                       tooltip_data: 'this data'
                                   }]
                               },{
                                   name: "โครงการสนับสนุนทุนการนำเสนอผลงานวิทยานิพนธ์ในเวทีต่างประเทศ",
                                   intervals: [{ // From-To pairs
                                       from: Date.UTC(2015,09, 1),
                                       to: Date.UTC(2016, 08, 30),
                                       label: "โครงการสนับสนุนทุนการนำเสนอผลงานวิทยานิพนธ์ในเวทีต่างประเทศ",
                                       tooltip_data: 'this data'
                                   }]
                                }

                           ];

                       }else {
                       if($scope.user.user.role[0]=='admin' ){
	                   var c = 'container';
                 var m = 30;
                 var b = [
                 "โครงการสนับสนุนทุนการนำเสนอผลงานวิทยานิพนธ์ในเวทีต่างประเทศ",
                 "โครงการจัดทำวารสารมหาวิทยาลันนเรศวร: วิทยาศาสตร์และเทคโนโลยี",
                 "โครงการจัดทำวารสารการวิจัยเพื่อพัฒนาชุมชน (มนุษยศาสตร์และสังคมศาสตร์)",
                 "โครงการอบรมเชิงปฏิบัติการด้านการเขียน การนำเสนอบทความฯ",
                 "โครงการส่งเสริม สนับสนุนการจัดการศึกษาสำหรับนิสิตระดับบัณฑิตศึกษา (ต่างชาติ)",
                 "โครงการประชาสัมพันธ์บัณฑิตศึกษา",
                 "โครงการติดตามคุณภาพนิสิตระดับบัณฑิตศึกษา",
                 "โครงการสนับสนุนการผลิตสื่อการสอนในรูปแบบสื่ออิเล็กทรอนิกส์ระดับบัณฑิตศึกษา",
                 "โครงการสนับสนุนการจัดประชุมวิชาการ",
                 "โครงการจัดการความรู้ (KM)",
                 "โครงการประกันคุณภาพการศึกษา",
                 "โครงการสัมมนานิสิตบัณฑิตศึกษา",
                 "โครงการสัมมนาคณาจารย์บัณฑิตศึกษา",
                 "โครงการติดตามสถานภาพนิสิตบัณฑิตศึกษา",
                 "โครงการอบรมจริยธรรมการวิจัยระดับบัณฑิตศึกษา",
                 "โครงการประชุมวิชาการเสนอผลงานวิจัยระดับบัณฑิตศึกษาแห่งชาติ ครั้งที่ 38",
                 "โครงการพัฒนาสุนทรียภาพทางวัฒนธรรม",
                 "โครงการสืบสานวัฒนธรรม",
                 "โครงการส่งเสริมกิจกรรมสโมสรนิสิตบัณฑิตศึกษา",
                 "โครงการปฐมนิเทศระดับบัณฑิตศึกษา (ครู อาจารย์ประจำการ)",
                 "โครงการปฐมนิเทศระดับบัณฑิตศึกษา",
                 "โครงการพัฒนาองค์กร",
                 "โครงการพัฒนาสมรรถนะด้านการสื่อสารภาษาอังกฤษของบุคลากร",
                 "โครงการเสริมสร้างสุขภาพบุคลากร",
                 "โครงการศึกษาดูงานและพัฒนาทักษะของผู้บริหารในการจัดการศึกษาระดับบัณฑิตศึกษา",
                 "โครงการสอบประมวลความรู้นิสิตปริญญาโท แผน ข",
                 "โครงการอบรมการใช้หลักภาษาที่ถูกต้องเพื่อการจัดทำผลงานวิชาการ",
                 "โครงการประชาสัมพันธ์สำนักพิมพ์มหาวิทยาลัยนเรศวร",
                 "โครงการสัมมนากองบรรณาธิการสำนักพิมพ์มหาวิทยาลัยนเรศวร",
                 "โครงการบริหารจัดการสำนักพิมพ์มหาวิทยาลัยนเรศวร"]

                       var tasks = [
                           {
                               name: "โครงการบริหารจัดการสำนักพิมพ์มหาวิทยาลัยนเรศวร",
                               intervals: [{ // From-To pairs
                                   from: Date.UTC(2015,09, 1),
                                   to: Date.UTC(2016, 09, 30),
                                   label: "โครงการบริหารจัดการสำนักพิมพ์ฯ",
                                   tooltip_data: 'this data'
                               }]
                           },{
                               name: "โครงการสัมมนากองบรรณาธิการสำนักพิมพ์มหาวิทยาลัยนเรศวร",
                               intervals: [{ // From-To pairs
                                   from: Date.UTC(2015,10, 1),
                                   to: Date.UTC(2016, 06, 30),
                                   label: "โครงการสัมมนากองบรรณาธิการฯ",
                                   tooltip_data: 'this data'
                               }]
                           },{
                               name: "โครงการประชาสัมพันธ์สำนักพิมพ์มหาวิทยาลัยนเรศวร",
                               intervals: [{ // From-To pairs
                                   from: Date.UTC(2015,09, 1),
                                   to: Date.UTC(2016, 09, 30),
                                   label: "โครงการประชาสัมพันธ์สำนักพิมพ์ฯ",
                                   tooltip_data: 'this data'
                               }]
                           },{
                               name: "โครงการอบรมการใช้หลักภาษาที่ถูกต้องเพื่อการจัดทำผลงานวิชาการ",
                               intervals: [{ // From-To pairs
                                   from: Date.UTC(2016,05, 1),
                                   to: Date.UTC(2016, 05, 30),
                                   label: "โครงการอบรมการใช้หลักภาษาฯ",
                                   tooltip_data: 'this data'
                               }]
                           },{
                               name: "โครงการสอบประมวลความรู้นิสิตปริญญาโท แผน ข",
                               intervals: [{ // From-To pairs
                                   from: Date.UTC(2015,09, 1),
                                   to: Date.UTC(2016, 09, 30),
                                   label: "โครงการสอบประมวลความรู้ฯ",
                                   tooltip_data: 'this data'
                               }]
                           },{
                            name: "โครงการศึกษาดูงานและพัฒนาทักษะของผู้บริหารในการจัดการศึกษาระดับบัณฑิตศึกษา",
                            intervals: [{ // From-To pairs
                                from: Date.UTC(2015,12, 1),
                                to: Date.UTC(2015, 12, 31),
                                label: "โครงการศึกษาดูงานฯ",
                                tooltip_data: 'this data'
                            }]
                           },{
                            name: "โครงการเสริมสร้างสุขภาพบุคลากร",
                            intervals: [{ // From-To pairs
                                from: Date.UTC(2016,06, 1),
                                to: Date.UTC(2016, 06, 31),
                                label: "โครงการเสริมสร้างสุขภาพฯ",
                                tooltip_data: 'this data'
                            }]
                        },{
                            name: "โครงการพัฒนาสมรรถนะด้านการสื่อสารภาษาอังกฤษของบุคลากร",
                            intervals: [{ // From-To pairs
                                from: Date.UTC(2016,02, 1),
                                to: Date.UTC(2016, 08, 31),
                                label: "โครงการพัฒนาสมรรถนะด้านการสื่อสารฯ",
                                tooltip_data: 'this data'
                            }]
                        },{
                            name: "โครงการพัฒนาองค์กร",
                            intervals: [{ // From-To pairs
                                from: Date.UTC(2016,03, 1),
                                to: Date.UTC(2016, 06, 31),
                                label: "โครงการพัฒนาองค์กร",
                                tooltip_data: 'this data'
                            }]
                        },{
                            name: "โครงการปฐมนิเทศระดับบัณฑิตศึกษา",
                            intervals: [{ // From-To pairs
                                from: Date.UTC(2016,05, 1),
                                to: Date.UTC(2016, 05, 31),
                                label: "โครงการปฐมนิเทศระดับบัณฑิตศึกษา",
                                tooltip_data: 'this data'
                            }]
                        },{
                            name: "โครงการปฐมนิเทศระดับบัณฑิตศึกษา (ครู อาจารย์ประจำการ)",
                            intervals: [{ // From-To pairs
                                from: Date.UTC(2016,02, 1),
                                to: Date.UTC(2016, 02, 31),
                                label: "โครงการปฐมนิเทศฯ (ครู อาจารย์ประจำการ)",
                                tooltip_data: 'this data'
                            }]
                        },{
                            name: "โครงการส่งเสริมกิจกรรมสโมสรนิสิตบัณฑิตศึกษา",
                            intervals: [{ // From-To pairs
                                from: Date.UTC(2015,09, 1),
                                to: Date.UTC(2016, 08, 30),
                                label: "โครงการส่งเสริมกิจกรรมสโมสรนิสิตฯ",
                                tooltip_data: 'this data'
                            }]
                        },{
                            name: "โครงการสืบสานวัฒนธรรม",
                            intervals: [{ // From-To pairs
                                from: Date.UTC(2016,03, 1),
                                to: Date.UTC(2016, 03, 30),
                                label: "ระยะที่ 1",
                                tooltip_data: 'this data'
                            },{ // From-To pairs
                                from: Date.UTC(2016,06, 1),
                                to: Date.UTC(2016, 06, 30),
                                label: "ระยะที่ 2",
                                tooltip_data: 'this data'
                            }]
                        } ,{
                            name: "โครงการพัฒนาสุนทรียภาพทางวัฒนธรรม",
                            intervals: [{ // From-To pairs
                                from: Date.UTC(2016,06, 1),
                                to: Date.UTC(2016, 06, 31),
                                label: "โครงการพัฒนาสุนทรียภาพทางวัฒนธรรม",
                                tooltip_data: 'this data'
                            }]
                        },{
                            name: "โครงการประชุมวิชาการเสนอผลงานวิจัยระดับบัณฑิตศึกษาแห่งชาติ ครั้งที่ 38",
                            intervals: [{ // From-To pairs
                                from: Date.UTC(2016,01, 1),
                                to: Date.UTC(2016, 01, 31),
                                label: "โครงการประชุมวิชาการเสนอผลงานวิจัยระดับบัณฑิตศึกษาแห่งชาติ ครั้งที่ 38",
                                tooltip_data: 'this data'
                            }]
                        },{
                               name: "โครงการอบรมจริยธรรมการวิจัยระดับบัณฑิตศึกษา",
                               intervals: [{ // From-To pairs
                                   from: Date.UTC(2015,09, 1),
                                   to: Date.UTC(2015, 09, 31),
                                   label: "ระยะที่ 1",
                                   tooltip_data: 'this data'
                               },{ // From-To pairs
                                   from: Date.UTC(2016,02, 1),
                                   to: Date.UTC(2016, 02, 31),
                                   label: "ระยะที่ 2",
                                   tooltip_data: 'this data'
                               },{ // From-To pairs
                                   from: Date.UTC(2016,05, 1),
                                   to: Date.UTC(2016, 05, 30),
                                   label: "ระยะที่ 3",
                                   tooltip_data: 'this data'
                               }]
                           },{
                               name: "โครงการติดตามสถานภาพนิสิตบัณฑิตศึกษา",
                               intervals: [{ // From-To pairs
                                   from: Date.UTC(2016,01, 1),
                                   to: Date.UTC(2016, 01, 29),
                                   label: "โครงการติดตามสถานภาพนิสิตบัณฑิตศึกษา",
                                   tooltip_data: 'this data'
                               }]
                           },{
                               name: "โครงการสัมมนาคณาจารย์บัณฑิตศึกษา",
                               intervals: [{ // From-To pairs
                                   from: Date.UTC(2015,10, 1),
                                   to: Date.UTC(2015, 10, 30),
                                   label: "โครงการสัมมนาคณาจารย์ฯ",
                                   tooltip_data: 'this data'
                               }]
                           },{
                               name: "โครงการสัมมนานิสิตบัณฑิตศึกษา",
                               intervals: [{ // From-To pairs
                                   from: Date.UTC(2016,02, 1),
                                   to: Date.UTC(2016, 02, 31),
                                   label: "โครงการสัมมนานิสิตฯ",
                                   tooltip_data: 'this data'
                               }]
                           },{
                               name: "โครงการประกันคุณภาพการศึกษา",
                               intervals: [{ // From-To pairs
                                   from: Date.UTC(2016,08, 1),
                                   to: Date.UTC(2016, 08, 30),
                                   label: "โครงการประกันคุณภาพฯ",
                                   tooltip_data: 'this data'
                               }]
                           },{
                               name: "โครงการจัดการความรู้ (KM)",
                               intervals: [{ // From-To pairs
                                   from: Date.UTC(2016,04, 1),
                                   to: Date.UTC(2016, 04, 31),
                                   label: "โครงการจัดการความรู้ (KM)",
                                   tooltip_data: 'this data'
                               }]
                           },{
                               name: "โครงการสนับสนุนการจัดประชุมวิชาการ",
                               intervals: [{ // From-To pairs
                                   from: Date.UTC(2015,09, 1),
                                   to: Date.UTC(2016, 08, 30),
                                   label: "โครงการสนับสนุนการจัดประชุมวิชาการ",
                                   tooltip_data: 'this data'
                               }]
                           },{
                               name: "โครงการสนับสนุนการผลิตสื่อการสอนในรูปแบบสื่ออิเล็กทรอนิกส์ระดับบัณฑิตศึกษา",
                               intervals: [{ // From-To pairs
                                   from: Date.UTC(2015,09, 1),
                                   to: Date.UTC(2016, 06, 31),
                                   label: "โครงการสนับสนุนการผลิตสื่อการสอนในรูปแบบสื่ออิเล็กทรอนิกส์ระดับบัณฑิตศึกษา",
                                   tooltip_data: 'this data'
                               }]
                           },{
                               name: "โครงการติดตามคุณภาพนิสิตระดับบัณฑิตศึกษา",
                               intervals: [{ // From-To pairs
                                   from: Date.UTC(2015,09, 1),
                                   to: Date.UTC(2016, 08, 30),
                                   label: "โครงการติดตามคุณภาพนิสิตระดับบัณฑิตศึกษา",
                                   tooltip_data: 'this data'
                               }]
                           },{
                               name: "โครงการประชาสัมพันธ์บัณฑิตศึกษา",
                               intervals: [{ // From-To pairs
                                   from: Date.UTC(2016,06, 1),
                                   to: Date.UTC(2016, 06, 31),
                                   label: "โครงการประชาสัมพันธ์บัณฑิตศึกษา",
                                   tooltip_data: 'this data'
                               }]
                           }, {
                               name: "โครงการส่งเสริม สนับสนุนการจัดการศึกษาสำหรับนิสิตระดับบัณฑิตศึกษา (ต่างชาติ)",
                               intervals: [{ // From-To pairs
                                   from: Date.UTC(2015,12, 1),
                                   to: Date.UTC(2015, 12, 31),
                                   label: "โครงการส่งเสริม สนับสนุนฯ นิสิตระดับบัณฑิตศึกษา (ต่างชาติ)",
                                   tooltip_data: 'this data'
                               }]
                           },{
                               name: "โครงการอบรมเชิงปฏิบัติการด้านการเขียน การนำเสนอบทความฯ",
                               intervals: [{ // From-To pairs
                                   from: Date.UTC(2015,11, 1),
                                   to: Date.UTC(2015, 11, 31),
                                   label: "โครงการอบรมเชิงปฏิบัติการด้านการเขียน การนำเสนอบทความฯ",
                                   tooltip_data: 'this data'
                               }]
                           },{
                               name: "โครงการจัดทำวารสารการวิจัยเพื่อพัฒนาชุมชน (มนุษยศาสตร์และสังคมศาสตร์)",
                               intervals: [{ // From-To pairs
                                   from: Date.UTC(2015,09, 1),
                                   to: Date.UTC(2016, 08, 30),
                                   label: "โครงการจัดทำวารสารการวิจัยเพื่อพัฒนาชุมชน (มนุษยศาสตร์และสังคมศาสตร์)",
                                   tooltip_data: 'this data'
                               }]
                           },{
                               name: "โครงการจัดทำวารสารมหาวิทยาลันนเรศวร: วิทยาศาสตร์และเทคโนโลยี",
                               intervals: [{ // From-To pairs
                                   from: Date.UTC(2015,09, 1),
                                   to: Date.UTC(2016, 08, 30),
                                   label: "โครงการจัดทำวารสารมหาวิทยาลันนเรศวร: วิทยาศาสตร์และเทคโนโลยี",
                                   tooltip_data: 'this data'
                               }]
                           },{
                               name: "โครงการสนับสนุนทุนการนำเสนอผลงานวิทยานิพนธ์ในเวทีต่างประเทศ",
                               intervals: [{ // From-To pairs
                                   from: Date.UTC(2015,09, 1),
                                   to: Date.UTC(2016, 08, 30),
                                   label: "โครงการสนับสนุนทุนการนำเสนอผลงานวิทยานิพนธ์ฯ",
                                   tooltip_data: 'this data'
                               }]
                           }
                       ];

                        }
                       }

                   }
               }
           }
       }

	     // re-structure the tasks into line seriesvar series = [];
	     var series = [];
	     $.each(tasks.reverse(), function(i, task) {
	         var item = {
	             name: task.name,
	             data: []
	         };
	         $.each(task.intervals, function(j, interval) {
	             item.data.push({
	                 x: interval.from,
		         y: i,
		         label: interval.label,
		         from: interval.from,
		         to: interval.to,
                         tooltip_data: interval.tooltip_data
	             }, {
		         x: interval.to,
		         y: i,
		         from: interval.from,
		         to: interval.to,
                         tooltip_data: interval.tooltip_data
	             });
	             // add a null value between intervals
	             if (task.intervals[j + 1]) {
                         item.data.push(
		             [(interval.to + task.intervals[j + 1].from) / 2, null]
		         );
	             }
	         });
                 series.push(item);
             });

	     // create the chart
	     var chart = new Highcharts.Chart({
	         chart: {
	             //renderTo: 'container',
	             renderTo: c,
	         },

	         title: {
		     text: 'Category History'
	         },

	         xAxis: {
		     type: 'datetime',
                     gridLineWidth: 0.5,
                     labels: {
           	         step: 1,
        	     },
                     min: Date.UTC(2015, 08, 1),
        	     max: Date.UTC(2016, 08, 30),
                     dateTimeLabelFormats: { // don't display the dummy year
                         //month: '%b',
                         month: '%b, %Y',
                         year: '%Y'
           	     },
	         },

	         yAxis: {
                     min:0,
                     max:m,
                     lineWidth: 2,
		    // categories:keys, 
		     categories:b, 
		     //categories:result[0].project.list.p.list, 
		     tickInterval: 1,            
		     tickPixelInterval: 200,
		     labels: {
                         //enabled: false,
		         style: {
		             color: '#525151',
		   	     font: '11px Helvetica',
		   	     fontWeight: 'bold'
		         },
		   	           /* formatter: function() {
		   	                if (tasks[this.value]) {
		   	                    return tasks[this.value].name;
		   	                }
		   	            }*/
		     },
		     startOnTick: false,
		     endOnTick: false,
		     title: {
		         text: 'ชื่อโครงการ'
		     },
		     minPadding: 0.2,
		     maxPadding: 0.2,
		     fontSize:'10px'
		   	        
	         },

                 legend: {
                     enabled: false
	         },
	         tooltip: {
                     formatter: function() {
		         return '<b>'+ tasks[this.y].name + 
                             '</b><br/>'+this.point.options.tooltip_data +'<br>' +
		   	     Highcharts.dateFormat('%m-%d-%Y', this.point.options.from)  +
		   	     ' - ' + Highcharts.dateFormat('%m-%d-%Y', this.point.options.to); 
		     }
                 },

	         plotOptions: {
                     line: {
		         lineWidth: 5,
		         marker: {
		             enabled: false
		         },
		         dataLabels: {
		             enabled: true,
		   	     align: 'left',
		   	     formatter: function() {
		   	         return this.point.options && this.point.options.label;
		   	     }
		         }
		     }
	         },

	         series: series
	     });		   
             console.log(series);
        });
     });
     //
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
}


