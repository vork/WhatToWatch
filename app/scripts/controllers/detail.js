'use strict';

/**
 * @ngdoc function
 * @name projectApp.controller:DetailCtrl
 * @description
 * # DetailCtrl
 * Controller of the projectApp
 */
angular.module('projectApp')
  .controller('DetailCtrl', function ($scope, $routeParams, ShowDetails) {
    var _this = this;

    //get the parameter for the current detail screen
    _this.showId = $routeParams.showId;
    _this.season = $routeParams.season;
    _this.episode = $routeParams.episode;
    _this.enableNext = $routeParams.enableNext;

    //TODO: check if season, episode and enablenext is checked

    ShowDetails.query({
      id:_this.showId
    }).$promise.then(
      function(show) {
        console.log("processing rest request");
        console.log(show);

        _this.tvshow = ({
          image: show.images.fanart.full,
          name: show.title,
          description: show.overview,
          rating: show.rating,
          network: show.network,
          genres: show.genres,
          episodes: show.aired_episodes,
          runtime: show.runtime,
          year: show.year,
          poster: show.images.poster.medium
        });
        for(var i = 1; i <= _this.tvshow.rating; i++) {
          var elementId = "#star" + i;
          var star = angular.element(document.querySelector(elementId));
          star.removeClass('ion-android-star-outline');
          star.addClass('ion-android-star');
        }
      },
      function(error) {
        alert("Something went wrong");
      }
    );
  })
  .directive("scroll", function($window) {
    return function(scope, element, attrs) {
      var header = document.querySelector('[md-page-header]');
      var baseDimensions = header.getBoundingClientRect();
      var title = angular.element(document.querySelector('[md-header-title]'));
      var picture = angular.element(document.querySelector('[md-header-picture]'));
      var legacyToolbarH = 64;
      var primaryColor = [63,81,181];
      var titleZoom = 1.5;

      function styleInit() {
        title.css('padding-left','16px');
        title.css('position','relative');
        title.css('transform-origin','24px');
      }

      function handleStyle(dim) {
        if((dim.bottom-baseDimensions.top) > legacyToolbarH) {
          title.css('top', ((dim.bottom-baseDimensions.top)-legacyToolbarH) + 'px');
          element.css('height',(dim.bottom-baseDimensions.top) + 'px');
          title.css('transform','scale('+((titleZoom-1)*ratio(dim)+1)+','+((titleZoom-1)*ratio(dim)+1)+ ')' );
        } else {
          title.css('top','0px');
          element.css('height', legacyToolbarH +'px');
          title.css('transform','scale(1,1)');
        }
        element.css('background-color','rgba('+primaryColor[0]+','+primaryColor[1]+','+primaryColor[2]+','+(1-ratio(dim))+')');
        picture.css('background-position','50% '+(ratio(dim)*50)+'%');
      }

      function ratio(dim) {
        var r = (dim.bottom-baseDimensions.top)/dim.height;
        if(r<0) return 0;
        if(r>1) return 1;
        return Number(r.toString().match(/^\d+(?:\.\d{0,2})?/));
      }

      styleInit();
      handleStyle(baseDimensions);

      /* scroll event listener */
      angular.element($window).bind("scroll", function() {
        var dimensions = header.getBoundingClientRect();
        handleStyle(dimensions);
        scope.$apply();
      });

      /* Resize event listener */
      angular.element($window).bind('resize',function () {
        baseDimensions = header.getBoundingClientRect();
        var dimensions = header.getBoundingClientRect();
        handleStyle(dimensions);
        scope.$apply();
      });
    }
  });
