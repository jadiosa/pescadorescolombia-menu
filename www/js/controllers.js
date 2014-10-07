angular.module('pescadorescolombia.controllers', ['ngResource'])

.controller('AppCtrl', function($scope, $rootScope, OpenFB, $state) {
  
  $scope.logout = function () {
    OpenFB.logout();
    $state.go('app.login');
  };

  /*
  $scope.revokePermissions = function () {
      OpenFB.revokePermissions().then(
          function () {
              $state.go('app.login');
          },
          function () {
              alert('Revoke permissions failed');
          });
  };
  */

})

.controller('LoginCtrl', function ($scope, $location, OpenFB) {
    $scope.facebookLogin = function () {

      OpenFB.login('email,read_stream,publish_stream').then(
          function () {
              $location.path('/app/feed');
          },
          function () {
              //TODO;
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

.controller('FeedCtrl', function($scope, $rootScope, $http, $ionicModal, $timeout, $ionicLoading, $stateParams, Feed, OpenFB) {

  $scope.doRefresh = loadFeed;

  function facebookInfo(){
    OpenFB.get('/me').success(function (user) {
      $scope.user = user;
      $rootScope.user = user;
      loadFeed();
    }).error(function () {
      //TODO: 
    }); 
  }

  $scope.getFacebookInfo = facebookInfo;
  facebookInfo();

  function loadFeed() {
    $scope.feeds = Feed.query({userid:$scope.user.id});
    $scope.$broadcast('scroll.refreshComplete');
  }
  
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

  /* 
    Feed Modal
  */

  // Form data for the Feed modal
  $scope.feedData = {};

  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/feed-new.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  // Triggered in the login modal to close it
  $scope.closeNewFeed = function() {
    $scope.modal.hide();
  };

  // Open the new Feed modal
  $scope.newFeed = function() {
    $scope.modal.show();
  };

  // Perform the login action when the user submits the login form
  $scope.addFeed = function() {
    var feedData = { 
      'from': {
                'name': $scope.user.name,
                "facebookid": $scope.user.id
              },
      'message': $scope.feedData.message,
      'lastModified' : new Date(),
      'created_time' : new Date()
    }
    $http.post('http://pescadorescolombia-api.herokuapp.com/feed/',feedData)
      .success(function(data, status) {
        loadFeed();
        $scope.modal.hide();
        $scope.feedData = {};
      })
      .error(function(data, status) {
          alert("fail.newFeed");
      });
  };
  
  /* End Feed Modal */

  
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


