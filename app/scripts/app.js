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
  .factory('TrendingShows', function($resource) {
    return $resource(
      'https://api-v2launch.trakt.tv/shows/trending',
      {},
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
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .when('/about', {
        templateUrl: 'views/about.html',
        controller: 'AboutCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  });
