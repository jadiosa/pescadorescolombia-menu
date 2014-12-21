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

.controller('CatchesCtrl', function($scope, $ionicLoading, $resource, $http, $ionicModal) {

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

    var cameraOptions = {
        quality: 40,
        destinationType: Camera.DestinationType.FILE_URI,
        encodingType: Camera.EncodingType.JPEG,
        sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
    };

    navigator.camera.getPicture(cameraSuccess, cameraError, cameraOptions);
    
    function cameraSuccess(imageURI) {
      uploadS3(imageURI, photoId);
    }

    function cameraError(message) {
        alert('Failed because: ' + message);
    }

  };

  uploadS3 = function (imageURI, photoId) {

    var ft = new FileTransfer();
    var options = new FileUploadOptions();
    options.fileKey = "file";
    options.fileName = imageURI.substr(imageURI.lastIndexOf('/') + 1);
    options.mimeType = "image/jpeg";
    options.chunkedMode = false;

    var s3_sign_url= 'http://pescadorescolombia-api.herokuapp.com/sign_s3';
    var signData = { 
      'fileName': options.fileName
    };

    //Se invoca servicio para firmar el mensaje
    $http.post(s3_sign_url, signData)
      .success(function(data, status) {
        options.params = {
            "key": options.fileName,
            "AWSAccessKeyId": data.awsKey,
            "acl": "public-read",
            "policy": data.policy,
            "signature": data.signature,
            "Content-Type": "image/jpeg"
        };

        ft.onprogress = function(progressEvent) {
            if (progressEvent.lengthComputable) {
              $scope.uploadPercentage = Math.floor( progressEvent.loaded / progressEvent.total * 100 );
              $scope.$apply();
            } 
        };

        ft.upload(imageURI, "https://" + data.bucket + ".s3.amazonaws.com/", uploadSuccess, uploadError, options )
        
        function uploadSuccess(response) {
          $scope.uploadPercentage = '';
          if(photoId == 'MainPhoto'){
            $scope.catchData.urlMainPhoto = data.url;
            $scope.urlMainPhoto = imageURI;
          }
          else{
            $scope.catchData.urlSecondaryPhoto = data.url;
            $scope.urlSecondaryPhoto = imageURI;
          }
          $scope.$apply();
        }

        function uploadError(error) {
            alert("An error has occurred: Code = " + error.code);
            console.log("upload error source " + error.source);
            console.log("upload error target " + error.target);
        }
      })
      .error(function(data, status) {
          alert("Error Firmando Mensaje " + s3_sign_url);
      });    
  };
  
  $scope.getMyPosition = function() {
    
    $ionicLoading.show({
      template: 'Cargando...'
    });

    var onSuccess = function(position) {
      var longitude = position.coords.longitude;
      var latitude = position.coords.latitude;

      showMap(latitude, longitude);

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

    function showMap(latitude, longitude){
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
    }
    
  };


  $scope.s3_upload = function() {
    var status_elem = document.getElementById("status");
    var url_elem = document.getElementById("avatar_url");
    var preview_elem = document.getElementById("preview");
    var s3upload = new S3Upload({
        s3_object_name: 'unique',
        file_dom_selector: 'files',
        s3_sign_put_url: 'http://localhost:3000/sign_s3',
        onProgress: function(percent, message) {
            status_elem.innerHTML = 'Upload progress: ' + percent + '% ' + message;
        },
        onFinishS3Put: function(public_url) {
            status_elem.innerHTML = 'Upload completed. Uploaded to: '+ public_url;
            url_elem.value = public_url;
            preview_elem.innerHTML = '<img src="'+public_url+'" style="width:300px;" />';
        },
        onError: function(status) {
            status_elem.innerHTML = 'Upload error: ' + status;
        }
    });
  }

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
          showMap($scope.catchDetail.placeLatitude, $scope.catchDetail.placeLongitude);
          $scope.apply();
  });
  
  function showMap(latitude, longitude ){
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
  }

})


.controller('PlaylistCtrl', function($scope, $stateParams) {
});


