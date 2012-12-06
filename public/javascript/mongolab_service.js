var app = angular.module('mongolab_service', ['ngResource']);

app.factory('Project', function($resource) {
    var Project  = $resource('https://api.mongolab.com/api/1/databases/projectplan/collections/project/:id', {
      id:'@id',
      apiKey:'506b96b5e4b0b2e219506689'},{
      update: { method: 'PUT' }
    });           
    
    Project.prototype.update = function(cb) {
        return Project.update({id: this._id.$oid},
            angular.extend({}, this, {_id:undefined}), cb);
    };
    
    Project.prototype.destroy = function(cb) {
        return Project.remove({id: this._id.$oid}, cb);
      };
    
    return Project;
});
