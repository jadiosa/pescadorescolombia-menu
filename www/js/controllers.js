angular.module('pescadorescolombia.controllers', ['ngResource'])

.controller('AppCtrl', function($scope, $rootScope, OpenFB, $state) {

})

.controller('LoginCtrl', function ($scope, $state, $rootScope, $ionicLoading) {

  /**** Datos Quemados para Prueba */
  $scope.user = {}; 
  $scope.user.name = 'Jonathan Diosa' ;
  $scope.user.email = 'quemado@gmail.com' ;
  $scope.user.id = '10152857606228057' ;
  /**** Datos Quemados para Prueba */


  // Perform the login action when the user submits the login form
  $scope.doLogin = function() {
      facebookConnectPlugin.getAccessToken(function(result){
          sucessLogin();
      },function(){
          facebookConnectPlugin.login(["email"], function(response) {
              if (response.authResponse) {
                  facebookConnectPlugin.getAccessToken(function(result){
                      sucessLogin();
                  })
              } else {
                  facebookConnectPlugin.showDialog(["email"],function(response){
                  })
              }
          },function(response){
              $state.go('app.login')

          });
      })
  };

  function sucessLogin(){

    $ionicLoading.show({
            template: 'Cargando...'
    });

    $rootScope.user = {};  
    facebookConnectPlugin.api('/me', undefined, function (result) {
        $rootScope.$apply(function(){
            $ionicLoading.hide();
            $rootScope.user.name = result.first_name + " " + result.last_name ;
            $rootScope.user.email = result.email ;
            $rootScope.user.id = result.id ;
            $state.go('app.feed')
        })
    }, function (response) {
        alert('Error->' + JSON.stringify(response))

    });
  }
  
})

.controller('PlaylistsCtrl', function($scope,$ionicLoading) {
  
  $ionicLoading.show({
      template: 'Cargando...'
  });
  $scope.fbProfile = {}
  facebookConnectPlugin.api('/me', undefined, function (result) {
      $scope.$apply(function(){
          $ionicLoading.hide();
          $scope.fbProfile = result;
      })
  }, function (response) {
      alert('Error->' + JSON.stringify(response))

  });

  $scope.playlists = [
    { title: 'Reggae', id: 1 },
    { title: 'Chill', id: 2 },
    { title: 'Dubstep', id: 3 },
    { title: 'Indie', id: 4 },
    { title: 'Rap', id: 5 },
    { title: 'Cowbell', id: 6 }
  ];
})

.controller('FeedCtrl', function($scope , $ionicLoading, $http, $ionicModal, $timeout, $ionicLoading , Feed) {

  $scope.doRefresh = loadFeed;

  function loadFeed() {

    $ionicLoading.show({
            template: 'Cargando...'
    });

    Feed.query({userid:$scope.user.id}, function (data){
          $ionicLoading.hide();
          $scope.feeds = data;
          $scope.$broadcast('scroll.refreshComplete');
    });
  }

  loadFeed();

  $scope.addOrRemoveLike = function(feedId, likedByUser){

    $ionicLoading.show({
            template: 'Cargando...'
    });

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
        $ionicLoading.hide();
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

.controller('FeedDetailCtrl', function($scope, $stateParams, $ionicLoading, $http, $window, Feed) {
  
  $ionicLoading.show({
      template: 'Cargando...'
  });

  function loadDetailFeed() {
    Feed.get({id:$stateParams.feedId,userid:$scope.user.id}, function (data){
            $ionicLoading.hide();
            $scope.feed = data;
    });
  }
  loadDetailFeed();


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

    $ionicLoading.show({
      template: 'Cargando...'
    });

    $http.put('http://pescadorescolombia-api.herokuapp.com/feed/'+feedId+'/addComment/',commentData)
      .success(function(data, status) {
        loadDetailFeed();
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

    $ionicLoading.show({
      template: 'Cargando...'
    });

    $http.put('http://pescadorescolombia-api.herokuapp.com/feed/'+feedId+'/'+action+'/',likeData)
      .success(function(data, status) {
        loadDetailFeed();
      })
      .error(function(data, status) {
          alert("fail.addOrRemoveLike");
      }); 
  };

})

.controller('CatchesCtrl', function($scope, $ionicLoading, $resource, $http, $ionicModal, Camera) {

  function loadCatches() {
   $ionicLoading.show({
    template: 'Cargando...'
  });

  $http.get('http://pescadorescolombia-api.herokuapp.com/catches/user/'+$scope.user.id)
    .success(function(data, status) {
      $ionicLoading.hide();
      $scope.catches = data;
    })
    .error(function(data, status) {
        alert("catches.find");
    });
  }
  loadCatches();

  $scope.getPhoto = function(imgId) {
    Camera.getPicture().then(function(imageURI) {
      
      if(imgId == 'photo1')
        $scope.urlPhoto1 = imageURI;
      else 
        $scope.urlPhoto2 = imageURI;

    }, function(err) {
      console.err(err);
      alert("errr");
    });
  };

  /* 
    Catch Modal
  */


  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/catch-new.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  // Triggered in the login modal to close it
  $scope.closeNewCatch = function() {
    $scope.modal.hide();
  };

  // Open the new Feed modal
  $scope.newCatch = function() {
    // Form data for the Feed modal
    $scope.catchData = {};
    $scope.urlPhoto1 = 'img/addPhoto.png';
    $scope.urlPhoto2 = 'img/addPhoto.png';
    $scope.modal.show();
  };

  // Perform the login action when the user submits the login form
  $scope.addCatch = function() {
    var catchData = { 
      'user': {
                'name': $scope.user.name,
                "facebookid": $scope.user.id
              },
      'fishName': $scope.catchData.fishName,
      'weight': $scope.catchData.weight,
      'placeName': $scope.catchData.placeName,
      'placeLocation': $scope.catchData.placeLocation,
      'date': $scope.catchData.date,
      'length': $scope.catchData.length,
      'released': $scope.catchData.released,
      'message': $scope.catchData.message,
      'tags': $scope.catchData.tags,
    }

    $http.post('http://pescadorescolombia-api.herokuapp.com/catches/',feedData)
      .success(function(data, status) {
        loadCatches();
        $scope.modal.hide();
        $scope.catchData = {};
      })
      .error(function(data, status) {
          alert("fail.newCatch");
      });
  };
  
  /* End Catch Modal */

})

.controller('CatchDetailCtrl', function($scope, $stateParams,$ionicLoading, $resource, Catches) {

  $ionicLoading.show({
    template: 'Cargando...'
  });

  Catches.get({id:$stateParams.catchId,userid:$scope.user.id}, function (data){
          $ionicLoading.hide();
          $scope.catchDetail = data;
  });
})


.controller('PlaylistCtrl', function($scope, $stateParams) {
});


