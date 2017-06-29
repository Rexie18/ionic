'use strict';

angular.module('conFusion.services', ['ngResource'])
  .constant("baseURL", "http://localhost:3000/")
  .factory('menuFactory', ['$resource', 'baseURL', function($resource, baseURL) {

    return $resource(baseURL + "dishes/:id", null, {
      'update': {
        method: 'PUT'
      }
    });

  }])

  .factory('promotionFactory', ['$resource', 'baseURL', function($resource, baseURL) {
    return $resource(baseURL + "promotions/:id");

  }])

  .factory('corporateFactory', ['$resource', 'baseURL', function($resource, baseURL) {


    return $resource(baseURL + "leadership/:id");

  }])

  .factory('feedbackFactory', ['$resource', 'baseURL', function($resource, baseURL) {


    return $resource(baseURL + "feedback/:id");

  }])

  .factory('favoriteFactory', ['$resource', 'baseURL', '$localStorage', function($resource, baseURL, $localStorage) {
    var favFac = {};
    var favorites = $localStorage.getObject('favorites','[]');

    favFac.addToFavorites = function(index) {
      for (var i = 0; i < favorites.length; i++) {
        if (favorites[i].id == index)
          return;
      }
      favorites.push({
        id: index
      });
      console.log(favorites);
      $localStorage.storeObject('favorites', favorites);
    };
    favFac.deleteFromFavorites = function(index) {
      for (var i = 0; i < favorites.length; i++) {
        if (favorites[i].id == index) {
          favorites.splice(i, 1);
          $localStorage.storeObject('favorites', favorites);
        }
      }
    }

    favFac.getFavorites = function() {
      return favorites;
    };

    return favFac;
  }])
  .factory('$localStorage', ['$window', function($window) {
    return {
      store: function(key, value) {
        $window.localStorage[key] = value;
      },
      get: function(key, defaultValue) {
        return $window.localStorage[key] || defaultValue;
      },
      storeObject: function(key, value) {
        $window.localStorage[key] = JSON.stringify(value);
      },
      getObject: function(key, defaultValue) {
        return JSON.parse($window.localStorage[key] || defaultValue);
      }
    }
  }])
  
  
  
  
  
  
  angular.module('conFusion.controllers', [])

  .controller('AppCtrl', function($scope, $ionicModal, $timeout, $localStorage) {

    // With the new view caching in Ionic, Controllers are only called
    // when they are recreated or on app start, instead of every page change.
    // To listen for when this page is active (for example, to refresh data),
    // listen for the $ionicView.enter event:
    //$scope.$on('$ionicView.enter', function(e) {
    //});

    // Form data for the login modal
    $scope.loginData = $localStorage.getObject('userinfo', '{}');

    // Create the login modal that we will use later
    $ionicModal.fromTemplateUrl('templates/login.html', {
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
      $localStorage.storeObject('userinfo', $scope.loginData);

      // Simulate a login delay. Remove this and replace with your login
      // code if using a login system
      $timeout(function() {
        $scope.closeLogin();
      }, 1000);
    };
    $scope.reservation = {};

    // Create the reserve modal that we will use later
    $ionicModal.fromTemplateUrl('templates/reserve.html', {
      scope: $scope
    }).then(function(modal) {
      $scope.reserveform = modal;
    });

    // Triggered in the reserve modal to close it
    $scope.closeReserve = function() {
      $scope.reserveform.hide();
    };

    // Open the reserve modal
    $scope.reserve = function() {
      $scope.reserveform.show();
    };

    // Perform the reserve action when the user submits the reserve form
    $scope.doReserve = function() {
      console.log('Doing reservation', $scope.reservation);

      // Simulate a reservation delay. Remove this and replace with your reservation
      // code if using a server system
      $timeout(function() {
        $scope.closeReserve();
      }, 1000);
    };
  })

  .controller('MenuController', ['$scope', 'menuFactory', 'favoriteFactory', 'baseURL', 'dishes', '$ionicListDelegate', function($scope, menuFactory, favoriteFactory, baseURL, dishes, $ionicListDelegate) {

    $scope.baseURL = baseURL;
    $scope.tab = 1;
    $scope.filtText = '';
    $scope.showDetails = false;
    $scope.showMenu = false;
    $scope.message = "Loading ...";
    $scope.dishes = dishes;

    $scope.select = function(setTab) {
      $scope.tab = setTab;

      if (setTab === 2) {
        $scope.filtText = "appetizer";
      } else if (setTab === 3) {
        $scope.filtText = "mains";
      } else if (setTab === 4) {
        $scope.filtText = "dessert";
      } else {
        $scope.filtText = "";
      }
    };

    $scope.isSelected = function(checkTab) {
      return ($scope.tab === checkTab);
    };

    $scope.toggleDetails = function() {
      $scope.showDetails = !$scope.showDetails;
    };
    $scope.addFavorite = function(index) {
      console.log("index is " + index);
      favoriteFactory.addToFavorites(index);
      $ionicListDelegate.closeOptionButtons();
    }
  }])

  .controller('ContactController', ['$scope', function($scope) {

    $scope.feedback = {
      mychannel: "",
      firstName: "",
      lastName: "",
      agree: false,
      email: ""
    };

    var channels = [{
      value: "tel",
      label: "Tel."
    }, {
      value: "Email",
      label: "Email"
    }];

    $scope.channels = channels;
    $scope.invalidChannelSelection = false;

  }])

  .controller('FeedbackController', ['$scope', 'feedbackFactory', function($scope, feedbackFactory) {

    $scope.sendFeedback = function() {

      console.log($scope.feedback);

      if ($scope.feedback.agree && ($scope.feedback.mychannel == "")) {
        $scope.invalidChannelSelection = true;
        console.log('incorrect');
      } else {
        $scope.invalidChannelSelection = false;
        feedbackFactory.save($scope.feedback);
        $scope.feedback = {
          mychannel: "",
          firstName: "",
          lastName: "",
          agree: false,
          email: ""
        };
        $scope.feedback.mychannel = "";
        $scope.feedbackForm.$setPristine();
        console.log($scope.feedback);
      }
    };
  }])

  .controller('DishDetailController', ['$scope', '$stateParams', 'dish', 'menuFactory', 'favoriteFactory', 'baseURL', '$ionicPopover', '$ionicModal', function($scope, $stateParams, dish, menuFactory, favoriteFactory, baseURL, $ionicPopover, $ionicModal) {
    $scope.baseURL = baseURL;
    $scope.dish = dish;
    $scope.showDish = false;
    $scope.message = "Loading ...";

    $ionicPopover.fromTemplateUrl('templates/dish-detail-popover.html', {
      scope: $scope
    }).then(function(popover) {
      $scope.popover = popover;
    });
    $scope.showPopover = function($event) {
      $scope.popover.show($event);
    };
    $scope.hidePopover = function() {
      $scope.popover.hide();
    }
    $scope.addFavorite = function() {
      console.log($scope.dish);
      favoriteFactory.addToFavorites($scope.dish.id);
      $scope.hidePopover();
    }
    $ionicModal.fromTemplateUrl('templates/dish-comment.html', {
      scope: $scope
    }).then(function(modal) {
      $scope.commentModal = modal;
    });
    $scope.showComment = function() {
      $scope.commentModal.show();
    };
    $scope.hideComment = function() {
      $scope.commentModal.hide();
    };
    $scope.mycomment = {
      rating: 5,
      comment: "",
      author: "",
      date: ""
    };

    $scope.submitComment = function() {

      $scope.mycomment.date = new Date().toISOString();
      console.log($scope.mycomment);

      $scope.dish.comments.push($scope.mycomment);
      menuFactory.update({
        id: $scope.dish.id
      }, $scope.dish);

      $scope.mycomment = {
        rating: 5,
        comment: "",
        author: "",
        date: ""
      };
      $scope.hideComment();
    }
  }])

  .controller('DishCommentController', ['$scope', 'menuFactory', function($scope, menuFactory) {

    $scope.mycomment = {
      rating: 5,
      comment: "",
      author: "",
      date: ""
    };

    $scope.submitComment = function() {

      $scope.mycomment.date = new Date().toISOString();
      console.log($scope.mycomment);

      $scope.dish.comments.push($scope.mycomment);
      menuFactory.update({
        id: $scope.dish.id
      }, $scope.dish);

      $scope.commentForm.$setPristine();

      $scope.mycomment = {
        rating: 5,
        comment: "",
        author: "",
        date: ""
      };
    }
  }])

  // implement the IndexController and About Controller here

  .controller('IndexController', ['$scope','leader', 'dish', 'promotion', 'baseURL','menuFactory','promotionFactory','corporateFactory', function($scope, baseURL, leader, dish, promotion, menuFactory, promotionFactory, corporateFactory) {

    $scope.baseURL = baseURL;
    $scope.leader = leader;
    $scope.dish = dish;
    $scope.promotion = promotion;

  }])

  .controller('AboutController', ['$scope', 'corporateFactory', 'baseURL', function($scope, corporateFactory, baseURL) {

    $scope.baseURL = baseURL;
    $scope.leadership = corporateFactory.query();


  }])

  .controller('FavoritesController', ['$scope', 'dishes', 'favorites', 'favoriteFactory', 'baseURL', '$ionicListDelegate', '$ionicPopup', '$ionicLoading', '$timeout', '$state', function($scope, dishes, favorites, favoriteFactory, baseURL, $ionicListDelegate, $ionicPopup, $ionicLoading, $timeout, $state) {
    $state.go($state.current, {}, {reload: true});
    $scope.baseURL = baseURL;
    $scope.shouldShowDelete = false;
    $scope.favorites = favorites;
    $scope.dishes = dishes;


    $scope.toggleDelete = function() {
      $scope.shouldShowDelete = !$scope.shouldShowDelete;
      console.log($scope.shouldShowDelete);
    }

    $scope.deleteFavorite = function(index) {

      var confirmPopup = $ionicPopup.confirm({
        title: 'Confirm Delete',
        template: 'Are you sure you want to delete this item?'
      });

      confirmPopup.then(function(res) {
        if (res) {
          console.log('Ok to delete');
          favoriteFactory.deleteFromFavorites(index);
        } else {
          console.log('Canceled delete');
        }
      });

      $scope.shouldShowDelete = false;
    }
  }])
  .filter('favoriteFilter', function() {
    return function(dishes, favorites) {
      var out = [];
      console.log("Favorites:" + favorites);
      console.log("Dishes:" + dishes);
      for (var i = 0; i < favorites.length; i++) {
        for (var j = 0; j < dishes.length; j++) {
          if (dishes[j].id === favorites[i].id)
            out.push(dishes[j]);
        }
      }
      return out;

    }
  });
  
  
  
  
  
  
  // Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('conFusion', ['ionic', 'conFusion.controllers', 'conFusion.services'])

  .run(function($ionicPlatform, $rootScope, $ionicLoading) {
    $ionicPlatform.ready(function() {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      if (window.cordova && window.cordova.plugins.Keyboard) {
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        cordova.plugins.Keyboard.disableScroll(true);

      }
      if (window.StatusBar) {
        // org.apache.cordova.statusbar required
        StatusBar.styleDefault();
      }
    });
    $rootScope.$on('loading:show', function() {
      $ionicLoading.show({
        template: '<ion-spinner></ion-spinner> Loading ...'
      })
    });

    $rootScope.$on('loading:hide', function() {
      $ionicLoading.hide();
    });

    $rootScope.$on('$stateChangeStart', function() {
      console.log('Loading ...');
      $rootScope.$broadcast('loading:show');
    });

    $rootScope.$on('$stateChangeSuccess', function() {
      console.log('done');
      $rootScope.$broadcast('loading:hide');
    });
  })

  .config(function($stateProvider, $urlRouterProvider) {
    $stateProvider

      .state('app', {
        url: '/app',
        abstract: true,
        templateUrl: 'templates/sidebar.html',
        controller: 'AppCtrl'
      })

      .state('app.home', {
        url: '/home',
        views: {
          'mainContent': {
            templateUrl: 'templates/home.html',
            controller: 'IndexController',
            resolve: {
              dish: ['menuFactory', function(menuFactory) {
                return menuFactory.get({
                  id: 0
                });
              }],
              leader: ['corporateFactory', function(corporateFactory) {
                return corporateFactory.get({
                  id: 3
                });
              }],
              promotion:['promotionFactory', function(promotionFactory){
                return promotionFactory.get({
                  id: 0
                });
              }]
            }
          }
        }
      })

      .state('app.aboutus', {
        url: '/aboutus',
        views: {
          'mainContent': {
            templateUrl: 'templates/aboutus.html',
            controller: 'AboutController',
            resolve: {
              leadership : ['corporateFactory', function(corporateFactory){
                return corporateFactory.query();
              }]
            }
          }
        }
      })

      .state('app.contactus', {
        url: '/contactus',
        views: {
          'mainContent': {
            templateUrl: 'templates/contactus.html'
          }
        }
      })

      .state('app.menu', {
        url: '/menu',
        views: {
          'mainContent': {
            templateUrl: 'templates/menu.html',
            controller: 'MenuController',
            resolve: {
              dishes: ['menuFactory', function(menuFactory){
                return menuFactory.query();
              }]
            }
          }
        }
      })

      .state('app.favorites', {
        url: '/favorites',
        views: {
          'mainContent': {
            templateUrl: 'templates/favorites.html',
            controller: 'FavoritesController',
            resolve: {
              dishes: ['menuFactory', function(menuFactory) {
                return menuFactory.query();
              }],
              favorites: ['favoriteFactory', function(favoriteFactory){
                return favoriteFactory.getFavorites();
              }]
              }
            }
          }
        })

      .state('app.dishdetails', {
        url: '/menu/:id',
        views: {
          'mainContent': {
            templateUrl: 'templates/dishdetail.html',
            controller: 'DishDetailController',
            resolve: {
              dish: ['$stateParams', 'menuFactory', function($stateParams, menuFactory) {
                return menuFactory.get({
                  id: parseInt($stateParams.id, 10)
                });
              }]
            }
          }
        }
      });

    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/app/home');

  });




angular.module('conFusion.controllers', [])

.controller('AppCtrl', function ($scope, $ionicModal, $timeout, $localStorage, $ionicPlatform, $cordovaCamera, $cordovaImagePicker) {
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  // Form data for the login modal
    $scope.loginData = $localStorage.getObject('userinfo','{}');
    
    // Create the login modal that we will use later
    $ionicModal.fromTemplateUrl('templates/login.html', {
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

    // Perform the login action when the user submits the login   form
    $scope.doLogin = function () {
        console.log('Doing login', $scope.loginData);
        $localStorage.storeObject('userinfo',$scope.loginData);

        // Simulate a login delay. Remove this and replace with     your login
        // code if using a login system
        $timeout(function() {
            $scope.closeLogin();
        }, 1000)
    };
    
    
    $scope.reservation = {};

  // Create the reserve modal that we will use later
    $ionicModal.fromTemplateUrl('templates/reserve.html', {
        scope: $scope
    }).then(function(modal) {
        $scope.reserveform = modal;
    });

    // Triggered in the reserve modal to close it
    $scope.closeReserve = function() {
        $scope.reserveform.hide();
    };

    // Open the reserve modal
    $scope.reserve = function() {
      $scope.reserveform.show();
    };

    // Perform the reserve action when the user submits the reserve form
    $scope.doReserve = function() {
        console.log('Doing reservation', $scope.reservation);

        // Simulate a reservation delay. Remove this and replace with your reservation
        // code if using a server system
        $timeout(function() {
            $scope.closeReserve();
        }, 1000);
    }; 
    
    $scope.registration = {};
    
    // Create the registration modal that we will use later
    $ionicModal.fromTemplateUrl('templates/register.html', {
        scope: $scope
    }).then(function (modal) {
        $scope.registerform = modal;
    });

    // Triggered in the registration modal to close it
    $scope.closeRegister = function () {
        $scope.registerform.hide();
    };

    // Open the registration modal
    $scope.register = function () {
        $scope.registerform.show();
    };

    // Perform the registration action when the user submits the registration form
    $scope.doRegister = function () {
        // Simulate a registration delay. Remove this and replace with your registration
        // code if using a registration system
        $timeout(function () {
            $scope.closeRegister();
        }, 1000);
    };
    
    $ionicPlatform.ready(function() {
        var options = {
            quality: 50,
            destinationType: Camera.DestinationType.DATA_URL,
            sourceType: Camera.PictureSourceType.CAMERA,
            allowEdit: true,
            encodingType: Camera.EncodingType.JPEG,
            targetWidth: 100,
            targetHeight: 100,
            popoverOptions: CameraPopoverOptions,
            saveToPhotoAlbum: false
        };
        $scope.takePicture = function() {
            $cordovaCamera.getPicture(options).then(function(imageData) {
                $scope.registration.imgSrc = "data:image/jpeg;base64," + imageData;
            }, function(err) {
                console.log(err);
            });

            $scope.registerform.show();

        };
        
        var gallaryOptions = {
            maximumImagesCount: 1,
            width: 100,
            height: 100,
            quality: 50
        };
        $scope.openGallary = function() {
            $cordovaImagePicker.getPictures(gallaryOptions)
              .then(function (results) {
                for (var i = 0; i < results.length; i++) {
                  $scope.registration.imgSrc = results[i];
                  console.log('Image URI: ' + results[i]);
                }
              }, function (error) {
                console.log(error);
              });
            $scope.registerform.show();

        };
        
    });
})

.controller('MenuController', ['$scope', 'dishes', 'favoriteFactory', 'baseURL', '$ionicListDelegate', '$ionicPlatform', '$cordovaLocalNotification', '$cordovaToast', function ($scope, dishes, favoriteFactory, baseURL, $ionicListDelegate, $ionicPlatform, $cordovaLocalNotification, $cordovaToast) {

    $scope.baseURL = baseURL;
    $scope.tab = 1;
    $scope.filtText = '';
    $scope.showDetails = false;
    
    $scope.dishes = dishes;
                        
    $scope.select = function(setTab) {
        $scope.tab = setTab;
                
        if (setTab === 2) {
            $scope.filtText = "appetizer";
        }
        else if (setTab === 3) {
            $scope.filtText = "mains";
        }
        else if (setTab === 4) {
            $scope.filtText = "dessert";
        }
        else {
            $scope.filtText = "";
        }
    };
    
    $scope.isSelected = function (checkTab) {
        return ($scope.tab === checkTab);
    };
        
    $scope.toggleDetails = function() {
        $scope.showDetails = !$scope.showDetails;
    };
    
    $scope.addFavorite = function (index) {
        console.log("index is " + index);
        favoriteFactory.addToFavorites(index);
        $ionicListDelegate.closeOptionButtons();
        
        $ionicPlatform.ready(function () {
            $cordovaLocalNotification.schedule({
                id: 1,
                title: "Added Favorite",
                text: $scope.dishes[index].name
            }).then(function () {
                console.log('Added Favorite '+$scope.dishes[index].name);
            },
                    function () {
                console.log('Failed to add Notification ');
            });

            $cordovaToast
                .show('Added Favorite '+$scope.dishes[index].name, 'long', 'center')
                .then(function (success) {
                // success
            }, function (error) {
                // error
            });
        });
    };
    
    

}])
    
.controller('ContactController', 'baseURL', ['$scope', function($scope, baseURL) {

    $scope.baseURL = baseURL;
    $scope.feedback = {mychannel:"", firstName:"", lastName:"", agree:false, email:"" };
                
    var channels = [{value:"tel", label:"Tel."},   {value:"Email",label:"Email"}];
                
    $scope.channels = channels;
    $scope.invalidChannelSelection = false;
                        
}])

.controller('FeedbackController', ['$scope', 'feedbackFactory', function($scope,feedbackFactory) {
            
    $scope.sendFeedback = function() {
                    
        console.log($scope.feedback);
                
        if ($scope.feedback.agree && ($scope.feedback.mychannel == "")) {
            $scope.invalidChannelSelection = true;
            console.log('incorrect');
        }
        else {
            $scope.invalidChannelSelection = false;
            feedbackFactory.save($scope.feedback);
            $scope.feedback = {mychannel:"", firstName:"", lastName:"", agree:false, email:"" };
            $scope.feedback.mychannel="";
            $scope.feedbackForm.$setPristine();
            console.log($scope.feedback);
        }
    };
}])

.controller('DishDetailController', ['$scope', '$stateParams', 'dish', 'menuFactory', 'favoriteFactory', 'baseURL', '$ionicPopover', '$ionicModal', '$ionicPlatform', '$cordovaLocalNotification', '$cordovaToast', function ($scope, $stateParams, dish, menuFactory, favoriteFactory, baseURL, $ionicPopover, $ionicModal, $ionicPlatform, $cordovaLocalNotification, $cordovaToast) {

    $scope.baseURL = baseURL;

    $scope.dish = dish;
    
    // popover
    $ionicPopover.fromTemplateUrl('templates/dish-detail-popover.html', {
        scope: $scope
    }).then(function(popover) {
        $scope.popover = popover;
    });
    
    $scope.openPopover = function($event) {
        $scope.popover.show($event);
    };
    
    $scope.closePopover = function() {
        $scope.popover.hide();
    };
    
    $scope.addFavorite = function (index) {
        console.log("index is " + index);
        favoriteFactory.addToFavorites(index);
        
        $ionicPlatform.ready(function () {
            $cordovaLocalNotification.schedule({
                id: 1,
                title: "Added Favorite",
                text: $scope.dishes[index].name
            }).then(function () {
                console.log('Added Favorite '+$scope.dishes[index].name);
            },
                    function () {
                console.log('Failed to add Notification ');
            });

            $cordovaToast
                .show('Added Favorite '+$scope.dishes[index].name, 'long', 'bottom')
                .then(function (success) {
                // success
            }, function (error) {
                // error
            });
        });
        
        $scope.closePopover();
    };
    
    
    //comment form
    
    $scope.mycomment = {rating:5, comment:"", author:"", date:""};
        
    $ionicModal.fromTemplateUrl('templates/dish-comment.html', {
        scope: $scope
    }).then(function(modal) {
        $scope.commentForm = modal;
    });
    
    $scope.addComment = function() {
        //$scope.closePopover();
        $scope.commentForm.show();
    };
    
    $scope.closeCommentForm = function() {
        $scope.commentForm.hide();
    };
    
    $scope.$on('modal.hidden', function() {
        $scope.closePopover();
    });
    
    $scope.submitComment = function () {
        
        $scope.mycomment.date = new Date().toISOString();
        console.log($scope.mycomment);
                    
        $scope.dish.comments.push($scope.mycomment);
        menuFactory.update({id:$scope.dish.id},$scope.dish);
                                    
        $scope.mycomment = {rating:5, comment:"", author:"",   date:""};
        
        $scope.closeCommentForm();
    }
    
}])

.controller('DishCommentController', ['$scope', 'menuFactory', function($scope,menuFactory) {
            
    $scope.mycomment = {rating:5, comment:"", author:"", date:""};
                
    $scope.submitComment = function () {
                    
        $scope.mycomment.date = new Date().toISOString();
        console.log($scope.mycomment);
                    
        $scope.dish.comments.push($scope.mycomment);
        menuFactory.update({id:$scope.dish.id},$scope.dish);
                
        $scope.commentForm.$setPristine();
                    
        $scope.mycomment = {rating:5, comment:"", author:"",   date:""};
    }
}])

.controller('IndexController', ['$scope', 'dish', 'leader', 'promotion', 'baseURL', function ($scope, dish, leader, promotion, baseURL) {

    $scope.baseURL = baseURL;
    
    $scope.dish = dish;
    $scope.leader = leader;
    $scope.promotion = promotion;

}])

.controller('AboutController', ['$scope', 'leadership', 'baseURL', function($scope, leadership, baseURL) {

    $scope.baseURL = baseURL;
    $scope.leadership = leadership;
    
}])

.controller('FavoritesController', ['$scope', 'dishes', 'favorites', 'favoriteFactory', 'baseURL', '$ionicListDelegate', '$ionicPopup', '$ionicLoading', '$timeout', '$ionicPlatform', '$cordovaVibration', function ($scope, dishes, favorites, favoriteFactory, baseURL, $ionicListDelegate, $ionicPopup, $ionicLoading, $timeout, $ionicPlatform, $cordovaVibration) {

    $scope.baseURL = baseURL;
    $scope.shouldShowDelete = false;

    $scope.favorites = favorites;

    $scope.dishes = dishes;
    console.log($scope.dishes, $scope.favorites);

    $scope.toggleDelete = function () {
        $scope.shouldShowDelete = !$scope.shouldShowDelete;
        console.log($scope.shouldShowDelete);
    }

        $scope.deleteFavorite = function (index) {

        var confirmPopup = $ionicPopup.confirm({
            title: 'Confirm Delete',
            template: 'Are you sure you want to delete this item?'
        });

        confirmPopup.then(function (res) {
            if (res) {
                console.log('Ok to delete');
                favoriteFactory.deleteFromFavorites(index);
                $ionicPlatform.ready(function () {
                    $cordovaVibration.vibrate(100);
                });
            } else {
                console.log('Canceled delete');
            }
        });

        $scope.shouldShowDelete = false;

    }

}])

.filter('favoriteFilter', function () {
    return function (dishes, favorites) {
        var out = [];
        for (var i = 0; i < favorites.length; i++) {
            for (var j = 0; j < dishes.length; j++) {
                if (dishes[j].id === favorites[i].id)
                    out.push(dishes[j]);
            }
        }
        return out;

    }})

;
