angular.module('pescadorescolombia.controllers', ['ngResource'])

.controller('AppCtrl', function($scope, $ionicModal, $timeout, OpenFB, $state) {
  
  /* Login Modal Example */
  /*

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
  
  /* End Login Modal Example */
  
  $scope.logout = function () {
    OpenFB.logout();
    $state.go('app.login');
  };

  $scope.revokePermissions = function () {
      OpenFB.revokePermissions().then(
          function () {
              $state.go('app.login');
          },
          function () {
              alert('Revoke permissions failed');
          });
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

.controller('FeedCtrl', function($scope, $http, $ionicLoading, $stateParams, Feed) {

  $scope.show = function() {
    $ionicLoading.show({
      template: 'Loading...'
    });
  };
  $scope.hide = function(){
    $ionicLoading.hide();
  };

  //TODO: Tener una unica funcion para agregar likes
  $scope.addOrRemoveLike = function(feedId, likedByUser){

    var action ="addlike";
    if (likedByUser){
      action = "removeLike"
    }

    var likeData = { 
      'from': {
                'name': $scope.user.name,
                'facebookid': $scope.user.id
              }
    }

    $http.put('http://pescadorescolombia-api.herokuapp.com/feed/'+feedId+'/'+action+'/',likeData)
      .success(function(data, status) {
        loadFeed();
      })
      .error(function(data, status) {
          alert("fail.addOrRemoveLike");
      }); 
  };

  
  function loadFeed() {
    $scope.feeds = Feed.query({userid:$scope.user.id});
  }

  $scope.doRefresh = loadFeed;

  loadFeed();
})

.controller('FeedDetailCtrl', function($scope, $stateParams, $http, $window, Feed) {
  $scope.feed = Feed.get({id:$stateParams.feedId,userid:$scope.user.id});
  $scope.newComment = {};

  //TODO: Verificar tamaño del comentario -> No enviar comentarios vacios
  //TODO: cuando se presiona el iocono commnet debe poner en foco el input text para agregar comentarios
  $scope.addComment = function(){
    feedId = $scope.feed._id;
    var commentData = { 
      'from': {
                'name': $scope.user.name,
                "facebookid": $scope.user.id
              },
      'message': $scope.newComment.message,
      'created_time' : new Date()
    }
    $http.put('http://pescadorescolombia-api.herokuapp.com/feed/'+feedId+'/addComment/',commentData)
      .success(function(data, status) {
        $scope.feed = Feed.get({id:$stateParams.feedId,userid:$scope.user.id});
        $scope.newComment = {};
      })
      .error(function(data, status) {
          alert("fail.addComment");
      });
  };

  //TODO: Tener una unica funcion para agregar likes
  $scope.addOrRemoveLike = function(feedId){

    var action ="addlike";
    if ($scope.feed.likedByUser){
      action = "removeLike"
    }

    var likeData = { 
      'from': {
                'name': $scope.user.name,
                'facebookid': $scope.user.id
              }
    }

    $http.put('http://pescadorescolombia-api.herokuapp.com/feed/'+feedId+'/'+action+'/',likeData)
      .success(function(data, status) {
        $scope.feed = Feed.get({id:$stateParams.feedId,userid:$scope.user.id});
      })
      .error(function(data, status) {
          alert("fail.addOrRemoveLike");
      }); 
  };

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


