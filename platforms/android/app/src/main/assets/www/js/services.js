angular.module('senseEurAir.services', [])


/*
 * Base SenseEur service
 * ----------------------------------------------------------------------
 */
.factory('$AirSensEUR', function($http, $q, $networksSources, CONFIG){
  var obj = {};

  obj.getAllStations = function(){
    var def = $q.defer();
    //var arrayPromise = [];
    //var arraySuccess = [];
    var arrayPromise = {};
    var arraySuccess = {};
    var arraySources = $networksSources.sources;
      
      console.log('souces');
      console.log(arraySources);

    angular.forEach(arraySources, function(source, key){
      console.log(source);
      var service = "";
      if (source.APIurl === "http://sensorweb.demo.52north.org/sensorwebclient-webapp-stable/api/v1/"){
        service = "?service=srv_42c69c781d20426f2d383c11625a26b5&locale=en"
      }
      //arrayPromise.push($http.get(source+"stations", {cache: true}));
      arrayPromise[source.APIurl] = $http.get(source.APIurl+"stations"+service, {cache: true, timeout: 60500});
    });  

    $q.all(arrayPromise).then(function(success){
      console.log('popo');
      console.log(success);
      //var i = 0;
      // while (i < success.length){
      //   arraySuccess.push({'data': success[i].data, 'source': source.replace("stations")});
      //   i++;
      // }
      angular.forEach(success, function(value, key){
        //arraySuccess.push({'data': value, 'source': key});
        //console.log(value);
        //console.log(key);
        arraySuccess[key] = value.data;
      });
      console.log('resolved');
      console.log(arraySuccess);
      def.resolve(arraySuccess); //It is an array of result
      //def.resolve(success); //It is an array of result
    }, function(error){
      def.reject(error);
    });

    return def.promise;
  };


  obj.getAllStationsByphenomenon = function(labelPhenomenom){
      
    /* there was an error due to white spaces in the end */
    labelPhenomenom=labelPhenomenom.trim();
      
    var def = $q.defer();
    var arrayPromise = {};
    var arraySuccess = {};
    var arraySources = $networksSources.sources;

    //console.log("getAllStationsByphenomenon", arraySources);
    angular.forEach(arraySources, function(source, key){
      var idPhenomenon = angular.fromJson(source.airParamsMapping)[labelPhenomenom].id;
      console.log("idPhenomenon: ", idPhenomenon)
      console.log("source: ", source);
      console.log("source.APIurl: ", source.APIurl);
      if (idPhenomenon !== "" ){
        var service = "";
        if (source.APIurl === "http://sensorweb.demo.52north.org/sensorwebclient-webapp-stable/api/v1/"){
          service = "&service=srv_42c69c781d20426f2d383c11625a26b5&locale=en"
        }
        arrayPromise[source.APIurl] = $http.get(source.APIurl+"stations/?phenomenon="+idPhenomenon+service, {cache: true});
      }
      // arrayPromise[source.APIurl] = $http.get(source.APIurl+"stations/?phenomenon="+idphenomenon, {cache: true});
    });  

    //console.log("arrayPromise: " ,arrayPromise);

    //if (arrayPromise.length > 0){
      $q.all(arrayPromise).then(function(success){
        angular.forEach(success, function(value, key){
          arraySuccess[key] = value.data;
        });
        def.resolve(arraySuccess); //It is an array of result
      }, function(error){
        def.reject(error);
      });
    //}else{
      //def.reject('arrayPromise empty');
    //}

    return def.promise;
  };

  obj.getAllStationsNearUser = function(labelPhenomenom, coordinates){
    console.log('LABELPHENONEMON', labelPhenomenom);
    var def = $q.defer();
    var arrayPromise = {};
    var arraySuccess = {};
    var arraySources = $networksSources.sources;

    var crs = "EPSG:4326"; // Default is EPSG:25832, but coordinates we use + coordinates of stations are in EPSG:4326. (XX.YYYYYY)

    var tmpForIdAirParam = [];
    angular.forEach(arraySources, function(source, key){
      var airParam = angular.fromJson(source.airParamsMapping)[labelPhenomenom];
      var idPhenomenon = airParam.id;
      var distance = airParam.distance;
      //if (idPhenomenon !== "" ){
      if (idPhenomenon !== "" && distance !== ""){
        tmpForIdAirParam[source.APIurl] = airParam;
        var near = { //to be URL ENCODED
          "center": {
            "type": "Point",
            "coordinates": [coordinates[1].toFixed(6), coordinates[0].toFixed(6)] //longitude - lattitude? for the moment is latlong, Tofixed to retrieve EPSG:4326 format from the getGeolocation coordinates
          },
          "radius": distance
          //"radius": 500
        };
        near = encodeURIComponent(JSON.stringify(near));

        var service = "";
        if (source.APIurl === "http://sensorweb.demo.52north.org/sensorwebclient-webapp-stable/api/v1/"){
          service = "&service=srv_42c69c781d20426f2d383c11625a26b5&locale=en"
        }

        // arrayPromise[source.APIurl] = $http.get(source.APIurl+"stations/?phenomenon="+idPhenomenon+"&crs="+crs+"&near="+near+"&expanded=true", {cache: false});
        arrayPromise[source.APIurl] = $http.get(source.APIurl+"stations/?phenomenon="+idPhenomenon+"&crs="+crs+"&near="+near+"&expanded=true"+service, {cache: false});
        // console.log(source.APIurl+"stations/?phenomenon="+idPhenomenon+"&"+near+"&expanded=true");
      }
      // arrayPromise[source.APIurl] = $http.get(source.APIurl+"stations/?phenomenon="+idphenomenon, {cache: true});
    });  

    //if (arrayPromise.length > 0){
      $q.all(arrayPromise).then(function(success){
        //console.log('OOOK', success);
        angular.forEach(success, function(value, key){
          arraySuccess[key] = {
            'stations': value.data,
            'airParam': tmpForIdAirParam[key]
          }
          //arraySuccess[key] = value.data;
          //arraySuccess[key]['idPhenomenon'] = arraySources.airParamsMapping[labelPhenomenom];
        });
        def.resolve(arraySuccess); //It is an array of result
        //console.log('success getAllStationsNearUser: ', arraySuccess);
      }, function(error){
        def.reject(error);
      });
    //}else{
      //def.reject('arrayPromise empty');
    //}

    return def.promise;
  };

  obj.getStation = function(idStation, networkSource){
    var def = $q.defer();
    var service = "";
    if (networkSource === "http://sensorweb.demo.52north.org/sensorwebclient-webapp-stable/api/v1/"){
      service = "?service=srv_42c69c781d20426f2d383c11625a26b5&locale=en"
    }
    $http.get(networkSource+"stations/"+idStation+service, {cache: true}).then(
      function(success){
        def.resolve(success.data);
        //console.log(success);
      },
      function(error){
        def.reject(error);
      }
    );
    return def.promise;
  };

  obj.getphenomenonFromStation = function(idStation, networkSource){
    var def = $q.defer();
    var service = "";
    if (networkSource === "http://sensorweb.demo.52north.org/sensorwebclient-webapp-stable/api/v1/"){
      service = "&service=srv_42c69c781d20426f2d383c11625a26b5&locale=en"
    }
    $http.get(networkSource+"phenomena/?station="+idStation+service, {cache: true}).then(
      function(success){
        def.resolve(success.data);
        //console.log(success);
      },
      function(error){
        def.reject(error);
      }
    );
    return def.promise;
  };

  obj.getTimeSeries = function(idStation, idphenomenon, networkSource){
    var def = $q.defer();

    var service = "";
    if (networkSource === "http://sensorweb.demo.52north.org/sensorwebclient-webapp-stable/api/v1/"){
      service = "&service=srv_42c69c781d20426f2d383c11625a26b5&locale=en"
    }
    console.log('getTimeSeries : ', networkSource+"timeseries/?expanded=true&force_latest_values=true&station="+idStation+"&phenomenon="+idphenomenon+service);
    $http.get(networkSource+"timeseries/?expanded=true&force_latest_values=true&station="+idStation+"&phenomenon="+idphenomenon+service, {cache: true}).then(
      function(success){
        console.log('HTTP REQUEST: ', networkSource+"timeseries/?expanded=true&station="+idStation+"&phenomenon="+idphenomenon+service);
        def.resolve(success.data);
        //console.log(success);
      },
      function(error){
        def.reject(error);
      }
    );
    return def.promise;
  };

  //timespan in ISO 8601
  obj.getTimeSeriesData = function(idTimeseries, timespan, networkSource){
    var def = $q.defer();

    var service = "";
    if (networkSource === "http://sensorweb.demo.52north.org/sensorwebclient-webapp-stable/api/v1/"){
      service = "?service=srv_42c69c781d20426f2d383c11625a26b5&locale=en"
    }
    console.log('getTimeSeriesData : ', networkSource+"timeseries/"+idTimeseries+"/getData?timespan="+timespan+"&generalize=true&generalizing_algorithm=lttb&treshold=50&expanded=true&format=flot"+service);
    $http.get(networkSource+"timeseries/"+idTimeseries+"/getData?timespan="+timespan+"&generalize=true&generalizing_algorithm=lttb&treshold=50&expanded=true&format=flot"+service, {cache: true}).then(
      function(success){
        def.resolve(success.data);
        console.log(success); //return an array, we presume it will alaways be an array with 1 timesteries?
      },
      function(error){
        def.reject(error);
      }
    );
    return def.promise;
  };

  return obj;
})

/*
 * Networks sources
 * ----------------------------------------------------------------------
 */
.factory('$networksSources', function($http, $q, $localStorage, $database, CONFIG){
  var obj = {};

  obj.sources = [];
  obj.defaultSources = [];

  /* Check if network is online or not */
  obj.statusNetworks = function(){
    arraySources = obj.sources;
    angular.forEach(arraySources, function(source, key){
      $http.get(source.APIurl, {cache: false, timeout: 4000}).then(
        function(success){

        },
        function(error){ //network is not online
          $database.selectMonitoringNetwork(source.id, "false").then(
            function(success){;
              obj.set(); 
            }, function(error){ 
              console.error(error);
            }
          );
        }
      );
    })
  };

  obj.networkStatus = function(APIurl){
    console.log('call');
    var def = $q.defer();
    $http.get(APIurl, {cache: false, timeout: 3000}).then(
      function(success){
        def.resolve();
      },
      function(error){
        def.reject(error);
      }
    );
    return def.promise;
  }
  /**/

  obj.set = function(){
    var def = $q.defer();
    $database.getAllSelectedMonitoringNetworks().then(
      function(networks){
        obj.sources = networks;
        def.resolve(networks);
      }, function(error){
        console.error(error);
        def.reject(error);
      }
    );
    return def.promise;
  };

  obj.get = function(){
    return obj.sources;
  };

  obj.setDefaultSources = function(){
    var def = $q.defer();
    $database.getAllDefaultSelectedMonitoringNetworks().then(
      function(networks){
        obj.defaultSources = networks;
        def.resolve(networks);
      }, function(error){
        console.error(error);
        def.reject(error);
      }
    );
    return def.promise;
  };

  obj.getDefaultSources = function(){
    return obj.defaultSources;
  };

  return obj;
})

/*
 * Networks device status
 * ----------------------------------------------------------------------
 */
.factory('$networkStatus', function($http, $q, $localStorage){
  var obj = {};

  obj.isOnline = false;

  // obj.set = function(boolean){
  //   obj.isOnline = boolean;
  // };

  return obj;
})

/*
 * Pollutants service
 * ----------------------------------------------------------------------
 */
.factory('$pollutants', function($http, $q){
  var obj = {};

  obj.getPollutants = function(){
    var def = $q.defer();

    $http.get("data/data.json", {cache: true}).then(
      function(success){
        def.resolve(success.data.pollutants);
      },
      function(error){
        def.reject(error);
      }
    );
    return def.promise;
  };

  return obj;
})

/* $geolocationFactory
* Get device coordinates or by default center of EU
*/
.factory('$geolocationFactory', function($q){
  var obj = {};

  obj.coordinates = {longitude: 9.254419, latitude: 50.102223} //Default coordinated

  obj.get = function(){
    var def = $q.defer();
    
    ionic.Platform.ready(function() {
      // timeout Number  Maximum length of time (milliseconds) that is allowed to pass
      // maximumAge  Number  Accept a cached position whose age is no greater than the specified time in milliseconds
      // enableHighAccuracy  Boolean Provides a hint that the application needs the best possible results
      var posOptions = {timeout: 5000, maximumAge: 10000, enableHighAccuracy: false};
      var defaultCoordinate = {longitude: 9.254419, latitude: 50.102223}; //GeoHack - Geographical Centre of EU in Westerngrund (28 members including Mayotte since 10 May 2014)

      navigator.geolocation.getCurrentPosition(function(success){
        var coordinates = {longitude: success.coords.longitude, latitude: success.coords.latitude};
        obj.coordinates = {longitude: success.coords.longitude, latitude: success.coords.latitude};
        console.log("COORDINATED: ", coordinates);
        def.resolve(coordinates);
      }, function(error){
        console.error(error);
        def.resolve(defaultCoordinate);
      }, posOptions);
    });
    return def.promise;
  };

  obj.watchID;

  obj.watchPosition = function(callbackSuccess){
    var option = { maximumAge: 10000, timeout: 5000, enableHighAccuracy: false };
    obj.watchID = navigator.geolocation.watchPosition(callbackSuccess, function(error){
      return "watchError";
    });
    //navigator.geolocation.watchPosition(onSuccess, onError, { timeout: 30000 });
  };

  obj.clearWatch = function(){ // TODO: Parameter to select with watchID to clear, but for the moment there is only one watcher
    console.log('geowatcher clear');
    navigator.geolocation.clearWatch(obj.watchID);
  };

  return obj;
})

/* $database
* Request data from the local SQLite database
*/
.factory('$database', function($q){
  var obj = {};

  obj.db;

  obj.initDb = function(){
    var def = $q.defer();
    ionic.Platform.ready(function() {
      window.sqlitePlugin.openDatabase({name: "airsenseur.db", location: 'default'}, function(db){
        obj.db = db;
        db.transaction(function (tx) {
            db.executeSql("CREATE TABLE IF NOT EXISTS metaData (id integer primary key, label text, timestamp integer)");
            db.executeSql("CREATE TABLE IF NOT EXISTS airParameters (id integer primary key, idAirSenseur text, label text, formula text, unit text, source text, effects text, limitValues text, icon text, description text, type text)");
            db.executeSql("CREATE TABLE IF NOT EXISTS generalContent (id integer primary key, label text, description text)");
            db.executeSql("CREATE TABLE IF NOT EXISTS monitoringNetworks (id integer primary key, APIurl text, label text, flag text, selected text, defaultSelected text, airParamsMapping text)"); //serialize airParamsMapping
        }, function (error) {
            console.log('transaction error: ' + error.message);
            def.reject('Transaction error');
        }, function () {
            console.log('transaction ok');
            def.resolve(db);
        });
      }, function(error){
        def.reject('Error opening database');
      });
    });
    return def.promise;
  };
 
  obj.getLastUpdate = function(){
    var def = $q.defer();
    var query = "SELECT * FROM metaData WHERE label = 'lastUpdate' ";
    obj.db.executeSql(query, [], function(success){
      if(success.rows.length > 0){
        var lastUpdate = success.rows.item(0);
        def.resolve(lastUpdate);
      }else{
        console.error('toto');
        def.reject("no result");
      }
    }, function(error){
      console.error(query);
      def.reject(error);
    });
    return def.promise;
  };

  obj.getAllLastUpdate = function(){
    var def = $q.defer();
    var query = "SELECT * FROM metaData";
    obj.db.executeSql(query, [], function(success){
      var allLastUpdate = [];
      if(success.rows.length > 0){
          for(var i = 0; i < success.rows.length; i++){
            allLastUpdate.push(success.rows.item(i));
          }
        def.resolve(allLastUpdate);
      }else{
        def.reject("no result");
      }
    }, function(error){
      def.reject(error);
    });
    return def.promise;
  };

  //
  // Meta table

  //label: lastUpdate, monitoringNetworks, airParameters, generalContent
  obj.addLastUpdate = function(label, newTimestamp){
    var def = $q.defer();
    var query = "INSERT INTO metaData (label, timestamp) VALUES (?,?)";
    obj.db.executeSql(query, [label, newTimestamp], function(success){
      def.resolve(success);
    }, function(error){
      def.reject(error);
    });
    return def.promise;
  };

  obj.updateLastUpdate = function(label, newTimestamp){
    var def = $q.defer();
    var query = "UPDATE metaData set timestamp = ? WHERE label = ?";
    obj.db.executeSql(query, [newTimestamp, label], function(success){
      def.resolve(success);
    }, function(error){
      def.reject(error);
    });
    return def.promise;
  };

  obj.addAllLastUpdate = function(arrayLastUpdate){
    var def = $q.defer();
    var lengthParams = arrayLastUpdate.length;
    if (lengthParams > 0){
      obj.db.transaction(function(tx) {
        var i = 0;
        var query = "INSERT INTO metaData (label, timestamp) VALUES (?, ?)";
        while (i<arrayLastUpdate.length){
          tx.executeSql(query, [arrayLastUpdate[i].label, arrayLastUpdate[i].timestamp], function(tx, res) {
          }, function(error) {
            console.log("executeSql error");
          });
          i++;
        }
      }, function(error) {
        def.reject("transaction error: " + error.message);
      }, function() {
        def.resolve('transaction ok');    
      });
    } else{
      def.reject("arrayLastUpdate.length < 1");
    }
      return def.promise;
  };

  //
  // airParameters table
  obj.addAirParameters = function(arrayAirParams){
    var def = $q.defer();
    var lengthParams = arrayAirParams.length;
    if (lengthParams > 0){
      obj.db.transaction(function(tx) {
        var i = 0;
        var query = "INSERT INTO airParameters (idAirSenseur, label, formula, unit, source, effects, limitValues, icon, description, type) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        while (i<arrayAirParams.length){
          tx.executeSql(query, [arrayAirParams[i].idAirSenseur, arrayAirParams[i].label, arrayAirParams[i].formula, arrayAirParams[i].unit, arrayAirParams[i].source, arrayAirParams[i].effects, arrayAirParams[i].limitValues ,arrayAirParams[i].icon , arrayAirParams[i].description, arrayAirParams[i].type], function(tx, res) {
          }, function(error) {
            console.log("executeSql error");
          });
          i++;
        }
      }, function(error) {
        def.reject("transaction error: " + error.message);
      }, function() {
        def.resolve('transaction ok');    
      });
    } else{
      def.reject("arrayAirParams.length < 1");
    }
      return def.promise;
  };

  obj.getAllAirParameters = function(){
    var def = $q.defer();
    var query = "SELECT * FROM airParameters";
    obj.db.executeSql(query, [], function(success){
      var airParameters = [];
      if(success.rows.length > 0){
          for(var i = 0; i < success.rows.length; i++){
            airParameters.push(success.rows.item(i));
          }
        def.resolve(airParameters);
      }else{
        def.reject("no result");
      }
    }, function(error){
      def.reject(error);
    });
    return def.promise;
  };

  obj.getAllAirParametersByType = function(type){
    var def = $q.defer();
    var query = "SELECT * FROM airParameters WHERE type = ?";
    obj.db.executeSql(query, [type], function(success){
      var airParameters = [];
      if(success.rows.length > 0){
          for(var i = 0; i < success.rows.length; i++){
            airParameters.push(success.rows.item(i));
          }
        def.resolve(airParameters);
      }else{
        def.reject("no result");
      }
    }, function(error){
      def.reject(error);
    });
    return def.promise;
  };

  //
  // monitoringNetworks table
  obj.addMonitoringNetworks = function(arrayMonitoringNetworks){
    var def = $q.defer();
    var lengthParams = arrayMonitoringNetworks.length;
    if (lengthParams > 0){
      obj.db.transaction(function(tx) {
        var i = 0;
        var query = "INSERT INTO monitoringNetworks (APIurl, label, flag, selected, defaultSelected, airParamsMapping) VALUES (?, ?, ?, ?, ?, ?)";
        while (i<arrayMonitoringNetworks.length){
          tx.executeSql(query, [arrayMonitoringNetworks[i].APIurl, arrayMonitoringNetworks[i].label, arrayMonitoringNetworks[i].flag, arrayMonitoringNetworks[i].selected, arrayMonitoringNetworks[i].defaultSelected, arrayMonitoringNetworks[i].airParamsMapping], function(tx, res) {
          }, function(error) {
            console.log("executeSql error");
          });
          i++;
        }
      }, function(error) {
        def.reject("transaction error: " + error.message);
      }, function() {
        def.resolve('transaction ok');    
      });
    } else{
      def.reject("arrayMonitoringNetworks.length < 1");
    }
      return def.promise;
  };

  obj.getAllMonitoringNetworks = function(){
    var def = $q.defer();
    var query = "SELECT * FROM monitoringNetworks";
    obj.db.executeSql(query, [], function(success){
      var monitoringNetworks = [];
      if(success.rows.length > 0){
          for(var i = 0; i < success.rows.length; i++){
            monitoringNetworks.push(success.rows.item(i));
          }
        def.resolve(monitoringNetworks);
      }else{
        def.reject("no result");
      }
    }, function(error){
      def.reject(error);
    });
    return def.promise;
  };


  obj.getAllSelectedMonitoringNetworks = function(){
    var def = $q.defer();
    var query = "SELECT * FROM monitoringNetworks WHERE selected = 'true' OR defaultSelected = 'true'";
    obj.db.executeSql(query, [], function(success){
      var monitoringNetworks = [];
      if(success.rows.length > 0){
          for(var i = 0; i < success.rows.length; i++){
            monitoringNetworks.push(success.rows.item(i));
          }
        def.resolve(monitoringNetworks);
      }else{
        def.reject("no result");
      }
    }, function(error){
      def.reject(error);
    });
    return def.promise;
  };

  obj.getAllDefaultSelectedMonitoringNetworks = function(){ //Normally we will just have one default selected network.
    var def = $q.defer();
    var query = "SELECT * FROM monitoringNetworks WHERE defaultSelected = 'true'";
    obj.db.executeSql(query, [], function(success){
      var monitoringNetworks = [];
      if(success.rows.length > 0){
          for(var i = 0; i < success.rows.length; i++){
            monitoringNetworks.push(success.rows.item(i));
          }
        def.resolve(monitoringNetworks);
      }else{
        def.reject("no result");
      }
    }, function(error){
      def.reject(error);
    });
    return def.promise;
  };

  obj.selectMonitoringNetwork = function(id, selected){
    var def = $q.defer();
    var query = "UPDATE monitoringNetworks set selected = ? WHERE id = ?";
    obj.db.executeSql(query, [selected, id], function(success){
      def.resolve(success);
    }, function(error){
      def.reject(error);
    });
    return def.promise;
  };

  /* Useful to default select a Phenomenon on map view */
  obj.getSelectedMonitoringNetworkByAPIurl = function(APIurl){
    //console.log('APIurl ', APIurl);
    var def = $q.defer();
    var query = "SELECT * FROM monitoringNetworks WHERE (selected = 'true' OR defaultSelected = 'true') AND APIurl = ?";
    //console.log(query);
    obj.db.executeSql(query, [APIurl], function(success){
      if(success.rows.length > 0){
        var monitoringNetworks = success.rows.item(0);
        def.resolve(monitoringNetworks);
      }else{
        def.reject("no result");
      }
    }, function(error){
      def.reject(error);
    });
    return def.promise;
  };

  //
  // generalContent table
  obj.addGeneralContents = function(arrayGeneralContents){
    var def = $q.defer();
    var lengthParams = arrayGeneralContents.length;
    if (lengthParams > 0){
      obj.db.transaction(function(tx) {
        var i = 0;
        var query = "INSERT INTO generalContent (label, description) VALUES (?, ?)";
        while (i < arrayGeneralContents.length){
          tx.executeSql(query, [arrayGeneralContents[i].label, arrayGeneralContents[i].description], function(tx, res) {
          }, function(error) {
            //console.log("executeSql error");
          });
          i++;
        }
      }, function(error) {
        def.reject("transaction error: " + error.message);
      }, function() {
        def.resolve('transaction ok');    
      });
    } else{
      def.reject("arrayGeneralContents.length < 1");
    }
      return def.promise;
  };

  obj.getAllGeneralContents = function(){
    var def = $q.defer();
    var query = "SELECT * FROM generalContent";
    obj.db.executeSql(query, [], function(success){
      var generalContent = [];
      if(success.rows.length > 0){
          for(var i = 0; i < success.rows.length; i++){
            generalContent.push(success.rows.item(i));
          }
        def.resolve(generalContent);
      }else{
        def.reject("no result");
      }
    }, function(error){
      def.reject(error);
    });
    return def.promise;
  };

  obj.getGeneralContentsByLabel = function(label){
    var def = $q.defer();
    var query = "SELECT * FROM generalContent WHERE label = ?";
    obj.db.executeSql(query, [label], function(success){
      var generalContent = "";
      if(success.rows.length > 0){
          //for(var i = 0; i < success.rows.length; i++){
          generalContent = success.rows.item(0);
          //}
        def.resolve(generalContent);
      }else{
        def.reject("no result");
      }
    }, function(error){
      def.reject(error);
    });
    return def.promise;
  };

  obj.deleteDatabaseTableContent = function(){
    var def = $q.defer();
    obj.db.transaction(function (tx) {
        tx.executeSql("DELETE FROM metaData");
        tx.executeSql("DELETE FROM airParameters");
        tx.executeSql("DELETE FROM generalContent");
        tx.executeSql("DELETE FROM monitoringNetworks");
    }, function (error) {
        console.log('transaction error: ' + error.message);
        def.reject('Error deleting');
    }, function () {
        def.resolve();
    });
    return def.promise;
  };

  return obj;
})

/* $dataConfig
* Retrieve data from local or server json and update it locally
*/
.factory('$dataConfig', function($q, $http, $cacheFactory, $database, CONFIG){
  var obj = {};

  obj.getJson = function(fileName, source){
    if(source === "server"){
      return obj.getJsonServer(fileName);
    }else{
      return obj.getJsonLocal(fileName);
    }
  }

  obj.getJsonLocal = function(fileName){
    var def = $q.defer();
    $http.get("./data/"+fileName, {cache: true}).then(
      function(success){
        def.resolve(success.data);
      },function(error){
        def.reject(error);
      }
    );
    return def.promise;
  };

  obj.getJsonServer = function(fileName){
    var def = $q.defer();
    $http.get(CONFIG.jsonServer+fileName, {cache: true, timeout: 15000}).then(
      function(success){
        def.resolve(success.data);
      },function(error){
        def.reject(error);
      }
    );
    return def.promise;
  };

  obj.updateAppData = function(source){
    var def = $q.defer();
    if (source == 'local'){
      $database.getLastUpdate().then(
        function(success){
          def.resolve(success); //resolve, no need to update the data if it already exist and we are in local
        }, function(error){
          if(error === 'no result'){ // If there is no lastUpdate date inside the database, that means this is the first run of the app and the database is empty
            obj.populateDatabase(source).then(function(success){
              def.resolve('data updated');
            }, function(error){
              def.reject();
            })
          }
        }
      );
    }else{
      $database.getLastUpdate().then(
        function(localLastUpdate){
          //Check if we need it to update or not
          obj.getJsonServer('update.json').then(
            function(serverLastUpdate){
              if (serverLastUpdate.lastUpdate > localLastUpdate.timestamp){
                obj.updateDatabase().then(
                  function(success){
                    $cacheFactory.get('$http').removeAll();
                    def.resolve('data updated');
                  },
                  function(error){
                    console.error('error updating data');
                    console.error(error);
                    $cacheFactory.get('$http').removeAll();
                    def.resolve('data not updated');
                  }
                );
              }else{
                $cacheFactory.get('$http').removeAll();
                def.resolve('No dataUpdated'); //Local version up-to-date with server data
              }
            },function(error){
              $cacheFactory.get('$http').removeAll();
              def.resolve('No dataUpdated');
            }
          );
        }, function(error){
          console.error(error);
          if(error === 'no result'){ // If there is no lastUpdate date inside the database, that means this is the first run of the app and the database is empty
            obj.populateDatabase(source).then(function(success){
              def.resolve('data updated');
            }, function(error){
              console.error('go local');
              obj.populateDatabase('local').then(function(success){
                def.resolve('data updated locally');
              }, function(error){
                console.error('full error');
                def.reject();
              });
            })
          }
        }
      );
    }
    return def.promise;
  };

  /* If the database does not exist, we use the locals json files to populate the DB
  */
  obj.populateDatabase = function(source){
    var def = $q.defer();
    var arrayPromise = [
      obj.populateAirParams(source),
      obj.populateMonitoringNetworks(source),
      obj.populateGeneralContent(source)
    ];
    $q.all(arrayPromise).then(function(success){
      obj.populateMetaData(source).then(function(success){
        def.resolve(success);
      }, function(error){
        console.error(error);
        def.reject(error);
      })
    }, function(error){
      console.error(error);
      def.reject(error);
    })
    return def.promise;
  };

  obj.updateDatabase = function(){
    var def = $q.defer();
    $database.deleteDatabaseTableContent().then(
      function(success){
        obj.populateDatabase('server').then(function(success){
          def.resolve(success);
        }, function(error){
          def.reject(error);
        });
      },
      function(error){
        def.reject(error);
      }
    );
    return def.promise;
  };

  /* @source: local || server
  */
  obj.populateMetaData = function(source){
    var def = $q.defer();
    var metaData = [];
    obj.getJson("update.json", source).then(
      function(data){
        angular.forEach(data, function(value, key){ //remove key
          metaData.push(
            {
              "label": key,
              "timestamp": value
            }
          );
        });
        $database.addAllLastUpdate(metaData).then(function(success){
          def.resolve(success);
        }, function(error){
          def.reject(error);
        })
      },
      function(error){
        def.reject(error);
      }
    );
    return def.promise;
  };

  /* @source: local || server
  */
  obj.populateAirParams = function(source){
    var def = $q.defer();

    var arrayPromise = [];
    var arrayPollutants = [];
    var arrayMeteo = [];

    obj.getJson("airParameters.json", source).then(
      function(data){
        angular.forEach(data.pollutants, function(pollutant, key){ //remove key
          arrayPollutants.push(
            {
              "idAirSenseur": pollutant.id,
              "label": pollutant.label,
              "formula": pollutant.formula,
              "unit": pollutant.unit,
              "source": pollutant.source,
              "effects": pollutant.effects,
              "limitValues": pollutant.limitValues,
              "icon": pollutant.icon,
              "description": pollutant.description,
              "type": "pollutant"
            }
          );
        });

        angular.forEach(data.meteo, function(meteo, key){ //remove key
          arrayMeteo.push(
            {
              "idAirSenseur": meteo.id,
              "label": meteo.label,
              "formula": "",
              "unit": meteo.unit,
              "source": "",
              "effects": "",
              "limitValues": "",
              "icon": meteo.icon,
              "description": meteo.description,
              "type": "meteo"
            }
          );
        });

        arrayPromise.push($database.addAirParameters(arrayPollutants));
        arrayPromise.push($database.addAirParameters(arrayMeteo));
        // console.log(arrayPollutants);
        // console.log(arrayMeteo);

        $q.all(arrayPromise).then(function(success){
          def.resolve(success);
        }, function(error){
          def.reject(error);
        })

      },
      function(error){
        def.reject(error);
      }
    );
    return def.promise;
  };

  /* @source: local || server
  */
  obj.populateMonitoringNetworks = function(source){
    var def = $q.defer();

    var monitoringNetworks = [];

    obj.getJson("monitoringNetworks.json", source).then(
      function(data){
        angular.forEach(data.monitoringNetworks, function(monitoringNetwork, key){ //remove key
          monitoringNetworks.push(
            {
              "APIurl": monitoringNetwork.APIurl,
              "label": monitoringNetwork.label,
              "flag": monitoringNetwork.flag,
              "selected": 'false',
              "defaultSelected": monitoringNetwork.defaultSelected,
              "airParamsMapping":  angular.toJson(monitoringNetwork.airParamsMapping)
            }
          );
        });

        $database.addMonitoringNetworks(monitoringNetworks).then(function(success){
          def.resolve(success);
        }, function(error){
          def.reject(error);
        })
      },
      function(error){
        def.reject(error);
      }
    );
    return def.promise;
  };

  /* @source: local || server
  */
  obj.populateGeneralContent = function(source){
    var def = $q.defer();

    var generalContents = [];

    obj.getJson("generalContent.json", source).then(
      function(data){
        angular.forEach(data.generalContent, function(content, key){ //remove key
          generalContents.push(
            {
              "label": content.label,
              "description": content.description
            }
          );
        });

        $database.addGeneralContents(generalContents).then(function(success){
          def.resolve(success);
        }, function(error){
          def.reject(error);
        })
      },
      function(error){
        def.reject(error);
      }
    );
    return def.promise;
  };

  return obj;

})

/*
 * Alerts service
 * ----------------------------------------------------------------------
 */
.factory('$alerts', function($rootScope, $http, $q, $geolocationFactory, $AirSensEUR, $networksSources, CONFIG){
  var obj = {};

  obj.alerts = []; // {}?
  obj.alertsID = [];

  obj.retrieveConcentrationNearUser = function(pollutantLabel){
    var def = $q.defer();
    var coordinates = [$geolocationFactory.coordinates.longitude, $geolocationFactory.coordinates.latitude];
      
    /* FAKE coords */
      
      //coordinates = [ 8.627025 , 45.812061  ]; 
    /* Do not forget to remove it !!!!*/
    
    var alerts = [];
    //var tmpArrayPromise = [];

    $AirSensEUR.getAllStationsNearUser(pollutantLabel, coordinates).then( //just first stations, to avoid to have 66666666406565605 request
      function(allStations){
        // At this moment we only look for data in the first station returned.
        angular.forEach(allStations, function(stations, networkSource){
          if(stations.stations.length>0){
            var station = stations.stations[0];
            var airParam = stations.airParam;
            var idPhenom = airParam.id;//109; //TODO CHANGE
            var treshold = airParam.treshold;  
              /* FAKE treshold */
              //treshold = 0;
              /* Do not forget to remove it !!!!*/

            //tmpArrayPromise.push($AirSensEUR.getTimeSeries(station.properties.id, idPhenom, networkSource));

            $AirSensEUR.getTimeSeries(station.properties.id, idPhenom, networkSource).then(function(success){
              var lastTimeserie = success[0];
              var lastValue = lastTimeserie.lastValue;
              var timeAgo = new Date().getTime() - lastValue.timestamp;

              if (timeAgo < CONFIG.looktresholdDuring){
                //if (lastValue.value >= 0){
                if (lastValue.value >= treshold){
                  var alert = {
                    'pollutant': pollutantLabel,
                    'timestamp': lastValue.timestamp,
                    'timeAgo': Math.round(timeAgo/60000), //convert milliseconde to minutes
                    'lastValue': lastValue.value,
                    'networkSource': networkSource,
                    'idPollutant': lastTimeserie.parameters.phenomenon,
                    'station': lastTimeserie.station,
                    'distance': airParam.distance,
                    'treshold': airParam.treshold,
                    'tresholdUnit': airParam.tresholdUnit,
                    'averagingPeriod': airParam.averagingPeriod,
                    'text': airParam.text,
                    'toJsonTransition': angular.toJson(
                      {
                        station: lastTimeserie.station,
                        phenomenon: lastTimeserie.parameters.phenomenon,
                        networkSource: networkSource
                      }
                    )
                  }

                  // airParam.
                  var createdAlertId = alert.idPollutant.id+'_'+alert.timestamp;
                  if (obj.alertsID.indexOf(createdAlertId) == -1){
                    console.error("obj.alerts : ", obj.alerts);
                    alerts.push(alert);
                    obj.alerts.push(alert);
                    obj.alertsID.push(createdAlertId);
                  }
                  //console.log("treshold reach ALERT: ", alert);
                  obj.generateAlert();
                }
              }else{
                obj.generateAlert(); //to stop loading and avoid app stuck in controller
              }
            }, function(error){
              console.error('$AirSensEUR.getTimeSeries in  alert', error);
              obj.generateAlert(); //to stop loading and avoid app stuck in controller
            });
          }else{
            // station empty
            obj.generateAlert(); //to stop loading and avoid app stuck in controller
          }
        });
        //$q.all(tmpArrayPromise).then();
      }, function(error){
        console.error("$AirSensEUR.getAllStationsNearUser", error);
        obj.generateAlert(); //to stop loading and avoid app stuck in controller
      }
    );
    return def.promise;
  };

  obj.retrieveConcentrationNearUserForAllPollutants = function(){
      var pollutantAlertList = angular.fromJson($networksSources.sources[0].airParamsMapping); 
      //console.log("pollutantAlertList ", pollutantAlertList);
      angular.forEach(pollutantAlertList, function(pollutantValue, pollutantLabel){
        //console.log("pollutantLabel ", pollutantLabel);
        obj.retrieveConcentrationNearUser(pollutantLabel);
      });
  };

  obj.checkNewAlerts = function(){
    $geolocationFactory.get().then(
      function(success){
        //obj.alerts = [];
        //obj.retrieveConcentrationNearUser();
        obj.retrieveConcentrationNearUserForAllPollutants()
      }
    );
  };

  obj.alertText = function(alert){
    //console.log('alertText alert: ', alert);
    var text = alert.text;
    var text = text.replace(/@@pollutant@@/g, alert.pollutant);
    var text = text.replace(/@@treshold@@/g, alert.treshold+" "+alert.tresholdUnit);
    var text = text.replace(/@@averagingPeriod@@/g, alert.averagingPeriod);
    return text;
  };
  

  //Manage event from wihtin the service, remove the listener when done to avoid Memory Leaks
  obj.generateAlert = function(){
    $rootScope.$emit('newAlert');
  };

  obj.subscribeAlertEvent = function(scope, callback) {
      var handler = $rootScope.$on('newAlert', callback);
      scope.$on('$destroy', handler);
  };

  /*obj.levelAlert = function(value){
    if (CONFIG.treshold > value)
  };*/

  return obj;
})

/* Local Storage
 * Use device local storage to store key-value and complexe object convert into a string
*/
.factory('$localStorage', ['$window', function($window) {
  return {
    set: function(key, value) {
      $window.localStorage[key] = value;
    },
    get: function(key, defaultValue) {
      return $window.localStorage[key] || defaultValue;
    },
    setObject: function(key, value) {
      $window.localStorage[key] = JSON.stringify(value);
    },
    getObject: function(key) {
      return JSON.parse($window.localStorage[key] || '{}');
    }
  }
}])
;