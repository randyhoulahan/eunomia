define(['app', 'lodash', 'text!./time-unit-row-header.html','moment','css!./time-unit-row-header.css'
], function(app, _, template, moment) {

  app.directive("timeUnitRowHeader", ['$timeout',
    function($timeout) {
      return {
        restrict: 'E',
        template: template,
        replace: true,
        transclude: false,
        scope: {
          'doc': '='
        },
        controller: function($scope, $element) {

            $scope.oneLine = false;
            $scope.twoLine = false;
            $scope.threeLine = false;
            init();

            //============================================================
            //
            //============================================================
            function init() {


            } //triggerChanges

          } //link
      }; //return
    }
  ]);
});