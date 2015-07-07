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

/*
  this.shows = [];
    console.log("Filling the shows array");
    this.shows.push({
     image: 'https://walter.trakt.us/images/shows/000/001/390/posters/medium/e2e8d04f11.jpg',
     name: 'Game Of Thrones',
     colspan: 2,
     rowspan: 2
   });
   this.shows.push({
      image: 'https://walter.trakt.us/images/shows/000/060/360/posters/medium/522aa0d783.jpg',
      name: 'The Last Ship',
      colspan: 1,
      rowspan: 2
   });
   console.log(this.shows);*/

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

