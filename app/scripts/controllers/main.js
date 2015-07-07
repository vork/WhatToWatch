'use strict';

/**
 * @ngdoc function
 * @name projectApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the projectApp
 */
angular.module('projectApp')
  .controller('MainCtrl', function ($scope, TrendingShows) {
    console.log('controller call');
    $scope.shows = [];
    console.log($scope.shows);
    TrendingShows.query().$promise.then(
      function( trending ) {
        $scope.isLoading = false;

        var maxWatchers = 0;
        //Find the maximum number of watchers
        var i, len;
        for(i = 0, len = trending.length; i < len; i++) {
          if(maxWatchers < trending[i].watchers) {
            maxWatchers = trending[i].watchers;
          }
        }
        console.log('maxWatchers: ' + maxWatchers);
        var toRet = [];
        console.log('num of shows: ' + trending.length);
        //Create a return type with the show poster and based on the watchers a col and row size
        for(i = 0, len = trending.length; i < len; i++) {
          var show = trending[i];
          console.log(show);
          toRet.push({
            image: 'url(' + show.show.images.poster.medium + ')',
            colspan: Math.ceil(show.watchers / maxWatchers * 2),
            rowspan: Math.ceil(show.watchers / maxWatchers * 3)
          });
        }
        console.log(toRet);
        $scope.shows = toRet;
      },
      function( error ) {
        alert("Something went wrong");
      }
    );
    /*$scope.shows = (function() {
      var trending = TrendingShows.query();
      var maxWatchers = 0;
      //Find the maximum number of watchers
      var i, len;
      for(i = 0, len = trending.length; i < len; i++) {
        show = trending[i];
        if(maxWatchers < show.watchers) {
          maxWatchers = show.watchers;
        }
      }
      console.log('maxWatchers: ' + maxWatchers);
      var toRet = [];
      console.log('num of shows: ' + trending.length);
      //Create a return type with the show poster and based on the watchers a col and row size
      for(i = 0, len = trending.length; i < len; i++) {
        show = trending[i];
        console.log(show);
        toRet.push({
          image: 'url(' + show.show.images.poster.medium + ')',
          colspan: show.watchers / maxWatchers * 2,
          rowspan : show.watchers / maxWatchers * 3
        });
      }
      return toRet;
    })();*/
  })
  .config( function($mdThemingProvider) {
    $mdThemingProvider.theme('docs-dark', 'default')
      .backgroundPalette('indigo')
      .primaryPalette('pink')
      .accentPalette('indigo');
  });

