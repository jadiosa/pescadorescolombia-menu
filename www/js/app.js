// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('pescadorescolombia', ['ionic', 'pescadorescolombia.controllers','pescadorescolombia.services','ngCordova'])

.run(function ($ionicPlatform, $cordovaSplashscreen) {
  
  setTimeout(function() {
    $cordovaSplashscreen.hide()
  }, 2000)

  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }

  });

})

.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider

    .state('app', {
      url: "/app",
      abstract: true,
      templateUrl: "templates/menu.html",
      controller: 'LoginCtrl'
    })
    .state('app.login', {
        url: "/login",
        views: {
            'menuContent': {
                templateUrl: "templates/login.html",
                controller: "LoginCtrl"
            }
        }
    })
    .state('app.feed', {
      url: "/feed",
      views: {
        'menuContent' :{
          templateUrl: "templates/feed.html",
          controller: 'FeedCtrl'
        }
      }
    })
    .state('app.feed-detail', {
      url: '/feed/:feedId',
      views: {
        'menuContent': {
          templateUrl: 'templates/feed-detail.html',
          controller: 'FeedDetailCtrl'
        }
      }
    })
    .state('app.catches', {
      url: "/catches",
      views: {
        'menuContent' :{
          templateUrl: "templates/catches.html",
          controller: 'CatchesCtrl'
        }
      }
    })
    .state('app.catch-detail', {
      url: '/catch/:catchId',
      views: {
        'menuContent': {
          templateUrl: 'templates/catch-detail.html',
          controller: 'CatchDetailCtrl'
        }
      }
    })
    .state('app.search', {
      url: "/search",
      views: {
        'menuContent' :{
          templateUrl: "templates/search.html"
        }
      }
    })
    .state('app.playlists', {
      url: "/playlists",
      views: {
        'menuContent' :{
          templateUrl: "templates/playlists.html",
          controller: 'PlaylistsCtrl'
        }
      }
    })
    .state('app.single', {
      url: "/playlists/:playlistId",
      views: {
        'menuContent' :{
          templateUrl: "templates/playlist.html",
          controller: 'PlaylistCtrl'
        }
      }
    })

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/login');
});

