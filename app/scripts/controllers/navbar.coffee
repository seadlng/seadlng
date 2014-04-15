'use strict'

angular.module('seadlngApp')
  .controller 'NavbarCtrl', ($scope, $location, Auth) ->
    $scope.menu = [
      title: 'Home'
      link: '/'
    , 
      title: 'Settings'
      link: '/settings'
    ]
    $scope.redirect = "?r=#{$location.search().r}"
    current_location = $location.path()
    if current_location != '/signup' and current_location != '/' and current_location != '/login'
      $scope.redirect = "?r=#{current_location}"
    $scope.logout = ->
      Auth.logout().then ->
        $location.path "/login"
    
    $scope.isActive = (route) ->
      route is current_location