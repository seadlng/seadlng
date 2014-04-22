'use strict'

angular.module('seadlngApp')
  .controller 'NavbarCtrl', ($scope, $location, Auth) ->
    $scope.menu = [
      title: 'Home'
      link: '/'
    , 
      title: 'Ideas'
      dropdown: [
        title: 'New Idea'
        link: '/idea/new'
      ,
        title: 'Browse Ideas'
        link: '/ideas'
      ]
    ]
    $scope.ideaMenu = [
    ]
    $scope.redirect = if $location.search().r then "?r=#{$location.search().r}" else ""
    current_location = $location.path()
    if current_location != '/signup' and current_location != '/' and current_location != '/login'
      $scope.redirect = "?r=#{current_location}"
    $scope.isCollapsed = true
    $scope.logout = ->
      Auth.logout().then ->
        $location.path "/login"
    
    $scope.isActive = (route) ->
      route is current_location