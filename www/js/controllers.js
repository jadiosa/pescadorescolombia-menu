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

  $scope.getPhoto = function(photoId) {
    Camera.getPicture().then(function(imageURI) {
      
      upload(imageURI, photoId);

      if(photoId == 'MainPhoto')
        $scope.urlMainPhoto = imageURI;
      else 
        $scope.urlSecondaryPhoto = imageURI;

    }, function(err) {
      console.err(err);
      alert("errr");
    });
  };

  // Upload image to server
  upload = function (imageURI, photoId) {
    var ft = new FileTransfer();
    var options = new FileUploadOptions();
    var server = 'http://192.168.1.101:3000';

    options.fileKey = "file";
    options.fileName = 'filename.jpg'; // We will use the name auto-generated by Node at the server side.
    options.mimeType = "image/jpeg";
    options.chunkedMode = false;
    options.params = { // Whatever you populate options.params with, will be available in req.body at the server-side.
        "description": "Uploaded from my phone"
    };

    ft.upload(imageURI, server + "/images",
        function (r) {
          var response = JSON.parse(r.response);
          alert('photoId: ' + photoId);
          if(photoId == 'MainPhoto'){
            $scope.catchData.urlMainPhoto = server + "/"+ response.fileName;
            
          }
          else{
            $scope.catchData.urlSecondaryPhoto = server + "/"+ response.fileName;
          }

          $scope.$apply();
        },
        function (error) {
          alert("An error has occurred: Code = " + error.code);
          console.log("upload error source " + error.source);
          console.log("upload error target " + error.target);
        }, options);
  };
  
  $scope.getMyPosition = function() {
    
    $ionicLoading.show({
      template: 'Cargando...'
    });

    var onSuccess = function(position) {
      var longitude = position.coords.longitude;
      var latitude = position.coords.latitude;
      var latLong = new google.maps.LatLng(latitude, longitude);

      var mapOptions = {
          center: latLong,
          zoom: 16,
          mapTypeId: google.maps.MapTypeId.ROADMAP
      };

      var map = new google.maps.Map(document.getElementById("map"), mapOptions);

      var marker = new google.maps.Marker({
            position: latLong,
            map: map,
            title: 'my location'
        });

      $scope.$apply(function(){
            $ionicLoading.hide();
            $scope.catchData.placeLatitude = position.coords.latitude;
            $scope.catchData.placeLongitude = position.coords.longitude;
      });
    };

  function onError(error) {
      alert('code: '    + error.code    + '\n' +
            'message: ' + error.message + '\n');
  }

  navigator.geolocation.getCurrentPosition(onSuccess, onError);
    
  };

  /* 
    Catch Modal
  */

  $ionicModal.fromTemplateUrl('templates/catch-new.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  // Triggered in the login modal to close it
  $scope.closeNewCatch = function() {
    $scope.modal.hide();
    //Mostrar formulario arriba cuando se abre de nuevo el modal
  };

  // Open the new Feed modal
  $scope.newCatch = function() {
    $scope.modal.show();
    clearCatchForm();
  };

  // Perform the login action when the user submits the login form
  $scope.addCatch = function() {

    //TODO: validar campos obligatorios del formulario
    //TODO: Unir hora y fecha 

    var catchData = {
      'user': {
                'name': $scope.user.name,
                "facebookid": $scope.user.id
              },
      'fishName': $scope.catchData.fishName,
      'weight': $scope.catchData.weight,
      'placeName': $scope.catchData.placeName,
      'placeLongitude': $scope.catchData.placeLongitude,
      'placeLatitude': $scope.catchData.placeLatitude,
      'date': $scope.catchData.date,
      'time': $scope.catchData.time,
      'length': $scope.catchData.length,
      'lure': $scope.catchData.lure,
      'released': $scope.catchData.released,
      'message': $scope.catchData.message,
      'tags': $scope.catchData.tags,
      'images': {
                'main': $scope.catchData.urlMainPhoto,
                'secondary': $scope.catchData.urlSecondaryPhoto
              }
    }
    $http.post('http://pescadorescolombia-api.herokuapp.com/catches/', catchData)
      .success(function(data, status) {
        loadCatches();
        $scope.modal.hide();
        $scope.catchData = {};
     })
      .error(function(data, status) {
          alert("fail.newCatch");
      });
  };

  function clearCatchForm(){
    //Cleaning form data
    $scope.catchData = {};
    $scope.urlMainPhoto = 'img/addPhoto.png';
    $scope.urlSecondaryPhoto = 'img/addPhoto.png';

    //Focus on first element
    document.getElementById("fishName").focus();

    //Cleaning the map
    document.getElementById("map").innerHTML = '';
    document.getElementById("map").style.background = 'none';

  }

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


