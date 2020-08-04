angular.module('senseEurAir.controllers', [])


/*
 * App controller
 * ----------------------------------------------------------------------
 */
.controller('AppCtrl', function($scope, $rootScope, $state, $ionicModal, $networkStatus,$ionicPlatform, $alerts, $database, $ionicPopup, $ionicNativeTransitions, $interval, TEXT){
  $scope.appCtrl = {
    isHeaderMenuOpen : false,
    isOnline : $networkStatus.isOnline
  };
    
  // /* This is to show alerts no matter in which view the user is */
  var lengthArrayAlerts = 0;
    
  $scope.shownalerts = {};
    
  $alerts.subscribeAlertEvent($scope, function alertFound() {
    $scope.alerts_main = $alerts.alerts;
    if($scope.alerts_main.length > lengthArrayAlerts){
      lengthArrayAlerts = $scope.alerts_main.length;
      if ($scope.alerts_main.length>0) {
        //var alert = $scope.alerts_main.shift();
        var alert = $scope.alerts_main[$scope.alerts_main.length-1];
        $scope.showConfirm(alert);
      }
    }  
  });


  // A confirm dialog
  $scope.showConfirm = function(alert) {
    //console.log(alert);  
    var confirmPopupWherever = $ionicPopup.confirm({
      title: 'Alert '+alert.pollutant,
      template: $alerts.alertText(alert),
      cssClass: 'customTimeSeriesAlert',
      okText: 'See'
    });
    /* i do this check periodically, this means you'll keep seeing the same alerts every time. I have to avoid this */
    $scope.shownalerts[alert.idPollutant.id+'_'+alert.timestamp]=true;
    confirmPopupWherever.then(function(res) {
      if(res) {
        $scope.alerts_main = []; /* if you have more than alert but you want to see one it's bothering to see other popups in the new view */
        $scope.timeseries(alert.station, alert.idPollutant, alert.networkSource);
      } else {
        //console.log('You are not sure');
      }
    });
  };

  //goToTimeseries
  $scope.timeseries = function(stationId, phenomenonId, networkSource){
    var tsparams = {
      station: stationId,
      phenomenon: phenomenonId,
      networkSource: networkSource
    }
    $ionicNativeTransitions.stateGo('app.timeseries', {tsparams: angular.toJson(tsparams)});
  };

  var intervalservice = function () { 
    $alerts.checkNewAlerts(); 
  }
  
  ionic.Platform.ready(function() {
    intervalservice();
    // $interval(intervalservice, 50000);
    setTimeout(function(){ $alerts.checkNewAlerts(); $interval(intervalservice, 50000); }, 8000);
    //$alerts.checkNewAlerts(); 
  });
    
  /* END of alerts */
    
    
    
    

  //Listen online / offline status
  document.addEventListener("offline", function(){
    console.log('Device goes offline');
    $networkStatus.isOnline = false;
    $scope.appCtrl.isOnline = $networkStatus.isOnline;
    $scope.$apply();
  }, false);
  document.addEventListener("online", function(){
    console.log('Device goes online');
    $networkStatus.isOnline = true;
    $scope.appCtrl.isOnline = $networkStatus.isOnline;
    $scope.$apply();
  }, false);

  $scope.openExternalLink = function(uri){
    ionic.Platform.ready(function() {
      cordova.InAppBrowser.open(uri, "_system");
    });
  };

  /* 
    Menu modals
  */
  // Acknowledgement
  $ionicModal.fromTemplateUrl('templates/modals/acknowledgement.html', {
    scope: $scope,
    id: 'acknowledgement'
  }).then(function(modal) {
    $scope.modal_acknowledgement = modal;
  });
  // Disclaimer
  $ionicModal.fromTemplateUrl('templates/modals/disclaimer.html', {
    scope: $scope,
    id: 'disclaimer'
  }).then(function(modal) {
    $scope.modal_disclaimer = modal;
  });
  // Legal notice
  $ionicModal.fromTemplateUrl('templates/modals/legalNotice.html', {
    scope: $scope,
    id: 'legalNotice'
  }).then(function(modal) {
    $scope.modal_legalNotice = modal;
  });
  // Privacy statement
  $ionicModal.fromTemplateUrl('templates/modals/privacyStatement.html', {
    scope: $scope,
    id: 'privacyStatement'
  }).then(function(modal) {
    $scope.modal_privacyStatement = modal;
  });



  var dynamicLoadModalContent = true;

  $scope.openMenuModal = function(idModal){
    dynamicLoadModalContent = $scope.fetchModalContent(dynamicLoadModalContent);
    switch(idModal) {
        case 'acknowledgement':
            $scope.modal_acknowledgement.show();
            break;
        case 'disclaimer':
            $scope.modal_disclaimer.show();
            break;
        case 'legalNotice':
            $scope.modal_legalNotice.show();
            break;
        case 'privacyStatement':
            $scope.modal_privacyStatement.show();
            break;
        default:
            console.log("default");
    }
  };

  $scope.closeMenuModal = function(idModal){
    switch(idModal) {
        case 'acknowledgement':
            $scope.modal_acknowledgement.hide();
            break;
        case 'disclaimer':
            $scope.modal_disclaimer.hide();
            break;
        case 'legalNotice':
            $scope.modal_legalNotice.hide();
            break;
        case 'privacyStatement':
            $scope.modal_privacyStatement.hide();
            break;
        default:
            console.log("default");
    }
  };


  $scope.modalDynamic = {
    acknowledgement: "",
    disclaimer: "",
    legalNotice: "",
    privacyStatement: ""
  };

  $scope.fetchModalContent = function(executeOrNot){
    console.error("fetchModalContent");
    if (executeOrNot){
      //console.error("EXECUTE");
      $database.getGeneralContentsByLabel('acknowledgement').then(function(success){
        $scope.modalDynamic.acknowledgement = success.description;
      });
      $database.getGeneralContentsByLabel('disclaimer').then(function(success){
        $scope.modalDynamic.disclaimer = success.description;
      });
      $database.getGeneralContentsByLabel('legalNotice').then(function(success){
        $scope.modalDynamic.legalNotice = success.description;
      });
      $database.getGeneralContentsByLabel('privacyStatement').then(function(success){
        $scope.modalDynamic.privacyStatement = success.description;
      });
    } 
    //console.error("EXECUTE PAS");
    return false;
  };
  
  

  $scope.offlineMessage = TEXT.noConnection;
    
})

/*
 * Home page controller
 * ----------------------------------------------------------------------
 */
.controller('HomeCtrl', function($scope, $geolocationFactory, $dataConfig, $database, $ionicPlatform){
  //$geolocationFactory.get(); //Run get Geoocation to cache the result and setup directly the map
  /*$scope.getTest = function(){
    $database.getAllAirParameters().then(function(success){ console.log(success);}, function(error){ console.error(error);});
    $database.getAllMonitoringNetworks().then(function(success){ console.log(success);}, function(error){ console.error(error);});
    $database.getAllGeneralContents().then(function(success){ console.log(success);}, function(error){ console.error(error);});
    $database.getAllLastUpdate().then(function(success){ console.log(success);}, function(error){ console.error(error);});
  };*/

  //$alerts.checkNewAlerts(); 
  
})

/*
 * About controller
 * ----------------------------------------------------------------------
 */
.controller('AboutCtrl', function($scope, $database, CONFIG){
  $database.getGeneralContentsByLabel('about').then(function(success){
    $scope.dynamicContent = success.description;
  });//Use cacheFactory too? Need to run som performance test on different devices
})

/*
 * Links page controller
 * ----------------------------------------------------------------------
 */
.controller('LinksCtrl', function($scope, $database, CONFIG){
  $database.getGeneralContentsByLabel('links').then(function(success){
    $scope.dynamicContent = success.description;
  });//Use cacheFactory too? Need to run som performance test on different devices@
})

/*
 * Contact page controller
 * ----------------------------------------------------------------------
 */
.controller('ContactCtrl', function($scope, $database, CONFIG, $alerts){
  //$scope.email = CONFIG.contactMail;
  $database.getGeneralContentsByLabel('contact').then(function(success){
    $scope.dynamicContent = success.description;
  });//Use cacheFactory too? Need to run som performance test on different devices

  //$alerts.checkNewAlerts();
})

/*
 * Meteo parameters controller
 * ----------------------------------------------------------------------
 */
.controller('MeteoCtrl', function($scope, $ionicScrollDelegate, $cacheFactory, $database){
  $scope.meteos = [];

  $database.getAllAirParametersByType('meteo').then(function(meteos){
    $scope.meteos = meteos;
  });

  /*
    if given group is the selected group, deselect it
    else, select the given group
  */
  $scope.toggleGroup = function(group) {
    if ($scope.isGroupShown(group)) {
      $scope.shownGroup = null;
    } else {
      $scope.shownGroup = group;
    }
    $ionicScrollDelegate.resize();
  };
  $scope.isGroupShown = function(group) {
    return $scope.shownGroup === group;
  };
})

/*
 * Pollutants parameters controller
 * ----------------------------------------------------------------------
 */
.controller('PollutantsCtrl', function($scope, $ionicScrollDelegate, $database, $pollutants){

  /*
    if given group is the selected group, deselect it
    else, select the given group
  */
  $scope.toggleGroup = function(group) {
    if ($scope.isGroupShown(group)) {
      $scope.shownGroup = null;
    } else {
      $scope.shownGroup = group;
    }
    $ionicScrollDelegate.resize(); //Resize window when group toogled, because iOS can't do it by himself in that case apparently...
  };
  $scope.isGroupShown = function(group) {
    return $scope.shownGroup === group;
    //$ionicScrollDelegate.resize();
  };

  $database.getAllAirParametersByType('pollutant').then(function(pollutants){
    $scope.pollutants = pollutants;
  }, function(error){
    //console.error(error);
  });

})

/*
 * Network controller
 * Setup the base URI here
 * ----------------------------------------------------------------------
 */
.controller('NetworkCtrl', function($scope, $ionicLoading, $ionicPopup, $database, $networksSources, CONFIG){
  $scope.dataSources = CONFIG.dataSources;
  $database.getAllMonitoringNetworks().then(function(networks){
    $scope.networks = networks;
  });

  $scope.selectNetworks = function(id, selected, APIurl, index){

    var updateNetwork = function(id, visible){
       $database.selectMonitoringNetwork(id, visible).then(
        function(success){;
          $networksSources.set(); // move this function when leaving the page? ionicOnLeave?
          $database.getAllMonitoringNetworks().then(function(networks){
            $scope.networks = networks;
            //console.log(networks);
          });
        }, function(error){ 
          console.error(error);
        }
      );
    }

    console.log("========================================");
    console.log(APIurl);
    console.log("========================================");
    var visible;
    if (selected === 'true'){
      visible = 'false';
      updateNetwork(id, visible);
      $scope.networks[index].selected = visible;
      //console.log($scope.networks[index].selected, index);
      //console.log("uncheck");
    }else{
      $ionicLoading.show({
        template: "<ion-spinner icon='bubbles'></ion-spinner>"
      });
      $networksSources.networkStatus(APIurl).then(function(success){
        visible = 'true';
        updateNetwork(id, visible);
        $scope.networks[index].selected = visible;
        //console.log("check");
        //console.log($scope.networks[index].selected, index);
        $ionicLoading.hide();
      }, function(error){
        visible = 'false';
        //console.log("remain uncheck");
        //console.log($scope.networks[index].selected, index);
        //console.log($scope.networks[index], index);
        //console.log($scope.networks, index);
        $scope.networks[index].selected = 'false';
        updateNetwork(id, 'false');
        $ionicLoading.hide();
        $ionicPopup.alert({
          title: ' Unable to connect to this network.',
          template: 'This network is currently unavailable or an error has occurred.'
        });
      });
      //visible = 'true';
    }
  };

  //Check if all monitoring networks are reachable/online when leaving this page
  // $scope.$on("$ionicView.beforeLeave", function(event, data){
  //    $networksSources.statusNetworks();
  // });
  

})

/*
 * Sensor Map controller
 * ----------------------------------------------------------------------
 */
.controller('MapCtrl', function($scope, $state, $stateParams, $ionicNativeTransitions, $AirSensEUR, $database, $geolocationFactory, $ionicLoading){

  $ionicLoading.show({
    template: "<ion-spinner icon='bubbles'></ion-spinner>"
  });

  $scope.$on('$destroy', function() {
    $geolocationFactory.clearWatch();
  });

  //var id_phenomenon = $stateParams.id_phenomenon;
  var label_phenomenon = $stateParams.label_phenomenon;
  var currentPosition = $geolocationFactory.coordinates;

  //Generate the map
  //
  var map = L.map('map', {
    center: [currentPosition.latitude ,currentPosition.longitude],
    zoom: 5,
    minZoom: 3,
    zoomControl: false,
    attributionControl: false
  }); 

  L.tileLayer('https://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);

  map.on('click', function(e){
    if ($scope.additionnalInfo.contentSelected){
      $scope.additionnalInfo.contentSelected = false;

      if (label_phenomenon == -1){
        $scope.additionnalInfo.selectedStation = '';
      }else{
       $scope.additionnalInfo.selectedStation = presetphenomenon;
      }

      $scope.additionnalInfo.listphenomenon = [];
      $scope.additionnalInfo.markerSelected.setIcon(normalIcon);
      $scope.additionnalInfo.markerSelected = null;
      $scope.$apply();
    }
  });



  //Generate the markers
  //
  var markersCluster = L.markerClusterGroup(); //Create group container of marker for Cluster

  var normalIcon = L.icon({
    iconUrl: "img/custom-marker-icon.png",
    iconRetinaUrl: "img/custom-marker-icon-2x.png",
    shadowUrl: "lib/leaflet/images/marker-shadow.png",
    iconSize: 25,
    iconAnchor: [12, 40]
  });

  var selectedIcon = L.icon({
    iconUrl: "img/custom-marker-icon-selected.png",
    iconRetinaUrl: "img/custom-marker-icon-selected-2x.png",
    shadowUrl: "lib/leaflet/images/marker-shadow.png",
    iconSize: 25,
    iconAnchor: [12, 40]
  });

  var userIcon = L.icon({
    iconUrl: "img/user-marker.png",
    iconRetinaUrl: "img/user-marker-2x.png",
    shadowUrl: "lib/leaflet/images/marker-shadow.png",
    iconSize: 20,
    iconAnchor: [10, 35]
  });

 // L.marker([currentPosition.latitude ,currentPosition.longitude], {icon: userIcon}).addTo(map);
  var centerMarker = L.marker([currentPosition.latitude ,currentPosition.longitude], {icon: userIcon}).addTo(map);
  var updatePosition = function(position){
    centerMarker.setLatLng([position.coords.latitude, position.coords.longitude]);
    $geolocationFactory.coordinates = {longitude: position.coords.longitude, latitude: position.coords.latitude};
    //console.log('There is a new position : ', position);
  };
  $geolocationFactory.watchPosition(updatePosition);

  //If user come from home, id_phenomenon will be -1 = unselected
  //If user select a pollutant or meteo param. from the specific page, we retrieve the corresponding id
  if (label_phenomenon == -1){
    $AirSensEUR.getAllStations().then( //retrieve all stations from the server
      function(success){
        //console.log(success);
        angular.forEach(success, function(station, networkSource){
          //station[networkSource] = networkSource;
          setUpMarker(station, networkSource);
        });
        $ionicLoading.hide();
        //setUpMarker(success);
      },
      function(error){
        console.error("Error retrieving all Stations");
        console.error(error);
        $ionicLoading.hide();
      }
    );
  }else{
    // $AirSensEUR.getAllStationsByphenomenon(id_phenomenon).then( 
    $AirSensEUR.getAllStationsByphenomenon(label_phenomenon).then( 
      function(success){
        //console.log(success);
        angular.forEach(success, function(stations, networkSource){
          setUpMarker(stations, networkSource);
        });
        $ionicLoading.hide();
        //setUpMarker(success);
      },
      function(error){
        console.error("Error retrieving all Stations by phenomenon");
        console.error(error);
        $ionicLoading.hide();
      }
    );
  }
    

  //Set up each markers with properties
  //
  var setUpMarker = function(stations, networkSource){ 
    angular.forEach(stations, function(station, key){
      var marker = L.marker(L.latLng(station.geometry.coordinates[1], station.geometry.coordinates[0]), {icon: normalIcon}).on('click', function(e){
        $scope.additionnalInfo.selectedStation = station;
        selectStation(station.properties.id, networkSource);
        $scope.additionnalInfo.contentSelected = true;
        if ($scope.additionnalInfo.markerSelected != null){
          $scope.additionnalInfo.markerSelected.setIcon(normalIcon);
        }
        this.setIcon(selectedIcon);
        $scope.additionnalInfo.markerSelected = this;
      });
      //marker.setIcon()
      markersCluster.addLayer(marker);
    });
    map.addLayer(markersCluster);
  };

  var presetphenomenon = "";
  var selectStation = function(idStation, networkSource){
    $scope.additionnalInfo.networkSource = networkSource;
    $AirSensEUR.getStation(idStation, networkSource).then(
      function(success){
        // console.log(success);
      },
      function(error){
        // console.error(error);
      }
    );
    // $AirSensEUR.getphenomenonFromStation(idStation, networkSource).then(
    $AirSensEUR.getphenomenonFromStation(idStation, networkSource).then(
      function(success){
        // console.log("success getphenomenonFromStation");
        // console.log(success);
        $scope.additionnalInfo.listphenomenon = success;
        label_phenomenon = label_phenomenon.trim();
        if (label_phenomenon != -1){
          $database.getSelectedMonitoringNetworkByAPIurl(networkSource).then(
            function(monitoringNetworks){
              var airParamsMapping = angular.fromJson(monitoringNetworks.airParamsMapping);
              var i = 0;
              var exitBool = false;
              while (i< success.length && exitBool === false){
                if(airParamsMapping[label_phenomenon].id == success[i].id){
                  $scope.additionnalInfo.selectedphenomenon = success[i];
                  presetphenomenon = success[i];
                  exitBool = true;
                }
                i++;
              }
          }, function(error){ 
              console.error('$database.getSelectedMonitoringNetworkByAPIurl', error); 
            }
          );

          // var i = 0;
          // var exitBool = false;
          // while (i< success.length && exitBool === false){
          //   if(id_phenomenon == success[i].id){
          //     $scope.additionnalInfo.selectedphenomenon = success[i];
          //     presetphenomenon = success[i];
          //     exitBool = true;
          //   }
          //   i++;
          // }
        }else{
          //console.error('OUT');
        }

        //if a phenomenon is already selected, setup the selected param to this one
      },
      function(error){
        console.error(error);
      }
    );
  };

  //Map additional information div
  //
  $scope.additionnalInfo = {
    visible: true,
    contentSelected: false,
    selectedStation: null,
    markerSelected: null,
    selectedphenomenon: "",
    listphenomenon: [],
    selectedNetworkSource: ""
  };

  //goToTimeseries
  $scope.timeseries = function(){
    if ($scope.additionnalInfo.selectedStation.properties.id !== undefined && $scope.additionnalInfo.selectedStation.properties.id !== 'undefined' && $scope.additionnalInfo.selectedStation.properties.id !== null
    && $scope.additionnalInfo.selectedphenomenon !== "" && $scope.additionnalInfo.selectedphenomenon !== undefined && $scope.additionnalInfo.selectedphenomenon !== "undefined"){
      var tsparams = {
        station: $scope.additionnalInfo.selectedStation,
        phenomenon: $scope.additionnalInfo.selectedphenomenon,
        networkSource: $scope.additionnalInfo.networkSource
      }
      //$state.go('app.timeseries', {tsparams: angular.toJson(tsparams)});
      $ionicNativeTransitions.stateGo('app.timeseries', {tsparams: angular.toJson(tsparams)});
    }
  };

})

/*
 * TimeSeries controller
 * ----------------------------------------------------------------------
 */
.controller('TimeSeriesCtrl', function($scope, $stateParams, $filter, $ionicLoading, $ionicPopup, $AirSensEUR, $ionicGesture){

  var tsparams = angular.fromJson($stateParams.tsparams);
  var stationId = tsparams.station.properties.id;
  var phenomenon = tsparams.phenomenon;
  var networkSource = tsparams.networkSource;
  $scope.stationName = tsparams.station.properties.label;

  $scope.timeSeries = {
    listphenomenon : [],
    timeSerie: "",
    selectedphenomenon: phenomenon,
    activeTab: "lineChart"
  };
    
  // Error message popup
  var showAlert = function(title, message) {
    var alertPopup = $ionicPopup.alert({
      title: title,
      template: message,
      cssClass: 'customTimeSeriesAlert'
    });
  };


  $scope.$on("$ionicView.beforeEnter", function(event, data){
    // handle event
    $scope.chartObject = {
      chart: '',
      init: 0
    };

    $scope.lineChart = {
      options: {
        "chart": {
          "type": "lineChart",
          "useInteractiveGuideline": false,
          "xAxis": {
            "axisLabel": "Time",
            // "tickFormat": function(d) { return d3.time.format('%Y/%m/%d ')(new Date(d)); }
            // "tickFormat": function(d) { return d3.time.format($scope.timeFormatF($scope.timeSerie.lastValue.timestamp-86400000, $scope.timeSerie.lastValue.timestamp, 'chart'))(new Date(d)); }
            "tickFormat": function(d) { return d3.time.format($scope.dateFormat.formatChart)(new Date(d)); },
            "tickPadding": 10
          },
          "yAxis": {
            "axisLabel": $scope.timeSerie.uom,
            //"axisLabelDistance": -10
          },
          "zoom": {
            "enabled": true,
            "scaleExtent": [
              1,
              10
            ],
            "useFixedDomain": false,
            "useNiceScale": true,
            "horizontalOff": false,
            "verticalOff": true,
          },
          "tooltip":{
            "enabled": false
          },
          callback: function(chart){
            $scope.chartObject.chart = chart;
            $scope.axisDomain = {
              min: Math.round($scope.chartObject.chart.xDomain()[0]),
              max: Math.round($scope.chartObject.chart.xDomain()[1])
            };
            if ($scope.chartObject.init === 0){
              $scope.getRawData();
            }
            console.log('callbak chart created');
          }
        },
        "title": {
          "enable": false,
        },
        "subtitle": {
          "enable": false
        },
        "caption": {
          "enable": false
        }
      },
      data: []
    };
  });





  // Phenomenon
  $AirSensEUR.getphenomenonFromStation(stationId, networkSource).then(
    function(success){
      $scope.timeSeries.listphenomenon = success;
    },
    function(error){
      console.error(error);
    }
  );


  //Get Data
  $scope.timeSerie = -1; //-1 = no selected
  $scope.rawData = [];
  
  //var lastValue;
  $scope.isItTemperature = function(){
    var res = $scope.timeSeries.selectedphenomenon.label.match(/temperature/gi);
    if (res != null){
      return false;
    }else{
      return true
    }
  };

  $scope.getRawData = function(){
    $ionicLoading.show({
      template: "<ion-spinner icon='bubbles'></ion-spinner>"
    });

    $AirSensEUR.getTimeSeries(stationId, $scope.timeSeries.selectedphenomenon.id, networkSource).then(
      function(success){
        console.log("..............................");
        console.log(success);
        console.log("..............................");
        if (success.length > 0) {
            $scope.timeSerie = success[0];
            if($scope.timeSerie.hasOwnProperty('lastValue')){
              var timespan = $filter('date')(new Date($scope.timeSerie.lastValue.timestamp), "yyyy-MM-dd"); //86400000 = 24h
              timespan += "/P1D";
              $AirSensEUR.getTimeSeriesData($scope.timeSerie.id, timespan, networkSource).then(
                  function(success){
                    //console.log("success getTimeSeriesData");
                    //console.log(success);
                    //if (success no empty) else error
                    $scope.rawData = success[$scope.timeSerie.id].values;
                    if(success[$scope.timeSerie.id].values.length < 1){
                      showAlert('No result', 'The selected timeseries have no values in the given time range or an error has occured');
                      $ionicLoading.hide();
                    }else{
                      rawDataToD3($scope.rawData);
                      $ionicLoading.hide();
                    }
                    $scope.chartObject.init++;
                  },
                  function(error){
                    console.log(error);
                    $scope.chartObject.init++;
                    $scope.rawData = [];
                    $ionicLoading.hide();
                    if(error.userMessage == "Requested timespan is to long, please use a period shorter than 'P1Y1D'"){
                       showAlert('No result', 'Please use a period shorter than 1 year');
                    }else{
                      showAlert('No result', 'The selected timeseries have no values in the given time range or an error has occured');
                    }
                  }
              );
            }else{
              showAlert('No result', 'The selected timeseries have no values in the given time range or an error has occured');
              $ionicLoading.hide();
            }
        } else {
              showAlert('No result', 'The selected timeseries have no values in the given time range or an error has occured');
              $ionicLoading.hide();
        }
      },
      function(error){
        console.error('error $AirSensEUR.getTimeSeries');
        console.error(error);
        $ionicLoading.hide();
      }
    );
  };

  // $scope.getRawData();


  $scope.dateFormat = {
    formatChart: "%H:%M",
    formatRawAngular: "HH:mm:ss:sss",
    formatButtonAngular: "yyyy/MM/dd"
  }

  $scope.timeFormatF = function(dateFrom, dateTo, type){
    //timestamp in millisecondes 000
    var interval = dateTo - dateFrom;
    var formatChart = "";
    var formatRawAngular = "";
    var formatButtonAngular = "";
    if (interval <= 3600000){
      // formatChart = "%M:%S:%L";
      // formatRawAngular = "mm:ss:sss";
      // formatButtonAngular = "MM/dd HH:mm";
      $scope.dateFormat = {
        formatChart: "%M:%S:%L",
        formatRawAngular: "mm:ss:sss",
        // formatButtonAngular: "MM/dd HH:mm"
        formatButtonAngular: "yyyy/MM/dd"
      }
    }else if (interval > 3600000 && interval <= 86400000){
      // formatChart = "%H:%M";
      // formatRawAngular = "HH:mm:ss:sss";
      // formatButtonAngular = "MM/dd";
      $scope.dateFormat = {
        formatChart: "%H:%M",
        formatRawAngular: "HH:mm:ss",
        // formatButtonAngular: "MM/dd"
        formatButtonAngular: "yyyy/MM/dd"
      }
    }else if (interval > 86400000 && interval <= 2628000000){
      // formatChart = "%d %H:%M";
      // formatRawAngular = "MM/dd HH:mm:ss";
      // formatButtonAngular = "MM/dd";
      $scope.dateFormat = {
        formatChart: "%d %H:%M",
        formatRawAngular: "MM/dd HH:mm:ss",
        // formatButtonAngular: "MM/dd"
        formatButtonAngular: "yyyy/MM/dd"
      }
    }else if (interval > 2628000000 && interval <= 31540000000){
      // formatChart = "%m/%d";
      // formatRawAngular = "yyyy/MM/dd HH:mm";
      // formatButtonAngular = "yyyy/MM/dd";
      $scope.dateFormat = {
        formatChart: "%m/%d",
        formatRawAngular: "yyyy/MM/dd HH:mm",
        // formatButtonAngular: "yyyy/MM/dd"
        formatButtonAngular: "yyyy/MM/dd"
      }
    }else if (interval > 31540000000){
      //console.log("bigger interval");
      // formatChart = "%Y/%m/%d";
      // formatRawAngular = "yyyy/MM/dd";
      // formatButtonAngular = "MM/dd";
      $scope.dateFormat = {
        formatChart: "%Y/%m/%d",
        formatRawAngular: "yyyy/MM/dd",
        // formatButtonAngular: "MM/dd"
        formatButtonAngular: "yyyy/MM/dd"
      }
    }else{
      console.log("default");
      // formatChart = "%H:%M";
      // formatRawAngular = "HH:mm:ss:sss";
      // formatButtonAngular = "yyyy/MM/dd";
      $scope.dateFormat = {
        formatChart: "%H:%M",
        formatRawAngular: "HH:mm:ss:sss",
        // formatButtonAngular: "yyyy/MM/dd"
        formatButtonAngular: "yyyy/MM/dd"
      }
    }

    $scope.dateFormat = {
      formatChart: "%m/%d %H:%M",
      formatRawAngular: "HH:mm:ss",
      // formatButtonAngular: "yyyy/MM/dd"
      formatButtonAngular: "yyyy/MM/dd"
    }

    switch(type){
      case "chart":
        return formatChart;
        break;
      case "raw":
        return formatRawAngular;
        break;
      case "button":
        return formatButtonAngular;
        break;
      default:
        return formatRawAngular;
    }

  };

  $scope.toto = window.innerWidth;
  //$scope.chartObject;


  $scope.config = {
    refreshDataOnly: false,
    extended: false
  }
  //Line Chart
  /*$scope.lineChart = {
    options: {
      "chart": {
        "type": "lineChart",
        "useInteractiveGuideline": false,
        "xAxis": {
          "axisLabel": "Time",
          // "tickFormat": function(d) { return d3.time.format('%Y/%m/%d ')(new Date(d)); }
          // "tickFormat": function(d) { return d3.time.format($scope.timeFormatF($scope.timeSerie.lastValue.timestamp-86400000, $scope.timeSerie.lastValue.timestamp, 'chart'))(new Date(d)); }
          "tickFormat": function(d) { return d3.time.format($scope.dateFormat.formatChart)(new Date(d)); },
          "tickPadding": 10
        },
        "yAxis": {
          "axisLabel": $scope.timeSerie.uom,
          //"axisLabelDistance": -10
        },
        "zoom": {
          "enabled": true,
          "scaleExtent": [
            1,
            10
          ],
          "useFixedDomain": false,
          "useNiceScale": true,
          "horizontalOff": false,
          "verticalOff": true,
        },
        "tooltip":{
          "enabled": false
        },
        callback: function(chart){
          $scope.chartObject = chart;
          $scope.axisDomain = {
            min: Math.round($scope.chartObject.xDomain()[0]),
            max: Math.round($scope.chartObject.xDomain()[1])
          };
          console.log('callbak chart created', chart);
        }
      },
      "title": {
        "enable": false,
      },
      "subtitle": {
        "enable": false
      },
      "caption": {
        "enable": false
      }
    },
    data: []
  };*/

  
  /* Swipe gesture gets fired only on big changes, drag get fired on small changes but not on end. I have to kind-of-monitoring when it's done */
  var dragmonitor;  
    
  $scope.dragEvent = function(){
      clearTimeout(dragmonitor);
      dragmonitor = setTimeout($scope.touchEvent, 500);
  }
             
  $scope.touchEvent = function(){
    var minX = Math.round($scope.chartObject.chart.xDomain()[0]);
    var maxX = Math.round($scope.chartObject.chart.xDomain()[1]);
    /*if (
      (minX>$scope.axisDomain.min && maxX>$scope.axisDomain.max) || (minX<$scope.axisDomain.min && maxX<$scope.axisDomain.max) ||
      (minX<$scope.axisDomain.min && maxX>$scope.axisDomain.max)
    ){*/
    if (
      minX != $scope.axisDomain.min || maxX != $scope.axisDomain.max
    ){
      $scope.dateFrom = minX;
      $scope.dateTo = maxX;
      $scope.newDataInterval(false);
    }else{
      $scope.dateFrom = minX;
      $scope.dateTo = maxX;
    }
  };

  

  var rawDataToD3 = function(rawData){
    var valueLineChart = [];
    var valueBarChart = [];
    var tmp = [];
    angular.forEach(rawData, function(value, key){
      //console.log("value : ",value, " key: ", key);
      valueLineChart.push({x: value[0] , y: value[1]});
      tmp = [value[0], value[1]];
      valueBarChart.push(tmp);
    });

    $scope.lineChart.data = [
      {
        values: valueLineChart,
        key: $scope.timeSerie.uom,
        color: '#04BFBF'
      }
    ];

    $scope.dateFrom = valueLineChart[0].x;
    $scope.dateTo = valueLineChart[valueLineChart.length-1].x;

    $scope.chartObject.chart.xDomain([$scope.dateFrom, $scope.dateTo]);

    $scope.timeFormatF($scope.dateFrom, $scope.dateTo, 'dummy');
  };


  // TODO: Optimised this function
  $scope.newDataInterval = function(refreshDirective){
    $ionicLoading.show({
      template: "<ion-spinner icon='bubbles'></ion-spinner>"
    });
    var dateFrom = $filter('date')(new Date($scope.dateFrom), "yyyy-MM-dd")+"T"+$filter('date')(new Date($scope.dateFrom), "hh:mm:ss")+"Z";
    var dateTo = $filter('date')(new Date($scope.dateTo), "yyyy-MM-dd")+"T"+$filter('date')(new Date($scope.dateTo), "hh:mm:ss")+"Z";
    if (dateFrom == dateTo){
      var timespan = dateFrom+"/P1D";
      //var timespan = dateFrom+"/"+dateTo;
    }else{
      var timespan = dateFrom+"/"+dateTo;
    }
    
    //If interval too long ==> error data interval too long.
    $AirSensEUR.getTimeSeriesData($scope.timeSerie.id, timespan, networkSource).then(
      function(success){
        //console.log("succesNewDataInterval", success);
        // $scope.rawData = success[$scope.timeSerie.id].values;
        if(success[$scope.timeSerie.id].values.length < 1){
          showAlert('No result', 'The selected timeseries have no values in the given time range or an error has occured');
          $ionicLoading.hide();
        }else{
          $scope.rawData = success[$scope.timeSerie.id].values;
          if (refreshDirective){
            $scope.config.refreshDataOnly = false;
          }else{
            $scope.config.refreshDataOnly = true;
          }
          rawDataToD3($scope.rawData);
          $ionicLoading.hide();
        }
      },
      function(error){
        console.log(error);
        //$scope.rawData = [];
        $ionicLoading.hide();
        if(error.userMessage == "Requested timespan is to long, please use a period shorter than 'P1Y1D'"){
           showAlert('No result', 'Please use a period shorter than 1 year');
        }else{
          showAlert('No result', 'The selected timeseries have no values in the given time range or an error has occured');
        }
      }
    );
  };

  //Date management, TMP!!
  $scope.selectDate = function(selectedDateTimestamp, fromOrTo){
    if (ionic.Platform.isAndroid()){
      var maxDate = parseInt($scope.timeSerie.lastValue.timestamp);
    }else{
      var maxDate = new Date($scope.timeSerie.lastValue.timestamp);
    }
    var optionsDate = {
      date: new Date(selectedDateTimestamp),
      //date: parseInt(selectedDateTimestamp),
      mode: 'date',
      //minDate: '',
      maxDate: maxDate, //minDate is a Date object for iOS and a millisecond precision unix timestamp for Android, so you need to account for that when using the plugin. Also, on Android, only the date is enforced (time is not).
      doneButtonLabel: 'OK',
      doneButtonColor: '#000000',
      cancelButtonLabel: 'CANCEL',
      cancelButtonColor: '#000000'
    };

    datePicker.show(optionsDate, function(success){
      if (success === "" || success == undefined || success == 'undefined' || success=="Invalid Date"){
        //do nothing
      }else{
        if (fromOrTo === 'from'){
          $scope.dateFrom = success.getTime();
        }else if (fromOrTo === 'to'){
          $scope.dateTo = success.getTime();
        }
        $scope.$apply();
      }
        
    }, function(error){
      console.error('errorDatePicking', error);
    });
  };

})


/*
 * Alerts page controller
 * ----------------------------------------------------------------------
 */
.controller('AlertsCtrl', function($scope, $state, $ionicPopup, $ionicNativeTransitions, $alerts, $ionicLoading){
  $scope.$on("$ionicView.beforeEnter", function(event, data){
    /*$ionicLoading.show({
      template: "<ion-spinner icon='bubbles'></ion-spinner>"
    });*/
  });
  $scope.alerts = $alerts.alerts;
    
  $alerts.checkNewAlerts();

  $alerts.subscribeAlertEvent($scope, function alertFound() {
      // Handle notification
      $scope.alerts = $alerts.alerts;
      $ionicLoading.hide();
      //console.log('ctr event');
  });
  

  // A confirm dialog
  $scope.showConfirm = function(alert) {
    var confirmPopup = $ionicPopup.confirm({
      title: 'Alert '+alert.pollutant,
      template: $alerts.alertText(alert),
      cssClass: 'customTimeSeriesAlert',
      okText: 'See'
    });

    confirmPopup.then(function(res) {
      if(res) {
        $scope.timeseries(alert.station, alert.idPollutant, alert.networkSource);
      } else {
      }
    });
  };

  //goToTimeseries
  $scope.timeseries = function(stationId, phenomenonId, networkSource){
    var tsparams = {
      station: stationId,
      phenomenon: phenomenonId,
      networkSource: networkSource
    }
    //$state.go('app.timeseries', {tsparams: angular.toJson(tsparams)});
    $ionicNativeTransitions.stateGo('app.timeseries', {tsparams: angular.toJson(tsparams)});
  };

})
;
