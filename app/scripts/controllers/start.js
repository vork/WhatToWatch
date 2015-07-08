'use strict';

/**
 * @ngdoc function
 * @name projectApp.controller:StartCtrl
 * @description
 * # StartCtrl
 * Controller of the projectApp
 */
angular.module('projectApp')
  .controller('StartCtrl', function ($scope, TrendingShows) {
    var _this = this;
    _this.shows = [];
    TrendingShows.query().$promise.then(
      function( trending ) {
        console.log("processing rest request");
        $scope.isLoading = false;

        var maxWatchers = 0;
        //Find the maximum number of watchers
        var i, len;
        for(i = 0, len = trending.length; i < len; i++) {
          if(maxWatchers < trending[i].watchers) {
            maxWatchers = trending[i].watchers;
          }
        }
        //Create a return type with the show poster and based on the watchers a col and row size
        for(i = 0, len = trending.length; i < len; i++) {
          var show = trending[i];
          _this.shows.push({
            image: show.show.images.poster.medium,
            name: show.show.title,
            colspan: Math.ceil(show.watchers / maxWatchers * 1.7),
            rowspan: Math.ceil(show.watchers / maxWatchers * 1.5)
          });
        }
        console.log(_this.shows);
      },
      function( error ) {
        alert("Something went wrong");
      }
    );
  })
  .config( function($mdThemingProvider) {
    $mdThemingProvider.theme('docs-dark', 'default')
      .backgroundPalette('indigo')
      .primaryPalette('pink')
      .accentPalette('indigo');
  });

