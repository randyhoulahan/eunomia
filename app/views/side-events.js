define(['app', 'lodash', 'moment',
  'text!directives/forms/edit/room-dialog.html',
  'BM-date-picker',
  'css!libs/bootstrap-material-datetimepicker/css/bootstrap-material-datetimepicker.css',
  'css!libs/angular-dragula/dist/dragula.css', 'css!./side-events.css',
  '../services/mongo-storage',
  '../directives/forms/edit/room',
  'ngDialog',
  'css!libs/ng-dialog/css/ngDialog.css',
  'css!libs/ng-dialog/css/ngDialog-theme-default.min.css',
  'directives/side-event'

], function(app, _, moment, roomDialog) {

  app.controller("events", ['$scope', '$element', '$document', 'dragulaService', 'mongoStorage', '$timeout', '$rootScope', 'ngDialog',
    function($scope, $element, $document, dragulaService, mongoStorage, $timeout, $rootScope, ngDialog) {


      // $scope.startFilter=0;
      // $scope.endFilter=0;
      $scope.sideEvents = ['1'];
      $scope.days = [];
      $scope.meeting = 0;
      $scope.search = '';
      $scope.rooms={};
      var hoverArray = [];
      var slotElements ={};
      var cancelDropIdicators;


    //  var dragElOrgHeight, dragElOrgWidth;
      $scope.syncLoading = 0;
      init();

      //============================================================
      //
      //============================================================
      function init() {
        $scope.options = {};
        initReq();
        initMeeting().then(function() {
          generateDays();
            loadRooms().then(function(){
              initSideEvents($scope.meeting).then(function(){
                  loadReservations().then(function(){

                        resize();
                        initPreferences();
                  });
              });
            });

        });
      } //init

      //============================================================
      //
      //============================================================
      function initReq() {
        $scope.options.requirements=[
                  {title:'interpretation',value:'interpretation'},
          {title:'catering',value:'catering'},
          {title:'overhead',value:'overhead'},
          {title:'pc',value:'pc'},
            {title:'sound',value:'sound'},
            {title:'lcd',value:'lcd'},
            {title:'skype',value:'skype'},
        ];
      } //initMeeting
      //============================================================
      //
      //============================================================
      $scope.changeMeeting = function() {
        generateDays();
        loadRooms().then(function() {
          initSideEvents($scope.meeting);
        }).then(function() {
          loadReservations().then(function(){

              resize();

          });
        });

        // $scope.dateChange('end-filter');
        // $scope.dateChange('start-filter');
      }; //init

      //============================================================
      //
      //============================================================
      function resize(){
        $timeout(function(){
          _.each($scope.options.rooms,function(room) {
                var roomEl = $element.find('#'+room._id);
                slotElements[room._id]=[];
                roomEl.children().children().children().children().each(function(){
                    slotElements[room._id].push($(this));
                });
            });

        },100).then(function(){
            var roomHolder =$element.find('#room-holder');
            var seScroll = $element.find('div.se-scroll');
            var yLabels = $element.find('div.ng-binding.ng-scope');
            var numSlot =0;
            seScroll.height(roomHolder.height()-120);

            var cancelHeight = setInterval(function(){
              if(!_.isEmpty(slotElements)){
                    _.each($scope.rooms,function(room,key){
                        if(!numSlot)
                            numSlot = room.bookings.length*room.bookings[0].tiers.length;
                        _.each(slotElements[key],function(slot){
                          if(slot.height()<(roomHolder.height()-47-(numSlot*3))/numSlot)
                              slot.height((roomHolder.height()-47-(numSlot*3))/numSlot);
                        });
                    });
                    yLabels.each(function(){
                        $(this).height((roomHolder.height()-47-(numSlot*3))/numSlot);
                    });
                    clearInterval(cancelHeight);
              }
            },500);
        });
      }

      $scope.sync = function() {
        $scope.syncLoading = 1;

        mongoStorage.syncSideEvents().then(function() {
          initSideEvents($scope.meeting);
        }).then(function() {
          $scope.syncLoading = 0;

          init();
        });
      };
      //============================================================
      //
      //============================================================
      function dateChangeEffect(id) {
        $element.find('#' + id).parent().addClass('is-focused');

        $timeout(function() {
          $element.find('#' + id).parent().removeClass('is-focused');
        }, 2000);
      }; //init

      //============================================================
      //
      //============================================================
      $scope.dateChange = function(id) {
        var dayTS;
        var startDatTS = moment($scope.startDate).unix();
        var endDatTS = moment($scope.endDate).unix();

        if (id === 'start-filter') {
          $element.find('#end-filter').bootstrapMaterialDatePicker('setMinDate', $scope.startDate);
          _.each($scope.days, function(day, key) {
            dayTS = moment(day.date).unix();
            if (dayTS < startDatTS) {
              day.selected = false;
              _.each($scope.options.rooms, function(room) {
                room.bookings[key].selected = false;
              });
            } else {
              day.selected = true;
              _.each($scope.options.rooms, function(room) {
                room.bookings[key].selected = true;
              });
            }
          });
        }
        if (id === 'end-filter') {
          $element.find('#start-filter').bootstrapMaterialDatePicker('setMaxDate', $scope.endDate);
          _.each($scope.days, function(day, key) {
            dayTS = moment(day.date).unix();
            if (dayTS > endDatTS || dayTS < startDatTS) {
              day.selected = false;
              _.each($scope.options.rooms, function(room) {
                room.bookings[key].selected = false;
              });
            } else {
              day.selected = true;
              _.each($scope.options.rooms, function(room) {
                room.bookings[key].selected = true;
              });
            }
          });
        }
        dateChangeEffect(id);
      }; //init
      //============================================================
      //
      //============================================================
      function initSideEvents(meeting) {
        var allOrgs;

        return mongoStorage.loadUnscheduledSideEvents(meeting).then(function(res) {
          $scope.sideEvents = res.data;
        }).then(
          function() {
            return mongoStorage.loadOrgs('inde-orgs', 'published').then(function(orgs) {
              allOrgs = orgs.data;

            });

          }
        ).then(function() {
          _.each($scope.sideEvents, function(res) {
            res.sideEvent.orgs = [];
            _.each(res.sideEvent.hostOrgs, function(org) {
              res.sideEvent.orgs.push(_.findWhere(allOrgs, {
                '_id': org
              }));
            });
          }); // each
        }).then(function() {


          if (!$scope.seModels) $scope.seModels = [];
          _.each($scope.sideEvents, function(se) {
            $scope.seModels.push(se);
          });
        });

      } //initMeeting

      //============================================================
      //
      //============================================================
      function initMeeting() {
        return mongoStorage.loadconferences().then(function(confs) {
          $scope.options.conferences = confs.data;
          var lowestEnd = Math.round(new Date().getTime() / 1000);
          var chosenEnd = 0;
          var selectedKey = 0;
          _.each($scope.options.conferences, function(meet, key) {
            var date = moment.unix(meet.end);
            if (!chosenEnd) chosenEnd = meet.end;
            if (meet.end > lowestEnd && meet.end <= chosenEnd) {
              chosenEnd = meet.end;
              selectedKey = key;
            }
          });
          $scope.options.conferences[selectedKey].selected = true;
          $scope.meeting = $scope.options.conferences[selectedKey]._id;
        });
      } //initMeeting
      //============================================================
      //
      //============================================================
      function getBagScope(container) {

        if (container.attr('id') === 'unscheduled-side-events')
          return $scope.sideEvents;
        else {
          var room = _.findWhere($scope.options.rooms, {
            '_id': container.attr('room-index')
          });
          if (!room) throw "Error: room id mismatch when finding bag scope.";
          return room.bookings[container.attr('slot-index')].tiers[container.attr('tier-index')].bag;

          //return bagScope;
        }
      }

      //============================================================
      //
      //============================================================
      function loadReservations() {

        var meeting = _.findWhere($scope.options.conferences, {
          _id: $scope.meeting
        });
        var time, tier, allOrgs;
        $scope.venue = meeting.venue;
        return mongoStorage.loadReservations(meeting.start, meeting.end, meeting.venue).then(function(res) {
            $scope.reservations = res.data;

            if (!$scope.seModels) $scope.seModels = [];
            _.each($scope.reservations, function(res) {
              $scope.seModels.push(res);
            });
          })
          .then(
            function() {
              return mongoStorage.loadOrgs('inde-orgs', 'published').then(function(orgs) {
                allOrgs = orgs.data;

              });

            }
          ).then(function() {
            _.each($scope.reservations, function(res) {
              if (!res.sideEvent) throw 'side vent data not loaded for res';
              res.sideEvent.orgs = [];
              _.each(res.sideEvent.hostOrgs, function(org) {
                res.sideEvent.orgs.push(_.findWhere(allOrgs, {
                  '_id': org
                }));
              });
            }); // each
          })



        .then(function() {
          var room;
          var dayIndex = -1;
          var cancelInterval = setInterval(function() { // hack for unresolved timming issue
            if ($scope.options.rooms && $scope.days) {
              clearInterval(cancelInterval);
              _.each($scope.reservations, function(res) {
                room = _.findWhere($scope.options.rooms, {
                  _id: res.location.room
                });
                dayIndex = _.findIndex($scope.days, {
                  date: moment.utc(moment(res.start).format('YYYY-MM-DD')).format()
                });

                if(dayIndex<0) throw 'Error: no day found from reservation.';
                time = moment.utc(res.start).format('X') - moment.utc($scope.days[dayIndex].date).format('X');

                tier = _.findWhere(room.bookings[dayIndex].tiers, {
                  'seconds': time
                });

                tier.bag.push(res);

              });
            }
          }, 100); //settime Interval
        });
      } //getRoomIndex


      //============================================================
      //
      //============================================================
      function generateDays() {
        $scope.days = [];
        var meeting = _.findWhere($scope.options.conferences, {
          _id: $scope.meeting
        });


        var numDays = Math.floor((Number(meeting.end) - Number(meeting.start)) / (24 * 60 * 60));
        var seconds = Number(meeting.start);
        var date = moment.unix(seconds);

        $scope.startDate = date.format('YYYY-MM-DD');


        $element.find('#start-filter').bootstrapMaterialDatePicker('setMinDate', date);
        $element.find('#end-filter').bootstrapMaterialDatePicker('setMinDate', date);
        for (var i = 1; i <= numDays +1; i++) {
          if (i === numDays +1) {

            $element.find('#end-filter').bootstrapMaterialDatePicker('setMaxDate', date);
            $element.find('#start-filter').bootstrapMaterialDatePicker('setMaxDate', date);
            $scope.endDate = date.format('YYYY-MM-DD');

          }
          _.each(meeting.seTiers, function(tier) {
            tier.bag = [];
          });
          $scope.days.push({
            'selected': true,
            'date': moment.utc(date.format("YYYY-MM-DD")).format(),
            'month': date.format("MMM").toUpperCase(),
            'day': date.format("DD"),
            'tiers': _.cloneDeep(meeting.seTiers)
          });
          seconds = seconds + (24 * 60 * 60);
          date = moment.unix(seconds);
        }
        $timeout(function() {
          dateChangeEffect('start-filter');
          dateChangeEffect('end-filter');
        }, 1500);

      } //generateDays



      //============================================================
      //
      //============================================================
      function loadRooms() {

        return mongoStorage.loadConferenceRooms($scope.meeting).then(function(rooms) {
          $scope.options.rooms = rooms.data;

          _.each($scope.options.rooms, function(room) {
            room.bookings = _.cloneDeep($scope.days);
            $scope.rooms[room._id]=room;
          });
        });
      } //generateDays

      //============================================================
      //
      //============================================================
      function setTimes(res, container) {


        var startDate = Number(moment(container.attr('date')).format('X')); //.format('X')

        startDate = startDate + Number(container.attr('time'));


        if (container.attr('id') !== 'unscheduled-side-events') {
          res.start = startDate;
          res.end = startDate + 5400;
          if (!res.location) res.location = {};
          res.location.venue = getVenueId($scope.meeting);
          res.location.room = container.attr('room-index');
          res.meta.status= res.meta.status || 'request-non-blocking';
          delete(res['$unset']);
        } else {
          delete(res.start);
          delete(res.end);
          delete(res.location);
          res['$unset'] = {
            'start': '',
            'end': ''
          };
        }
        return mongoStorage.saveRes(res);
      }
      //============================================================
      //
      //============================================================
      function getVenueId(meetingId) {

        return _.findWhere($scope.options.conferences, {
          _id: meetingId
        }).venue;

      } //generateDays
      //============================================================
      //
      //============================================================
      function sEBagAccepts(el, target, source, sibling) {

        target = angular.element(target);
        if (_.isArray(getBagScope(target)) && getBagScope(target).length !== 0 && target.attr('id') !== 'unscheduled-side-events')
          return false;
        else
          return true;
      }
      //============================================================
      //
      //============================================================
      $scope.test = function($event) {
          $.material.init();
          alert('test');
          console.log($event);
          $event.currentTarget.popover('show');

        } //generateDays

      var emptyEl = angular.element('<span class="empty-bag" >&nbsp;</span>');
      //============================================================
      //
      //============================================================
      function hoverCleanUp() {

        _.each(hoverArray, function(el) {
          el.find('span.empty-bag').show();
          el.removeClass('label-success');
          el.removeClass('label-danger');
        });
      } //generateDays

      //============================================================
      //
      //============================================================
      $scope.roomDialog = function(room) {
        $scope.editRoom = room;
        var dialog = ngDialog.open({
          template: roomDialog,
          className: 'ngdialog-theme-default',
          closeByDocument: true,
          plain: true,
          scope: $scope
        });

        dialog.closePromise.then(function(ret) {

          if (ret.value == 'draft') $scope.close();
          if (ret.value == 'publish') $scope.requestPublish().then($scope.close).catch(function onerror(response) {

            $scope.onError(response);

          });

        });
      };

      //============================================================
      //
      //============================================================
      dragulaService.options($scope, 'se-bag', {
        mirrorAnchor: 'top',
        accepts: sEBagAccepts
      });
      //============================================================
      //
      //============================================================
      dragulaService.options($scope, 'rooms-bag', {
        moves: function(el, container, handle) {
          return handle.className === 'grabbible room-title ng-binding';
        },

      });

      //============================================================
      //
      //============================================================
      function removeDropIndicators(){

        $timeout.cancel(cancelDropIdicators);
        _.each($scope.rooms,function(room){
              _.each(slotElements[room._id],function(el){
                  angular.element(el).removeClass('label-danger-light');
                  angular.element(el).removeClass('label-success-light');
              });
        });
      }// removeDropIndicators


      //============================================================
      //
      //============================================================
      $scope.$on('rooms-bag.drop-model', function(el, target, source, sibling) {

        target.parent().children().each(function() {

          var room = _.findWhere($scope.options.rooms, {
            '_id': $(this).attr('id')
          });
          room.sort = $(this).index();
          var roomClone = _.cloneDeep(room);
          delete(roomClone);
          return mongoStorage.save('venue-rooms', roomClone, roomClone._id).catch(function() {
            $rootScope.$broadcast("showError", "There was an error updating the server with the room order.");
          });
        });
        $rootScope.$broadcast("showInfo", "Room Sort Order Successfully Updated.");

      });

      //============================================================
      //
      //============================================================
      $scope.$on('se-bag.drag', function(e, el, container) {
        var roomId;
        var elModel = _.findWhere($scope.seModels, {
          '_id': el.attr('res-id')
        });

        _.each($scope.rooms,function(room){
            if (elModel.sideEvent.expNumPart > room.capacity){
              _.each(slotElements[room._id],function(el,key){
                angular.element(el).addClass('label-danger-light');
              });
            }else{
              _.each(slotElements[room._id],function(el){
                angular.element(el).addClass('label-success-light');
              });
            }
        });
        cancelDropIdicators = $timeout(function(){
            removeDropIndicators();
        },10000);
      });//se-bag.drag

      //============================================================
      //
      //============================================================
      $scope.$on('se-bag.cloned', function(e, mirror, shadow) {

        mirror.children('div.panel.panel-default.se-panel').hide();
        mirror.children('div.drag-view.text-center').show();
        shadow.children('div.panel.panel-default.se-panel').hide();
        shadow.children('div.drag-view.text-center').show();
      });

      //============================================================
      //
      //============================================================
      $scope.$on('se-bag.canceled', function(e, mirror, shadow) {
//        removeDropIndicators();
        mirror.children('div.panel.panel-default.se-panel').toggle();
        mirror.children('div.drag-view.text-center').toggle();
      });

      //============================================================
      //
      //============================================================
      $scope.$on('se-bag.shadow', function(e, el, container, source) {
        var siblings;
        el.children('div.panel.panel-default.se-panel').show();
        el.children('div.drag-view.text-center').hide();
        if (container[0].id === 'unscheduled-side-events') {
          siblings = source.find('div.se-dragable-wrapper.grabbible.ng-scope');
          if (source[0].id !== 'unscheduled-side-events' || el.width() < 200) {
            el.height(164);
            el.width(254);
          }

        } else {
          el.children('div.panel.panel-default.se-panel').hide();
          el.children('div.drag-view.text-center').show();
          siblings = $element.find('span.se-in-grid.ng-binding.ng-scope');
          if (siblings.length > 0) {
            el.height(siblings.height());
            el.width(siblings.width());
          } else {
            el.height(16);
            el.width(50);
          }
        }//else
      });

      //============================================================
      //
      //============================================================
      $scope.$on('se-bag.drop', function(e, el, container, source) {

        var res;
        if (source.attr('id') === 'unscheduled-side-events')
          res = _.findWhere($scope.sideEvents, {
            '_id': el.attr('res-id')
          });
        else
          res = getBagScope(source)[0];

        //if not dropping on it self change time
        if (!(source.attr('id') === 'unscheduled-side-events' && container.attr('id') === 'unscheduled-side-events'))
          setTimes(res, container).then(
            function() {
              // if (container.attr('id') !== 'unscheduled-side-events') {
              //   var meeting = _.findWhere($scope.options.conferences, {
              //     _id: $scope.meeting
              //   });
              //   var tier = _.findWhere(meeting.seTiers, {
              //     'seconds': Number(container.attr('time'))
              //   });
              // } // if
              $rootScope.$broadcast('showInfo', 'Server successfully updated:  Side Event reservation registered');
            }

          ).catch(function(error) {

            $rootScope.$broadcast("showError", "There was an error updating the server, Please try your action again. ");
          });


        // $rootScope.$broadcast("showWarning","Test warning title", "Test warning message");
        // $rootScope.$broadcast("showSuccess","Test info Title", "Test info message");
        // $rootScope.$broadcast("showError","Test warning title", "Test warning message");
      });


      //============================================================
      //
      //============================================================
      $scope.$on('se-bag.over', function(e, el, target, source) {

        // keep original shadow on moving unscheduled side events within its own container
        if (target.attr('id') === 'unscheduled-side-events' && source.attr('id') === 'unscheduled-side-events') {
          el.children('div.panel.panel-default.se-panel').toggle();
          el.children('div.drag-view.text-center').toggle();
          return;
        }

        // cleans style changes on hovers, left overs form events not always triggering
        hoverCleanUp();
        //keeps track of overed elements for style cleans when done
        //more efficiant then doing all elements
        hoverArray.push(target);

        // hack to fix empty bag screen jump
        target.find('span.empty-bag').hide();
        // show green if a good drop
        target.addClass('label-success');

        // check if capacity is good else show red
        if (target.attr('id') !== 'unscheduled-side-events') {
          var room = _.findWhere($scope.options.rooms, {
                          '_id': target.attr('room-index')
                        });
          var elModel = _.findWhere($scope.seModels, {
                          '_id': el.attr('res-id')
                        });
          if (elModel.sideEvent.expNumPart > room.capacity)
            target.addClass('label-danger');
        }
      });

      //============================================================
      //
      //============================================================
      $scope.$on('se-bag.drop-model', function(e, el, target, source) {

        removeDropIndicators();
        target.removeClass('label-success');
        // show warning toast is drop not good
        if (target.attr('id') !== 'unscheduled-side-events') {
          var room = _.findWhere($scope.options.rooms, {
            '_id': target.attr('room-index')
          });
          var elModel = _.findWhere($scope.seModels, {
            '_id': el.attr('res-id')
          });
          if (elModel.sideEvent.expNumPart > room.capacity)
            $rootScope.$broadcast('showWarning', 'Warning: The expected number of participants (' + elModel.sideEvent.expNumPart + ') excceds room capacity (' + room.capacity + ').');
        }
      });

      //============================================================
      // - orgs
      // - pref
      // - require
      // - contact
      //============================================================
      $scope.searchSe = function(se) {

        if (!$scope.search || $scope.search == ' ') return true;
        var temp = JSON.stringify(se);
        return (temp.toLowerCase().indexOf($scope.search.toLowerCase()) >= 0);
      };
      //============================================================
      //
      //============================================================
      function initPreferences() {
        $scope.options.preferences=[];
        _.each($scope.days,function(day){
          _.each(day.tiers,function(tier){
              $scope.options.preferences.push({'timeValue':tier.title,'dateValue':moment.utc(day.date).format('YYYY/MM/DD'),'title':moment.utc(day.date).format('YYYY-MM-DD')+' '+tier.title,'value':moment(day.date).add(tier.seconds,'seconds').format()});
          });
        });
      }//initPreferences()

      //============================================================
      // - orgs
      // - pref
      // - require
      // - contact
      //============================================================
      $scope.searchOrgFilter = function(se) {
            if (!$scope.searchOrg || $scope.searchOrg == ' ') return true;
            var temp = JSON.stringify(se.sideEvent.orgs);

            return (temp.toLowerCase().indexOf($scope.searchOrg.toLowerCase()) >= 0);
      };
      //============================================================
      // - orgs
      // - pref
      // - require
      // - contact
      //============================================================
      $scope.searchReqFilter = function(se) {
            if (!$scope.searchReq || $scope.searchReq== ' ') return true;
            var temp = JSON.stringify(se.sideEvent.requirements);
//console.log(se.sideEvent);
            if(temp)
            return (temp.toLowerCase().indexOf($scope.searchReq.toLowerCase()) >= 0);
            else
              false;

      };
      //============================================================
      // - orgs
      // - pref
      // - require
      // - contact
      //============================================================
      $scope.searchPrefFilter = function(se) {
            if (!$scope.preferenceSearch || $scope.preferenceSearch == ' ') return true;
            $scope.prefObj = _.findWhere($scope.options.preferences,{'value':$scope.preferenceSearch});

            var match = false;
            _.each(se.sideEvent.prefDate,function(p,key){
                  if(p===$scope.prefObj.dateValue  && se.sideEvent.prefDateTime[key].toLowerCase()===$scope.prefObj.timeValue.toLowerCase())
                    match =  true;
            });

            return match;
      };
      //============================================================
      // - orgs
      // - pref
      // - require
      // - contact
      //============================================================
      $scope.clearFilters= function() {
            $scope.preferenceSearch='';
            $scope.searchReq='';
            $scope.searchOrg='';


      };
      //============================================================
      //
      //============================================================
      $document.ready(function() {


        $.material.init();
        $.material.input();
        $.material.ripples();


        $element.find('#end-filter').bootstrapMaterialDatePicker({
          weekStart: 0,
          time: false
        });
        $element.find('#start-filter').bootstrapMaterialDatePicker({
          weekStart: 0,
          time: false
        });
      });
    }
  ]);
  app.filter('ucf', function()
  {
      return function(word)
      {
          return word.substring(0,1).toUpperCase() + word.slice(1);
      };
  });
});