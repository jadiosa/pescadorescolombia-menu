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