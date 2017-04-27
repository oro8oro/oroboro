Meteor.startup(function () {

    // Global configuration
    Restivus.configure({
      useAuth: true,
      prettyJson: true,
      //onLoggedIn: function(){
      //  console.orolog()
      //}
    });

    // Generates: GET, POST, DELETE on /api/items and GET, PUT, DELETE on
    // /api/items/:id for File collection
    Restivus.addCollection(File, {
      excludedEndpoints: ['deleteAll'],
      auth: {
        //token: 'services.resume.loginTokens.token',
      },
      routeOptions: {
        authRequired: false//true
      },
      endpoints: {
        post: {
          authRequired: false
        },
        delete: {
          roleRequired: 'admin'
        }
      }
    });
    Restivus.addCollection(Group, {
      excludedEndpoints: ['deleteAll'],
      auth: {
        //token: 'services.resume.loginTokens.token',
      },
      routeOptions: {
        authRequired: false//true
      },
      endpoints: {
        post: {
          authRequired: false
        },
        delete: {
          roleRequired: 'admin'
        }
      }
    });
    Restivus.addCollection(Item, {
      excludedEndpoints: ['deleteAll'],
      auth: {
        //token: 'services.resume.loginTokens.token',
      },
      routeOptions: {
        authRequired: false//true
      },
      endpoints: {
        post: {
          authRequired: false
        },
        delete: {
          roleRequired: 'admin'
        }
      }
    });
    Restivus.addCollection(Dependency, {
      excludedEndpoints: ['deleteAll'],
      auth: {
        //token: 'services.resume.loginTokens.token',
      },
      routeOptions: {
        authRequired: false//true
      },
      endpoints: {
        post: {
          authRequired: false
        },
        delete: {
          roleRequired: 'admin'
        }
      }
    });

    // Generates: GET, POST on /api/users and GET, DELETE /api/users/:id for
    // Meteor.users collection
    Restivus.addCollection(Meteor.users, {
      excludedEndpoints: ['deleteAll', 'put'],
      routeOptions: {
        authRequired: false//true
      },
      endpoints: {
        post: {
          authRequired: false
        },
        delete: {
          roleRequired: 'admin'
        }
      }
    });

    Restivus.addRoute('file_all/:id', {authRequired: false}, {
      get: function () {
        var post = file_components_elements(this.urlParams.id);
        if (post) {
          return {status: 'success', data: post};
        }
        return {
          statusCode: 404,
          body: {status: 'fail', message: 'File not found'}
        };
      }
    });

    // Maps to: /api/posts/:id
    Restivus.addRoute('group_all/:id', {authRequired: false}, {
      get: function () {
        var post = recursive_group_elements(this.urlParams.id);
        if (post) {
          return {status: 'success', data: post};
        }
        return {
          statusCode: 404,
          body: {status: 'fail', message: 'File not found'}
        };
      }/*,
      post: {
        //roleRequired: ['author', 'admin'],
        action: function () {
          var post = File.findOne(this.urlParams.id);
          if (post) {
            return {status: "success", data: post};
          }
          return {
            statusCode: 400,
            body: {status: "fail", message: "Unable to add post"}
          };
        }
      },
      delete: {
        roleRequired: 'admin',
        action: function () {
          if (File.remove(this.urlParams.id)) {
            return {status: "success", data: {message: "Item removed"}};
          }
          return {
            statusCode: 404,
            body: {status: "fail", message: "Item not found"}
          };
        }
      }*/
    });

    Restivus.addRoute('group/:field/:value', {authRequired: false}, {
      get: function () {
        var q = {};
        q[this.urlParams.field] = this.urlParams.value;
        var groups = Group.find(q).fetch();
        var g, post = {items: [], groups: []};
        for(var i = 0; i < groups.length; i++){
          g = recursive_group_elements(groups[i]._id);
          post.items = post.items.concat(g.items);
          post.groups = post.groups.concat(g.groups);
        }

        if (post) {
          return {status: 'success', data: post};
        }
        return {
          statusCode: 404,
          body: {status: 'fail', message: 'File not found'}
        };
      }
    });

});
