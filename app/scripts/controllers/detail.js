'use strict';

/**
 * @ngdoc function
 * @name projectApp.controller:DetailCtrl
 * @description
 * # DetailCtrl
 * Controller of the projectApp
 */
angular.module('projectApp')
  .controller('DetailCtrl', function ($scope, $deviceMotion, $routeParams, $location, ShowDetails, SeasonImages, EpisodeDetails) {
    var _this = this;

    //get the parameter for the current detail screen
    _this.showId = $routeParams.showId;
    _this.season = $routeParams.season;
    _this.episode = $routeParams.episode;
    _this.next = $routeParams.enableNext;

    if(typeof _this.episode === 'undefined') {
      _this.showEpisodeInfo = false;
    } else {
      _this.showEpisodeInfo = true;
    }
    ShowDetails.query({
      id:_this.showId
    }).$promise.then(
      function(show) {
        console.log('processing rest request');
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
        //Only set the rating for the tv show, if we're displaying a tv show
        if(!_this.showEpisodeInfo) {
          for(var i = 1; i <= _this.tvshow.rating; i++) {
            var elementId = '#star' + i;
            var star = angular.element(document.querySelector(elementId));
            star.removeClass('ion-android-star-outline');
            star.addClass('ion-android-star');
          }
        }
      },
      function(error) {
        alert('Something went wrong');
      }
    );

    if(typeof _this.next === 'undefined') {
      _this.enableNext = false;
    } else {
      _this.enableNext = true;
    }

    $scope.showNext = function() {
      var toSplit = atob($routeParams.enableNext);
      var ids = toSplit.split(';;;');
      var potentialNext = [];
      for(var s = 0; s < ids.length; s++) {
        var splitted = ids[s].split(';_');
        potentialNext.push({
          showId: splitted[0],
          season: splitted[1],
          episode: splitted[2]
        });
      }
      var toWrite = potentialNext.slice(1,potentialNext.length); //remove the first index and write it

      var toRet = '';
      if(toWrite.length > 0) {  
        for(s = 0; s < toWrite.length; s++) {
          if(s !== 0) {
            toRet = toRet + ';;;';
          }
          toRet = toRet + toWrite[s].showId.toString() + ';_' + toWrite[s].season + ';_' + toWrite[s].episode;
        }
      }
      toRet = btoa(toRet);
      $location.path('/detail/' + potentialNext[0].showId +
                      '/' + potentialNext[0].season +
                      '/' + potentialNext[0].episode +
                      '/' + toRet);
    };
    $scope.go = function(showId) {
      $location.path('/detail/' + showId);
    };

    if(_this.showEpisodeInfo) {
      EpisodeDetails.query({
        id:_this.showId,
        season: _this.season,
        episode: _this.episode
      }).$promise.then(
        function(episode) {
          console.log('processing episode rest request');
          console.log(episode);

          _this.ep = {
            title: episode.title,
            description: episode.overview,
            rating: episode.rating,
            image: episode.images.screenshot.full
          };

          for(var i = 1; i <= episode.rating; i++) {
            var elementId = '#star' + i;
            var star = angular.element(document.querySelector(elementId));
            star.removeClass('ion-android-star-outline');
            star.addClass('ion-android-star');
          }
        }
      );
    } else {
      _this.seasons = [];
      SeasonImages.query({
        id:_this.showId
      }).$promise.then(
        function(seasons) {
          console.log('processing season rest request');
          console.log(seasons);

          for(var i = 0; i < seasons.length; i++) {
            var season = seasons[i];
            var title;
            if(season.number === 0) {
              title = 'Specials';
            } else {
              title = 'Season ' + season.number;
            }
            _this.seasons.push({
              season: title,
              image: season.images.poster.medium
            });
          }
        },
        function(error) {
          alert('Something went wrong while fetching the seasons');
        }
      );
    }

    var watchID;
    var prevAccel = { x: null, y: null, z: null, timestamp: 0};

    this.watchAcceleration = function() {
        var options = { frequency: 1000 };

        _this.watch = $deviceMotion.watchAcceleration(options);

        _this.watch.then(
          null,
          function(err) {
            $scope.msg = err.message;
            alert(err.message);
          },
          function(motion) {
            var accelChange = {};
            console.log(motion);
            if(_this.enableNext) {
              if(prevAccel.x !== null) {
                accelChange.x = Math.abs(prevAccel.x - motion.x);
                accelChange.y = Math.abs(prevAccel.y - motion.y);
                accelChange.z = Math.abs(prevAccel.z - motion.z);
              }

              if(accelChange.x + accelChange.y + accelChange.z > 25) {
                if(motion.timestamp - prevAccel.timestamp > 1000) {
                  $scope.showNext();
                  prevAccel = {
                    x: null,
                    y: null,
                    z: null,
                    timestamp: motion.timestamp
                  };
                } else {
                  console.log('double trigger prevention');
                }
              } else {
                prevAccel = {
                  x: motion.x,
                  y: motion.y,
                  z: motion.z,
                  timestamp: prevAccel.timestamp
                };
              }
            }
        }
      );
    };

    document.addEventListener('deviceready', 
      this.watchAcceleration, true);
  })
  .directive('scroll', function($window) {
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
        if(r<0) {
          return 0;
        }
        if(r>1) {
          return 1;
        }
        return Number(r.toString().match(/^\d+(?:\.\d{0,2})?/));
      }

      styleInit();
      handleStyle(baseDimensions);

      /* scroll event listener */
      angular.element($window).bind('scroll', function() {
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
