'use strict';

/**
 * @ngdoc overview
 * @name projectApp
 * @description
 * # projectApp
 *
 * Main module of the application.
 */
angular
  .module('projectApp', [
    'ngAnimate',
    'ngCookies',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch',
    'ngMaterial'
  ])
  .factory('$deviceMotion', ['$q', function($q) {

    return {
      getCurrentAcceleration: function () {
        var q = $q.defer();

        navigator.accelerometer.getCurrentAcceleration(function (result) {
          q.resolve(result);
        }, function (err) {
          q.reject(err);
        });

        return q.promise;
      },

      watchAcceleration: function (options) {
        var q = $q.defer();

        var watchID = navigator.accelerometer.watchAcceleration(function (result) {
          q.notify(result);
        }, function (err) {
          q.reject(err);
        }, options);

        q.promise.cancel = function () {
          navigator.accelerometer.clearWatch(watchID);
        };

        q.promise.clearWatch = function (id) {
          navigator.accelerometer.clearWatch(id || watchID);
        };
        q.promise.watchID = watchID;

        return q.promise;
      },

      clearWatch: function (watchID) {
        return navigator.accelerometer.clearWatch(watchID);
      }
    };
  }])
  //Fetch trending tv shows from trakt
  .factory('TrendingShows', function($resource) {
    return $resource(
      'https://api-v2launch.trakt.tv/shows/trending',
      {},
      {
        query: {
          method:'GET',
          isArray:true,
          params: {
            'extended':'images',
            'limit': 20
          },
          headers: {
            'Content-type':'application/json',
            'trakt-api-version':'2',
            'trakt-api-key':'0c0a20790918c78c3a72c05da18de725509d9c4a428ad7dc0c4a523b7e33815c'
          }
        }
      }
    );
  })
  //Fetch previously watched show for a user from trakt.tv
  .factory('WatchedShows', function($resource) {
    return $resource(
      'https://api-v2launch.trakt.tv/users/:user/watched/shows',
      {user:'@user'},
      {
        query: {
          method:'GET',
          isArray:true,
          params: {
            'extended':'full'
          },
          headers: {
            'Content-type':'application/json',
            'trakt-api-version':'2',
            'trakt-api-key':'0c0a20790918c78c3a72c05da18de725509d9c4a428ad7dc0c4a523b7e33815c'
          }
        }
      }
    );
  })
  //Fetch details about a season for a tv shows.
  //These details contain a list of episodes
  .factory('SeasonDetails', function($resource) {
    return $resource(
      'https://api-v2launch.trakt.tv/shows/:id/seasons',
      {id:'@id'},
      {
        query: {
          method:'GET',
          isArray:true,
          params: {
            'extended':'full,images'
          },
          headers: {
            'Content-type':'application/json',
            'trakt-api-version':'2',
            'trakt-api-key':'0c0a20790918c78c3a72c05da18de725509d9c4a428ad7dc0c4a523b7e33815c'
          }
        }
      }
    );
  })
  //Fetch all season images
  .factory('SeasonImages', function($resource) {
    return $resource(
      'https://api-v2launch.trakt.tv/shows/:id/seasons',
      {id:'@id'},
      {
        query: {
          method:'GET',
          isArray:true,
          params: {
            'extended':'images'
          },
          headers: {
            'Content-type':'application/json',
            'trakt-api-version':'2',
            'trakt-api-key':'0c0a20790918c78c3a72c05da18de725509d9c4a428ad7dc0c4a523b7e33815c'
          }
        }
      }
    );
  })
  //Fetch details like a description and a image of a episode
  .factory('EpisodeDetails', function($resource) {
    return $resource(
      'https://api-v2launch.trakt.tv/shows/:id/seasons/:season/episodes/:episode',
      {
        id:'@id',
        season:'@season',
        episode:'@episode'
      },
      {
        query: {
          method:'GET',
          isArray:false,
          params: {
            'extended':'full,images'
          },
          headers: {
            'Content-type':'application/json',
            'trakt-api-version':'2',
            'trakt-api-key':'0c0a20790918c78c3a72c05da18de725509d9c4a428ad7dc0c4a523b7e33815c'
          }
        }
      }
    );
  })
  //Fetch details about a tv shows
  //These details contain a description of the plot and images
  .factory('ShowDetails', function($resource) {
    return $resource(
      'https://api-v2launch.trakt.tv/shows/:id',
      {id:'@id'},
      {
        query: {
          method:'GET',
          isArray:false,
          params: {
            'extended':'full,images'
          },
          headers: {
            'Content-type':'application/json',
            'trakt-api-version':'2',
            'trakt-api-key':'0c0a20790918c78c3a72c05da18de725509d9c4a428ad7dc0c4a523b7e33815c'
          }
        }
      }
    );
  })
  //A service which can save possible other episodes if the user
  //is unhappy with the current choice
  .factory('ProvideNextService', function() {
    var possibleOtherEpisodes = {};
    function set(data) {
      possibleOtherEpisodes = data;
    }
    function get() {
      return possibleOtherEpisodes;
    }

    return {
      set: set,
      get: get
    }
  })
  //Configure the routes
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/start.html',
        controller: 'StartCtrl'
      })
      //Display detail information about a tv show.
      //If the optional parameters season or episodes (int) are set,
      //information about a episode is shown.
      //If the optional parameter enableNext (bool) is set, then
      //a display next arrow is shown and the view can request another
      //show from a global service
      .when('/detail/:showId/:season?/:episode?/:enableNext?', {
        templateUrl: 'views/detail.html',
        controller: 'DetailCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  });
