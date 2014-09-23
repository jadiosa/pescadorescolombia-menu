angular.module('pescadorescolombia.controllers', ['ngResource'])

.controller('AppCtrl', function($scope, $ionicModal, $timeout, OpenFB, $state) {
  // Form data for the login modal
  $scope.loginData = {};

  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/login-pop.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  // Triggered in the login modal to close it
  $scope.closeLogin = function() {
    $scope.modal.hide();
  };

  // Open the login modal
  $scope.login = function() {
    $scope.modal.show();
  };

  // Perform the login action when the user submits the login form
  $scope.doLogin = function() {
    console.log('Doing login', $scope.loginData);

    // Simulate a login delay. Remove this and replace with your login
    // code if using a login system
    $timeout(function() {
      $scope.closeLogin();
    }, 1000);
  };

  $scope.logout = function () {
    OpenFB.logout();
    $state.go('app.login');
  };

  function facebookInfo(){
    OpenFB.get('/me').success(function (user) {
      $scope.user = user;
    }); 
  }

  $scope.getFacebookInfo = facebookInfo;
  facebookInfo();
})

.controller('LoginCtrl', function ($scope, $location, OpenFB) {
    $scope.facebookLogin = function () {

      OpenFB.login('email,read_stream,publish_stream').then(
          function () {
              $location.path('/app/feed');
          },
          function () {
              alert('OpenFB login failed');
          });
    };

})

.controller('PlaylistsCtrl', function($scope) {
  $scope.playlists = [
    { title: 'Reggae', id: 1 },
    { title: 'Chill', id: 2 },
    { title: 'Dubstep', id: 3 },
    { title: 'Indie', id: 4 },
    { title: 'Rap', id: 5 },
    { title: 'Cowbell', id: 6 }
  ];
})

.controller('FeedCtrl', function($scope, $resource, OpenFB, $ionicLoading, $stateParams) {
  
  $scope.show = function() {
      $scope.loading = $ionicLoading.show({
          content: 'Loading feed...'
      });
  };
  $scope.hide = function(){
      $scope.loading.hide();
  };

  function loadFeed() {
    $scope.show();
    var feeds = $resource('http://pescadorescolombia-api.herokuapp.com/feed');
    $scope.feeds = feeds.query();
    $scope.hide();
    $scope.$broadcast('scroll.refreshComplete');
  }

  $scope.doRefresh = loadFeed;

  loadFeed();
})

.controller('CatchesCtrl', function($scope, $resource) {
  var catches = $resource('http://pescadores-colombia-api.herokuapp.com/fishinglog/:user/');
  $scope.catches = catches.query({user: 'Jonathan'});
})

.controller('CatchDetailCtrl', function($scope, $stateParams, $resource) {
  var catchDetail = $resource('http://pescadores-colombia-api.herokuapp.com/fishinglog/:user/:title');
  $scope.catchDetail = catchDetail.get({user: 'Jonathan', title: $stateParams.catchId});
})

.controller('PlaylistCtrl', function($scope, $stateParams) {
});


