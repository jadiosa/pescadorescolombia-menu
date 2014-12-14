angular.module('pescadorescolombia.services', ['ngResource'])

.factory('Feed', function ($resource) {
    return $resource('http://pescadorescolombia-api.herokuapp.com/feed/:id',{id:'@_id'},{
        update: {
            method: 'PUT'
        }
    });
})

.factory('Catches', function ($resource) {
    return $resource('http://pescadorescolombia-api.herokuapp.com/catches/:id',{id:'@_id'},{
        update: {
            method: 'PUT'
        }
    });
})

.factory('Camera', ['$q', function($q) {

  return {
    getPicture: function(options) {
      var q = $q.defer();

      navigator.camera.getPicture(function(result) {
        // Do any magic you need
        q.resolve(result);
      }, function(err) {
        q.reject(err);
      }, 
        {
          sourceType : Camera.PictureSourceType.PHOTOLIBRARY,
          encodingType: Camera.EncodingType.JPEG,
          destinationType: Camera.DestinationType.FILE_URI,
          quality: 45
        }
      );

      return q.promise;
    }
  }
}]);