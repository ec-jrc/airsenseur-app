angular.module('senseEurAir.controllers', [])


/*
 * App controller
 * ----------------------------------------------------------------------
 */
.controller('AppCtrl', function($scope, $rootScope, $state, $ionicModal){
  $scope.appCtrl = {
    isHeaderMenuOpen : false
  };

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

  $scope.openMenuModal = function(idModal){
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
    
})

/*
 * Home page controller
 * ----------------------------------------------------------------------
 */
.controller('HomeCtrl', function($scope, $geolocationFactory, $dataConfig, $database){
  $geolocationFactory.get(); //Run get Geoocation to cache the result and setup directly the map
  console.log('home');
  $scope.test = function(){
    // $dataConfig.populateDatabase().then(function(success){
    //   console.log(success);
    // }, function(error){console.error(error);});
  };
  $scope.getTest = function(){
    $database.getAllAirParameters().then(function(success){ console.log(success);}, function(error){ console.error(error);});
    $database.getAllMonitoringNetworks().then(function(success){ console.log(success);}, function(error){ console.error(error);});
    $database.getAllGeneralContents().then(function(success){ console.log(success);}, function(error){ console.error(error);});
    $database.getAllLastUpdate().then(function(success){ console.log(success);}, function(error){ console.error(error);});
  };
  
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
.controller('ContactCtrl', function($scope, $database, CONFIG){
  //$scope.email = CONFIG.contactMail;
  $database.getGeneralContentsByLabel('contact').then(function(success){
    $scope.dynamicContent = success.description;
  });//Use cacheFactory too? Need to run som performance test on different devices
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
  // $scope.pollutants = [
  //   {label: "Temperature (in degrees centigrade)", id: "", description: ""},
  //   {label: "Atmospheric pressure (in hectoPascal)",id: "", description: ""},
  //   {label: "Relative humidity (in %)",id: "", description: ""}
  // ];
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
    $ionicScrollDelegate.resize(); //Resize window when group toogled, because iOS can't do it by himself is that case apparently...
  };
  $scope.isGroupShown = function(group) {
    return $scope.shownGroup === group;
    //$ionicScrollDelegate.resize();
  };

  $database.getAllAirParametersByType('pollutant').then(function(pollutants){
    $scope.pollutants = pollutants;
    console.log(pollutants);
  }, function(error){
    console.error(error);
  });

})

/*
 * Network controller
 * Setup the base URI here
 * ----------------------------------------------------------------------
 */
.controller('NetworkCtrl', function($scope, $database, CONFIG){
  $scope.dataSources = CONFIG.dataSources;
  $database.getAllMonitoringNetworks().then(function(networks){
    $scope.networks = networks;
  });

  // $scope.selectNetworks = function(id, selected){
  //   $database.selectMonitoringNetwork(id, selected);
  // };
  $scope.selectNetworks = function(id, selected){
    console.log(id);
    var visible;
    console.log("selectNetworks visilbe init = "+selected);
    if (selected === 'true'){
      visible = 'false';
    }else{
      visible = 'true';
    }
    $database.selectMonitoringNetwork(id, visible).then(function(success){console.log(success);}, function(error){ console.error(error);});
  };

})

/*
 * Sensor Map controller
 * ----------------------------------------------------------------------
 */
.controller('MapCtrl', function($scope, $state, $stateParams, $AirSensEUR, $geolocationFactory){

  var id_phenomenon = $stateParams.id_phenomenon;
  var currentPosition = $geolocationFactory.coordinates;
  console.log(id_phenomenon);

  //Generate the map
  //
  var map = L.map('map', {
    center: [currentPosition.latitude ,currentPosition.longitude],
    zoom: 5,
    minZoom: 3,
    zoomControl: false,
    attributionControl: false
  }); 

  L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);

  map.on('click', function(e){
    console.log('clickOnMap');
    if ($scope.additionnalInfo.contentSelected){
      console.log('there is a selected content');
      $scope.additionnalInfo.contentSelected = false;

      if (id_phenomenon == -1){
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

  L.marker([currentPosition.latitude ,currentPosition.longitude], {icon: userIcon}).addTo(map);

  //If user come from home, id_phenomenon will be -1 = unselected
  //If user select a pollutant or meteo param. from the specific page, we retrieve the corresponding id
  if (id_phenomenon == -1){
    $AirSensEUR.getAllStations().then( //retrieve all stations from the server
      function(success){
        setUpMarker(success);
      },
      function(error){
        console.error("Error retrieving all Stations");
        console.error(error);
      }
    );
  }else{
    $AirSensEUR.getAllStationsByphenomenon(id_phenomenon).then( 
      function(success){
        setUpMarker(success);
      },
      function(error){
        console.error("Error retrieving all Stations by phenomenon");
        console.error(error);
      }
    );
  }
    

  //Set up each markers with properties
  //
  var setUpMarker = function(stations){ 
    angular.forEach(stations, function(station, key){
      console.log(station);

      var marker = L.marker(L.latLng(station.geometry.coordinates[1], station.geometry.coordinates[0]), {icon: normalIcon}).on('click', function(e){
        $scope.additionnalInfo.selectedStation = station;
        selectStation(station.properties.id);
        $scope.additionnalInfo.contentSelected = true;
        if ($scope.additionnalInfo.markerSelected != null){
          $scope.additionnalInfo.markerSelected.setIcon(normalIcon);
        }
        this.setIcon(selectedIcon);
        $scope.additionnalInfo.markerSelected = this;
        // console.log(this);
      });
      //marker.setIcon()
      markersCluster.addLayer(marker);
    });
    map.addLayer(markersCluster);
  };

  var presetphenomenon = "";
  var selectStation = function(idStation){
    $AirSensEUR.getStation(idStation).then(
      function(success){
        // console.log(success);
      },
      function(error){
        // console.error(error);
      }
    );
    $AirSensEUR.getphenomenonFromStation(idStation).then(
      function(success){
        // console.log("success getphenomenonFromStation");
        // console.log(success);
        $scope.additionnalInfo.listphenomenon = success;
        if (id_phenomenon > -1){
          var i = 0;
          var exitBool = false;
          while (i< success.length && exitBool === false){
            if(id_phenomenon == success[i].id){
              $scope.additionnalInfo.selectedphenomenon = success[i];
              presetphenomenon = success[i];
              exitBool = true;
            }
            i++;
          }
        }

        //if a phenomenon is already selected, setup the selected param to this one
      },
      function(error){
        console.error(error);
      }
    );
  };

  //phenomenon
  //
  //$scope.selectedphenomenon = "";

  //Map additional information div
  //
  $scope.additionnalInfo = {
    visible: true,
    contentSelected: false,
    selectedStation: null,
    markerSelected: null,
    selectedphenomenon: "",
    listphenomenon: []
  };

  //goToTimeseries
  $scope.timeseries = function(){
    console.log($scope.additionnalInfo.selectedphenomenon);
    if ($scope.additionnalInfo.selectedStation.properties.id !== undefined && $scope.additionnalInfo.selectedStation.properties.id !== 'undefined' && $scope.additionnalInfo.selectedStation.properties.id !== null
    && $scope.additionnalInfo.selectedphenomenon !== "" && $scope.additionnalInfo.selectedphenomenon !== undefined && $scope.additionnalInfo.selectedphenomenon !== "undefined"){
      var tsparams = {
        station: $scope.additionnalInfo.selectedStation,
        phenomenon: $scope.additionnalInfo.selectedphenomenon
      }
      $state.go('app.timeseries', {tsparams: angular.toJson(tsparams)});
    }
  };

})

/*
 * TimeSeries controller
 * ----------------------------------------------------------------------
 */
.controller('TimeSeriesCtrl', function($scope, $stateParams, $filter, $ionicLoading, $AirSensEUR){
  var tsparams = angular.fromJson($stateParams.tsparams);
  console.log(tsparams);
  var stationId = tsparams.station.properties.id;
  var phenomenon = tsparams.phenomenon;
  $scope.stationName = tsparams.station.properties.label;
  // console.log($stateParams);
  // console.log(stationId);
  // console.log(phenomenon);

  $scope.timeSeries = {
    listphenomenon : [],
    timeSerie: "",
    selectedphenomenon: phenomenon,
    activeTab: "raw"
  };


  // Phenomenon
  $AirSensEUR.getphenomenonFromStation(stationId).then(
    function(success){
      console.log("success getphenomenonFromStation");
      console.log(success);
      $scope.timeSeries.listphenomenon = success;
    },
    function(error){
      console.error(error);
    }
  );

  //$scope.selectedphenomenon = phenomenon;

  //Get Data
  $scope.timeSerie = -1; //-1 = no selected
  $scope.rawData = [];

  $scope.getRawData = function(){
    $ionicLoading.show({
      template: "<ion-spinner icon='bubbles'></ion-spinner>"
    });

    $AirSensEUR.getTimeSeries(stationId, $scope.timeSeries.selectedphenomenon.id).then(
      function(success){
        console.log('success $AirSensEUR.getTimeSeries');
        console.log(success);

        $scope.timeSerie = success[0];
        // var timespan = $filter('date')(new Date($scope.timeSerie.lastValue.timestamp-86400000), "yyyy-MM-ddThh:mm:ss"); //86400000 = 24h
        // timespan += "/"+$filter('date')(new Date($scope.timeSerie.lastValue.timestamp), "yyyy-MM-ddThh:mm:ss");
        var timespan = $filter('date')(new Date($scope.timeSerie.lastValue.timestamp), "yyyy-MM-dd"); //86400000 = 24h
        timespan += "/P1D";

        console.log("timespan!!");
        console.log($scope.timeSerie.lastValue.timestamp);
        console.log(timespan);


        $AirSensEUR.getTimeSeriesData($scope.timeSerie.id, timespan).then(
            function(success){
              console.log("success getTimeSeriesData");
              console.log(success);
              console.log(success[$scope.timeSerie.id]);
              $scope.rawData = success[$scope.timeSerie.id].values;
              rawDataToD3($scope.rawData);
              $ionicLoading.hide();
            },
            function(error){
              console.log(error);
              $ionicLoading.hide();
            }
        );

      },
      function(error){
        console.error('error $AirSensEUR.getTimeSeries');
        console.error(error);
        $ionicLoading.hide();
      }
    );
  };

  $scope.getRawData();


  //Line Chart
  $scope.lineChart = {
    options: {
      "chart": {
        "type": "lineChart",
        //"height": 450,
        // "margin": {
        //   "top": 20,
        //   "right": 20,
        //   "bottom": 40,
        //   "left": 55
        // },
        "useInteractiveGuideline": false,
        "dispatch": {},
        "xAxis": {
          "axisLabel": "Time",
          "tickFormat": function(d) { return d3.time.format('%c')(new Date(d)); }
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
          "useNiceScale": false,
          "horizontalOff": false,
          "verticalOff": true,
          "unzoomEventType": "dblclick.zoom"
        }
      },
      "title": {
        "enable": false,
        "text": "Title for Line Chart"
      },
      "subtitle": {
        "enable": false,
        "text": "Subtitle for simple line chart. Lorem ipsum dolor sit amet, at eam blandit sadipscing, vim adhuc sanctus disputando ex, cu usu affert alienum urbanitas.",
        "css": {
          "text-align": "center",
          "margin": "10px 13px 0px 7px"
        }
      },
      "caption": {
        "enable": false,
        "html": "<b>Figure 1.</b> Lorem ipsum dolor sit amet, at eam blandit sadipscing, <span style=\"text-decoration: underline;\">vim adhuc sanctus disputando ex</span>, cu usu affert alienum urbanitas. <i>Cum in purto erat, mea ne nominavi persecuti reformidans.</i> Docendi blandit abhorreant ea has, minim tantas alterum pro eu. <span style=\"color: darkred;\">Exerci graeci ad vix, elit tacimates ea duo</span>. Id mel eruditi fuisset. Stet vidit patrioque in pro, eum ex veri verterem abhorreant, id unum oportere intellegam nec<sup>[1, <a href=\"https://github.com/krispo/angular-nvd3\" target=\"_blank\">2</a>, 3]</sup>.",
        "css": {
          "text-align": "justify",
          "margin": "10px 13px 0px 7px"
        }
      }
    },
    data: []
  };

  //Bar Chart
  $scope.barChart = {
    // options: {
    //   "chart": {
    //     "type": "historicalBarChart",
    //     //"height": 450,
    //     "margin": {
    //       "top": 20,
    //       "right": 20,
    //       "bottom": 65,
    //       "left": 50
    //     },
    //     "showValues": true,
    //     "duration": 100,
    //     "xAxis": {
    //       "axisLabel": "X Axis",
    //       "rotateLabels": 30,
    //       "showMaxMin": false,
    //       "tickFormat": function(d) { return d3.time.format('%c')(new Date(d)); }
    //     },
    //     "yAxis": {
    //       "axisLabel": "Y Axis",
    //       "axisLabelDistance": -10
    //     },
    //     "tooltip": {},
    //     "zoom": {
    //       "enabled": true,
    //       "scaleExtent": [
    //         1,
    //         10
    //       ],
    //       "useFixedDomain": false,
    //       "useNiceScale": false,
    //       "horizontalOff": false,
    //       "verticalOff": true,
    //       "unzoomEventType": "dblclick.zoom"
    //     }
    //   }
    // },
        options:{
            chart: {
                type: 'historicalBarChart',
                height: 450,
                margin : {
                    top: 20,
                    right: 20,
                    bottom: 65,
                    left: 50
                },
                x: function(d){return d[0];},
                y: function(d){return d[1];},
                showValues: true,
                // valueFormat: function(d){
                //     return d3.format(',.1f')(d);
                // },
                duration: 100,
                xAxis: {
                    axisLabel: 'X Axis',
                    tickFormat: function(d) {
                        return d3.time.format('%c')(new Date(d))
                    },
                    rotateLabels: 30,
                    showMaxMin: false
                },
                yAxis: {
                    axisLabel: 'Y Axis',
                    // axisLabelDistance: -10,
                    tickFormat: function(d){
                        return d3.format('.6')(d);
                    }
                },
                tooltip: {
                    keyFormatter: function(d) {
                        return d3.time.format('%c')(new Date(d));
                    }
                },
                zoom: {
                    enabled: true,
                    scaleExtent: [1, 10],
                    useFixedDomain: false,
                    useNiceScale: false,
                    horizontalOff: false,
                    verticalOff: true,
                    unzoomEventType: 'dblclick.zoom'
                }
            }
        },
    data: []
  };

  var rawDataToD3 = function(rawData){
    var valueLineChart = [];
    var valueBarChart = [];
    var tmp = [];
    angular.forEach(rawData, function(value, key){
      valueLineChart.push({x: value[0] , y: value[1]});
      //console.log(value[1]);
      tmp = [value[0], value[1]];
      //console.log(tmp);
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

    $scope.barChart.data = [
            {
                "key" : $scope.timeSerie.uom ,
                "bar": true,
                "values": valueBarChart
                //"values" : [ [ 1136005200000 , 1271000.0] , [ 1138683600000 , 1271000.0] , [ 1141102800000 , 1271000.0] , [ 1143781200000 , 0] , [ 1146369600000 , 0] , [ 1149048000000 , 0] , [ 1151640000000 , 0] , [ 1154318400000 , 0] , [ 1156996800000 , 0] , [ 1159588800000 , 3899486.0] , [ 1162270800000 , 3899486.0] , [ 1164862800000 , 3899486.0] , [ 1167541200000 , 3564700.0] , [ 1170219600000 , 3564700.0] , [ 1172638800000 , 3564700.0] , [ 1175313600000 , 2648493.0] , [ 1177905600000 , 2648493.0] , [ 1180584000000 , 2648493.0] , [ 1183176000000 , 2522993.0] , [ 1185854400000 , 2522993.0] , [ 1188532800000 , 2522993.0] , [ 1191124800000 , 2906501.0] , [ 1193803200000 , 2906501.0] , [ 1196398800000 , 2906501.0] , [ 1199077200000 , 2206761.0] , [ 1201755600000 , 2206761.0] , [ 1204261200000 , 2206761.0] , [ 1206936000000 , 2287726.0] , [ 1209528000000 , 2287726.0] , [ 1212206400000 , 2287726.0] , [ 1214798400000 , 2732646.0] , [ 1217476800000 , 2732646.0] , [ 1220155200000 , 2732646.0] , [ 1222747200000 , 2599196.0] , [ 1225425600000 , 2599196.0] , [ 1228021200000 , 2599196.0] , [ 1230699600000 , 1924387.0] , [ 1233378000000 , 1924387.0] , [ 1235797200000 , 1924387.0] , [ 1238472000000 , 1756311.0] , [ 1241064000000 , 1756311.0] , [ 1243742400000 , 1756311.0] , [ 1246334400000 , 1743470.0] , [ 1249012800000 , 1743470.0] , [ 1251691200000 , 1743470.0] , [ 1254283200000 , 1519010.0] , [ 1256961600000 , 1519010.0] , [ 1259557200000 , 1519010.0] , [ 1262235600000 , 1591444.0] , [ 1264914000000 , 1591444.0] , [ 1267333200000 , 1591444.0] , [ 1270008000000 , 1543784.0] , [ 1272600000000 , 1543784.0] , [ 1275278400000 , 1543784.0] , [ 1277870400000 , 1309915.0] , [ 1280548800000 , 1309915.0] , [ 1283227200000 , 1309915.0] , [ 1285819200000 , 1331875.0] , [ 1288497600000 , 1331875.0] , [ 1291093200000 , 1331875.0] , [ 1293771600000 , 1331875.0] , [ 1296450000000 , 1154695.0] , [ 1298869200000 , 1154695.0] , [ 1301544000000 , 1194025.0] , [ 1304136000000 , 1194025.0] , [ 1306814400000 , 1194025.0] , [ 1309406400000 , 1194025.0] , [ 1312084800000 , 1194025.0] , [ 1314763200000 , 1244525.0] , [ 1317355200000 , 475000.0] , [ 1320033600000 , 475000.0] , [ 1322629200000 , 475000.0] , [ 1325307600000 , 690033.0] , [ 1327986000000 , 690033.0] , [ 1330491600000 , 690033.0] , [ 1333166400000 , 514733.0] , [ 1335758400000 , 514733.0]]
            }];
            console.log($scope.barChart.data[0].values);
            console.log([ [ 1136005200000 , 1271000.0] , [ 1138683600000 , 1271000.0] , [ 1141102800000 , 1271000.0] , [ 1143781200000 , 0] , [ 1146369600000 , 0] , [ 1149048000000 , 0] , [ 1151640000000 , 0] , [ 1154318400000 , 0] , [ 1156996800000 , 0] , [ 1159588800000 , 3899486.0] , [ 1162270800000 , 3899486.0] , [ 1164862800000 , 3899486.0] , [ 1167541200000 , 3564700.0] , [ 1170219600000 , 3564700.0] , [ 1172638800000 , 3564700.0] , [ 1175313600000 , 2648493.0] , [ 1177905600000 , 2648493.0] , [ 1180584000000 , 2648493.0] , [ 1183176000000 , 2522993.0] , [ 1185854400000 , 2522993.0] , [ 1188532800000 , 2522993.0] , [ 1191124800000 , 2906501.0] , [ 1193803200000 , 2906501.0] , [ 1196398800000 , 2906501.0] , [ 1199077200000 , 2206761.0] , [ 1201755600000 , 2206761.0] , [ 1204261200000 , 2206761.0] , [ 1206936000000 , 2287726.0] , [ 1209528000000 , 2287726.0] , [ 1212206400000 , 2287726.0] , [ 1214798400000 , 2732646.0] , [ 1217476800000 , 2732646.0] , [ 1220155200000 , 2732646.0] , [ 1222747200000 , 2599196.0] , [ 1225425600000 , 2599196.0] , [ 1228021200000 , 2599196.0] , [ 1230699600000 , 1924387.0] , [ 1233378000000 , 1924387.0] , [ 1235797200000 , 1924387.0] , [ 1238472000000 , 1756311.0] , [ 1241064000000 , 1756311.0] , [ 1243742400000 , 1756311.0] , [ 1246334400000 , 1743470.0] , [ 1249012800000 , 1743470.0] , [ 1251691200000 , 1743470.0] , [ 1254283200000 , 1519010.0] , [ 1256961600000 , 1519010.0] , [ 1259557200000 , 1519010.0] , [ 1262235600000 , 1591444.0] , [ 1264914000000 , 1591444.0] , [ 1267333200000 , 1591444.0] , [ 1270008000000 , 1543784.0] , [ 1272600000000 , 1543784.0] , [ 1275278400000 , 1543784.0] , [ 1277870400000 , 1309915.0] , [ 1280548800000 , 1309915.0] , [ 1283227200000 , 1309915.0] , [ 1285819200000 , 1331875.0] , [ 1288497600000 , 1331875.0] , [ 1291093200000 , 1331875.0] , [ 1293771600000 , 1331875.0] , [ 1296450000000 , 1154695.0] , [ 1298869200000 , 1154695.0] , [ 1301544000000 , 1194025.0] , [ 1304136000000 , 1194025.0] , [ 1306814400000 , 1194025.0] , [ 1309406400000 , 1194025.0] , [ 1312084800000 , 1194025.0] , [ 1314763200000 , 1244525.0] , [ 1317355200000 , 475000.0] , [ 1320033600000 , 475000.0] , [ 1322629200000 , 475000.0] , [ 1325307600000 , 690033.0] , [ 1327986000000 , 690033.0] , [ 1330491600000 , 690033.0] , [ 1333166400000 , 514733.0] , [ 1335758400000 , 514733.0]]);
  };
})
;