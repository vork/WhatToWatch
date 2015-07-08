'use strict';

/**
 * @ngdoc function
 * @name projectApp.controller:StartCtrl
 * @description
 * # StartCtrl
 * Controller of the projectApp
 */
angular.module('projectApp')
  .controller('StartCtrl', function ($scope, $location, TrendingShows) {
    var _this = this;
    _this.shows = [];

    function shuffle(o){
          for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
              return o;
    }

    TrendingShows.query().$promise.then(
      function( trending ) {
        console.log("processing rest request");
        $scope.isLoading = false;

        var maxWatchers = 0;
        var minWatchers = Number.MAX_VALUE; //Pick the first min val
        //Find the maximum number of watchers
        var i, len;
        for(i = 0, len = trending.length; i < len; i++) {
          if(maxWatchers < trending[i].watchers) {
            maxWatchers = trending[i].watchers;
          }
          if(minWatchers > trending[i].watchers) {
            minWatchers = trending[i].watchers;
          }
        }
        //Create a return type with the show poster and based on the watchers a col and row size
        for(i = 0, len = trending.length; i < len; i++) {
          var show = trending[i];
          _this.shows.push({
            image: show.show.images.poster.medium,
            name: show.show.title,
            showId: show.show.ids.trakt,
            colspan: Math.ceil((show.watchers - minWatchers) / (maxWatchers  - minWatchers)* 2.5),
            rowspan: Math.ceil((show.watchers - minWatchers) / (maxWatchers - minWatchers) * 5)
          });
        }

        shuffle(_this.shows);
        console.log(_this.shows);
      },
      function( error ) {
        alert("Something went wrong");
      }
    );

    $scope.go = function(showId) {
      $location.path('/detail/' + showId);
    };
  })
  .config( function($mdThemingProvider) {
    $mdThemingProvider.theme('docs-dark', 'default')
      .backgroundPalette('indigo')
      .primaryPalette('pink')
      .accentPalette('indigo');
  });

