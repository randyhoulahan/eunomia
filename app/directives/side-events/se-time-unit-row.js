define(['app',
    'lodash',
    'text!./se-time-unit-row.html',
    'text!../forms/edit/reservation-dialog.html',
    'moment',
    'ngDialog',
    '../forms/edit/reservation',
    'css!https://cdn.jsdelivr.net/gh/scbd/angular-dragula@1.2.6/dist/dragula.min.css',
    'filters/moment'
], function(app, _, template, resDialog, moment) {

    app.directive("seTimeUnitRow", ['ngDialog', '$timeout', '$document', '$http',
        function(ngDialog, $timeout, $document, $http) {
            return {
                restrict: 'E',
                template: template,
                replace: true,
                transclude: false,
                require: ['^side-events'],

                link: function($scope, $element) {

                        var timeUnit = 900.025; //15 minutes in seconds
                        var intervalDuration; // number on sub time intervals in a col, now a colomm is houw
                        intervalDuration = 3600 / timeUnit;
                        var initialized = false;

                        // ============================================================
                        //
                        // ============================================================
                        var killWw = $scope.$watch('conferenceDays', function() {
                          if(!_.isEmpty($scope.conferenceDays) && !$scope.room.initialized){
                                initTimeIntervals();
                                killWw();
                            }
                        });


                        //============================================================
                        //
                        //============================================================
                        function initTimeIntervals() {

                          initialized=true;

                          if(!_.isObject($scope.bagScopes))
                            $scope.bagScopes = {};

                          $scope.timezone=$scope.conference.timezone;

                          if ($scope.conferenceDays && !_.isEmpty($scope.conferenceDays)) {
                                $scope.firstDay = moment.tz($scope.conferenceDays[0],$scope.conference.timezone).startOf('day');
                                $scope.lastDay =moment.tz($scope.conferenceDays[$scope.conferenceDays.length-1],$scope.conference.timezone).startOf('day');

                                $scope.timeIntervals=[];
                                if($scope.conferenceDays && $scope.conferenceDays.length)
                                  $scope.conferenceDays.forEach(function(item){
                                    $scope.conference.seTiers.forEach(function(tier){
                                        var cell ={};
                                        cell.dayTier = moment.tz(item,$scope.conference.timezone).startOf('day').add(tier.seconds,'seconds');
                                        cell.id =$scope.room._id+cell.dayTier.format('YYYYMMDDTHHmm');
                                        cell.room = $scope.room;
                                        cell.drag = false;
                                        cell.bag=[];

                                        //if(prefs.onlyWeekdaysSE && cell.dayTier.isoWeekday()<6)
                                            $scope.timeIntervals.push(cell);


                                        $scope.bagScopes[cell.id]=cell.bag;
                                    });

                                  });
                                $scope.room.timeIntervals = $scope.timeIntervals;

                                // initOuterGridWidth().then(function() {

                                    // ============================================================
                                    //
                                    // ============================================================
                                    var killW = $scope.$watch('reservations', function() {
                                      if(!_.isEmpty($scope.reservations)){

                                          //calcColWidths();
                                          if(!$scope.slotElements)$scope.slotElements={};
                                          if(!$scope.slotElements[$scope.room._id])$scope.slotElements[$scope.room._id]=[];
                                          _.each($scope.bagScopes,function(v,k){

                                            var elId ='#'+k;
                                            var el =  $element.find(elId);
                                            $scope.slotElements[$scope.room._id].push(el);

                                          });

                                        $scope.getReservations();
                                        killW();
                                      }
                                    });


                                // });
                            }
                        } //initTimeIntervals

                        //=======================================================================
                        // import created by and modified by adta for admins
                        //=======================================================================
                        function injectUserData(docs) { //jshint ignore:line

                            if(!$scope.users) $scope.users=[];
                              _.each(docs, function(doc) {
                                 if(doc.sideEvent && doc.sideEvent.meta){
                                  $scope.users.push(doc.sideEvent.meta.createdBy);
                                  $scope.users.push(doc.sideEvent.meta.modifiedBy);
                                }
                              });

                            $scope.users=_.uniq($scope.users);

                            if(!_.isEmpty($scope.users))
                              return $http.get('/api/v2013/userinfos?query='+JSON.stringify({userIDs:$scope.users})).then(function(res){
                                  _.each(docs, function(doc) {
                                       if(!_.find(res.data,{userID:doc.sideEvent.meta.createdBy})) throw 'User not found : '+doc.sideEvent.meta.createdBy;
                                       doc.sideEvent.meta.createdByObj=_.find(res.data,{userID:doc.sideEvent.meta.createdBy});

                                       if(!_.find(res.data,{userID:doc.sideEvent.meta.modifiedBy})) throw 'User not found : '+doc.sideEvent.meta.modifiedBy;
                                       doc.sideEvent.meta.modifiedByObj=_.find(res.data,{userID:doc.sideEvent.meta.modifiedBy});
                                 });
                              });
                        } //importUserData


                        //============================================================
                        //
                        //============================================================
                        $scope.getReservations = function () {

                              _.each($scope.collisions[$scope.room._id], function(res) {
                                embedTypeInRes(res);
                                loadCollisions(res);
                            });

                              _.each($scope.reservations[$scope.room._id], function(res) {
                                embedTypeInRes(res);
                                loadReservationsInRow(res);
                              });
                               
                        }; // getReservations


                        //============================================================
                        //
                        //============================================================
                        function loadReservationsInRow(res) {

                            for (var i = 0; i < $scope.timeIntervals.length; i++) {

                                    var interval = $scope.timeIntervals[i];

                                    if (isResInTimeInterval(interval.dayTier, res))
                                        interval.bag.push(res);


                            } //for
                        } //loadReservationInRow

                        //============================================================
                        //
                        //============================================================
                        function loadCollisions(res) {

                            for (var i = 0; i < $scope.timeIntervals.length; i++) {

                                    var interval = $scope.timeIntervals[i];

                                   if (isblockedTimeInterval(interval.dayTier, res)){
                                        if(res.subType)
                                          interval.bag.push(res);
                                        else
                                          $scope.timeIntervals[i].collision=true;

                                    }
                            } //for
                        } //loadReservationInRow
                        //============================================================
                        //
                        //============================================================
                        function isblockedTimeInterval(timeInterval, res) {



                            return  ((moment.tz(res.start,$scope.conference.timezone).isSameOrAfter(timeInterval) &&
                                    moment.tz(res.start,$scope.conference.timezone).isBefore(moment.tz(timeInterval,$scope.conference.timezone).add(90,'minutes'))) ||

                                    (moment.tz(res.end,$scope.conference.timezone).isSameOrAfter(timeInterval) &&
                                            moment.tz(res.end,$scope.conference.timezone).isBefore(moment.tz(timeInterval,$scope.conference.timezone).add(90,'minutes')))||

                                    (moment.tz(res.start,$scope.conference.timezone).isBefore(timeInterval) &&
                                            moment.tz(res.end,$scope.conference.timezone).isAfter(moment.tz(timeInterval,$scope.conference.timezone).add(90,'minutes')))

                                  );

                        } //isResInInterval
                        //============================================================
                        //
                        //============================================================
                        function isResInTimeInterval(timeInterval, res) {
                            return  moment.tz(res.start,$scope.conference.timezone).isSameOrAfter(timeInterval) &&
                                    moment.tz(res.start,$scope.conference.timezone).isBefore(moment.tz(timeInterval,$scope.conference.timezone).add(90,'minutes'));

                        } //isResInInterval


                        var typeFound;
                        //============================================================
                        //
                        //===========================================================
                        function embedTypeInRes(res) {

                          if(!typeFound)
                            typeFound = _.find($scope.options.types, {
                                '_id': res.type
                            });
                          if(!typeFound) return;

                            if(typeFound && typeFound.children)
                            var subFound = _.find(typeFound.children, {
                                '_id': res.subType
                            });

                            if (subFound ) {
                                res.subTypeObj = subFound;
                            }
                        } //embedTypeInRes

                    }, //link


            }; //return
        }
    ]);
});