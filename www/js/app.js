// Ionic Starter App
angular.module('senseEurAir', ['ionic', 'senseEurAir.constants', 'senseEurAir.controllers', 'senseEurAir.services', 'senseEurAir.directives', 'ionic-native-transitions', 'angular-click-outside', 'nvd3'])

.run(function($ionicPlatform, $database, $dataConfig, $networksSources, $geolocationFactory, $networkStatus, $alerts) {
  $ionicPlatform.ready(function() {
    //$geolocationFactory.get().then(function(success){
      // $alerts.retrieveConcentrationNearUser().then(
      //   function(success){
      //     //$scope.alerts = $alerts.alerts;
      //   }, function(error){
      //     console.error('error', error);
      //   }
      // );
    //});
    

    if(window.cordova && window.cordova.plugins.Keyboard) {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(false);

      // Don't remove this line unless you know what you are doing. It stops the viewport
      // from snapping when text inputs are focused. Ionic handles this internally for
      // a much nicer keyboard experience.
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }

    // Lock screen orientation in device with witdh <768px to portrait
    // Screen orientation available for device with width >768px, (all the tablets)
    // Method does not work on desktop
    if (screen.width < 760) {
      // window.outWidth for Android
      // screen.width for iOS?
      
      console.log("lock in portrait", screen.width);
      screen.lockOrientation('portrait');
    }else{
      console.log("unlocked", screen.width);
      screen.unlockOrientation();
    }

    if(window.Connection) { //Check device status connection
      if(navigator.connection.type == Connection.NONE){
        console.log('App start offline');
        $networkStatus.isOnline = false;
      }else{
        console.log('App start online');
        $networkStatus.isOnline = true;
      }
    }

    $database.initDb().then(function(success){
      $dataConfig.updateAppData('server').then(function(success){ //server || local, will depend of the network connection status
        $networksSources.set().then(
          //$alerts.checkNewAlerts(); // It does a geolocationFactory.get() in the same time
          function(success){
            $networksSources.statusNetworks(); //Check if all netorks are reachable/online
          }
        );
        navigator.splashscreen.hide();
        $networksSources.setDefaultSources();
        //$alerts.checkNewAlerts(); // It does a geolocationFactory.get() in the same time
      }, function(error){
        console.error('Error init/update/populate database at run, app stuck');
      })
      //navigator.splashscreen.hide();
    }, function(error){
      console.error('Db not opened, app stuck');
      //In case of error, maybe delete all base content, to avoid to have some duplicate
      //if no DB open, error splash screen will never hide. Think about something to run again the app?
    })

  });
})

//ROUTING//
.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider

  .state('app', { 
    url: '/app',
    abstract: true,
    templateUrl: 'templates/app.html',
    controller: 'AppCtrl'
  })
  
  .state('app.home', {
    cache: false,
    url: '/home',
      views: {
        'mainContent': {
          templateUrl: 'templates/home.html',
          controller: 'HomeCtrl'
        }
      }
  })
  .state('app.about', {
    cache: false,
    url: '/about',
      views: {
        'mainContent': {
          templateUrl: 'templates/about.html',
          controller: 'AboutCtrl'
        }
      }
  })
  .state('app.links', {
    cache: false,
    url: '/links',
      views: {
        'mainContent': {
          templateUrl: 'templates/links.html',
          controller: 'LinksCtrl'
        }
      }
  })
  .state('app.contact', {
    cache: false,
    url: '/contact',
      views: {
        'mainContent': {
          templateUrl: 'templates/contact.html',
          controller: 'ContactCtrl'
        }
      }
  })
  .state('app.alerts', {
    cache: false,
    url: '/alerts',
      views: {
        'mainContent': {
          templateUrl: 'templates/alerts.html',
          controller: 'AlertsCtrl'
        }
      }
  })
  .state('app.pollutants', {
    cache: false,
    url: '/pollutants',
      views: {
        'mainContent': {
          templateUrl: 'templates/pollutants.html',
          controller: 'PollutantsCtrl'
        }
      }
  })
  .state('app.meteo', {
    cache: false,
    url: '/meteo',
      views: {
        'mainContent': {
          templateUrl: 'templates/meteo.html',
          controller: 'MeteoCtrl'
        }
      }
  })
  .state('app.network', {
    cache: false,
    url: '/network',
      views: {
        'mainContent': {
          templateUrl: 'templates/network.html',
          controller: 'NetworkCtrl'
        }
      }
  })
  .state('app.map', {
    cache: false,
    url: '/map/:label_phenomenon',
      views: {
        'mainContent': {
          templateUrl: 'templates/map.html',
          controller: 'MapCtrl'
        }
      }
  })
  .state('app.timeseries', {
    cache: false,
    url: '/timeseries/:tsparams',
      views: {
        'mainContent': {
          templateUrl: 'templates/timeseries.html',
          controller: 'TimeSeriesCtrl'
        }
      }
  })

  $urlRouterProvider.otherwise('/app/home');
})

.config(function($ionicConfigProvider) {
  //$ionicConfigProvider.views.maxCache(5);
  $ionicConfigProvider.backButton.text('').icon('ion-chevron-left');
  $ionicConfigProvider.views.swipeBackEnabled(false);
})

.config(function($ionicNativeTransitionsProvider){
    $ionicNativeTransitionsProvider.setDefaultTransition({
        type: 'slide',
        direction: 'left',
        iosdelay: -1, // ms to wait for the iOS webview to update before animation kicks in, default -1
        androiddelay: -1, // same as above but for Android, default -1
        triggerTransitionEvent: 'beforeEnter'
    });
    $ionicNativeTransitionsProvider.enable(true);
});

;
