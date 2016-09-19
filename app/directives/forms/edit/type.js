define(['app', 'lodash',
  'text!./type.html',
  '../../color-picker'
], function(app, _, template) {

  app.directive("type", ['$timeout','mongoStorage',
    function($timeout,mongoStorage) {
      return {
        restrict: 'E',
        template: template,
        replace: true,
        transclude: false,
        scope: {'doc':'=?',
        'schema':'=?',
        'closeThisDialog':'&'},
        link: function($scope, $element) {

            init();

            //============================================================
            //
            //============================================================
            function triggerChanges (){

                 $element.find('input').each(function(){
                      $(this).trigger('change');
                      if($(this).attr('id')!=='test')
                          isEmptyModel($(this));
                 });//jquery each
                 $element.find('select').each(function(){
                      $timeout(isEmptyModel($(this)));
                 });//jquery each
            }//triggerChanges

            //============================================================
            // adds isEmpty css if ngModel empty
            //============================================================
            function isEmptyModel (el){
              var ngModel,ngModelSub,$formGroup;
              ngModel= el.attr('ng-model');
              if(ngModel && ngModel!=='binding'){
                ngModelSub=ngModel.substring(ngModel.indexOf('.')+1,ngModel.length);
                   if(!$scope.doc[ngModelSub]){
                     $formGroup = el.closest(".form-group");
                      $formGroup.addClass("is-empty");
                    }//
              }//if(ngModel)
            }/// isEmptyModel

          //============================================================
          //
          //============================================================
          function initTypes() {
            var q={
              parent:{$exists:false},
              schema:$scope.doc.schema || $scope.schema,
              'meta.status':{'$nin':['deleted','archived']}
            };

            return mongoStorage.loadDocs('types',q,0,10000,false ).then(function(result) {
              $scope.options.types = result.data;
              _.each($scope.types,function(type){
                  type.showChildren=true;
                            _.each(type.children,function(child){
                                child.showChildren=true;
                            });
              });
            });
            // .catch(function onerror(response) {
            //   $scope.onError(response);
            // });
          }

          //============================================================
          //
          //============================================================
          function init() {
              $scope.options={};
              initTypes();
              triggerChanges();
          }//init

        } //link
      }; //return
    }
  ]);
});