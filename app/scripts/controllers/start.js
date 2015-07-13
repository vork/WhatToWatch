'use strict';

/**
 * @ngdoc function
 * @name projectApp.controller:StartCtrl
 * @description
 * # StartCtrl
 * Controller of the projectApp
 */
angular.module('projectApp')
  .controller('StartCtrl', function ($scope, $location, $q, TrendingShows, WatchedShows, SeasonDetails, ProvideNextService) {
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

    $scope.findEpisodes = function(account) {
      //Watched progress endpoint requires oauth.
      //Logging in wasn't intended so this is a "hack" around it
      WatchedShows.query({
        user: account
      }).$promise.then(
        function(watched) {
          var len = watched.length;
          var potentialEpisodes = [];
          if(len > 15) { //limit to 15 tv shows
            len = 15;
          }

          var fetchRequest = [];
          //Add the requests for the first 15 shows
          for(var i = 0; i < len; i++) {
            fetchRequest.push(fetchShows(watched[i].show.ids.trakt));
          }
          $q.all(fetchRequest).then(
            function(data) {
              for(var i = 0; i < data.length; i++) {
                var curShow = watched[i].show;
                var watchedSeasons = watched[i].seasons;

                var airedSeasons = data[i];

                var nextEpisode = {
                  season: -1,
                  episode: -1
                };

                var countAiredSeasons = airedSeasons.length;
                var countWatchedSeasons = watchedSeasons.length;
                for(var j = 0; j < countAiredSeasons; j++) { //Go through all aired seasons
                  if(airedSeasons[j].number > 0) { //0 is reserved for specials. Skip specials.
                    var countAiredEpisodes = airedSeasons[j].episode_count; //Get the count of aired episodes for this season

                    for(var k = 0; k < countWatchedSeasons; k++) { //go through all watched seasons...
                      if(watchedSeasons[k].number == airedSeasons[j].number) { //... and find the current selected
                        var countWatchedEpisodes = watchedSeasons[k].episodes.length;
                        if(countWatchedEpisodes !== countAiredEpisodes) { //If the user hasn't watched everything...
                          nextEpisode = { //... set the next episode for now
                            season: airedSeasons[j].number,
                            episode: countWatchedEpisodes + 1
                          };
                        }
                      }
                    }
                  }
                }
                if(nextEpisode.season !== -1 && nextEpisode.episode !== -1) { //A next episode was found in a previously started season
                  potentialEpisodes.push({
                    showId: curShow.ids.trakt,
                    season: nextEpisode.season,
                    episode: nextEpisode.episode
                  });
                } else { //The user has finished the last watched season
                  var watchedContainsSpecial, airedContainsSpecial;
                  watchedContainsSpecial = watchedSeasons[0].number == '0';
                  airedContainsSpecial = airedSeasons[0].number == '0';

                  var watchedCount = watchedSeasons.length;
                  var airedCount = airedSeasons.length;

                  if(watchedContainsSpecial) {
                    watchedCount--;
                  }
                  if(airedContainsSpecial) {
                    airedCount--;
                  }

                  if(watchedCount < airedCount) { //check if there is a season left
                    var lastWatchedSeason = watchedSeasons[watchedSeasons.length - 1].number;
                    var lastAiredSeason = airedSeasons[airedSeasons.length - 1].number;
                    if(lastWatchedSeason < lastAiredSeason) {
                      potentialEpisodes.push({
                        showId: curShow.ids.trakt,
                        season: lastWatchedSeason + 1,
                        episode: 1
                      });
                    }
                  }
                }
              }
              console.log(potentialEpisodes);
              if(potentialEpisodes.length == 0) {
                alert("No potential episode to watch found"); //TODO handle this more gracefully
              } else {
                var enableNext = 0;
                if(potentialEpisodes.length > 1) {
                  enableNext = 1;
                }
                var toWrite = potentialEpisodes.slice(1, potentialEpisodes.length); //remove the first index and write it
                ProvideNextService.set(toWrite);
                $location.path('/detail/' + potentialEpisodes[0].showId +
                                    '/' + potentialEpisodes[0].season +
                                    '/' + potentialEpisodes[0].episode +
                                    '/' + enableNext);

              }
            }
          )
        }
      );
    }

    function fetchShows(showID) {
      var d = $q.defer();
      var result = SeasonDetails.query({
              id: showID
            },
            function() {
              d.resolve(result);
            }
      );
      return d.promise;
    }
  })
  .config( function($mdThemingProvider) {
    $mdThemingProvider.theme('docs-dark', 'default')
      .backgroundPalette('indigo')
      .primaryPalette('pink')
      .accentPalette('indigo');
  });

