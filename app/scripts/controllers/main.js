'use strict';

/**
 * @ngdoc function
 * @name projectApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the projectApp
 */
angular.module('projectApp')
  .controller('MainCtrl', function ($scope) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
  })
  .config( function($mdThemingProvider) {
    $mdThemingProvider.theme('docs-dark', 'default')
      .backgroundPalette('indigo')
      .primaryPalette('pink');
  });
