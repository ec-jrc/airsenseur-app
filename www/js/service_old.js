angular.module('senseEurAir.services', [])


/*
 * Base SenseEur service
 * ----------------------------------------------------------------------
 */
.factory('$AirSensEUR', function($http, $q, $networksSources){
  var obj = {};

  obj.getAllStations = function(){
    var def = $q.defer();

    $http.get("http://sossvr1.liberaintentio.com:8080/52nSOS/api/v1/stations", {cache: true}).then(
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

  obj.getAllStationsByphenomenon = function(idphenomenon){
    var def = $q.defer();

    $http.get("http://sossvr1.liberaintentio.com:8080/52nSOS/api/v1/stations/?phenomenon="+idphenomenon, {cache: true}).then(
      function(success){
        def.resolve(success.data);
      },
      function(error){
        def.reject(error);
      }
    );

    return def.promise;
  };

  obj.getStation = function(idStation){
    var def = $q.defer();

    $http.get("http://sossvr1.liberaintentio.com:8080/52nSOS/api/v1/stations/"+idStation, {cache: true}).then(
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

  obj.getphenomenonFromStation = function(idStation){
    var def = $q.defer();

    $http.get("http://sossvr1.liberaintentio.com:8080/52nSOS/api/v1/phenomena/?station="+idStation, {cache: true}).then(
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

  obj.getTimeSeries = function(idStation, idphenomenon){
    var def = $q.defer();

    $http.get("http://sossvr1.liberaintentio.com:8080/52nSOS/api/v1/timeseries/?expanded=true&station="+idStation+"&phenomenon="+idphenomenon, {cache: true}).then(
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

  //timespan in ISO 8601
  obj.getTimeSeriesData = function(idTimeseries, timespan){
    var def = $q.defer();

    $http.get("http://sossvr1.liberaintentio.com:8080/52nSOS/api/v1/timeseries/"+idTimeseries+"/getData?timespan="+timespan+"&generalize=true&generalizing_algorithm=lttb&threshold=50&expanded=true&format=flot", {cache: true}).then(
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
 * Data Sources service
 * ----------------------------------------------------------------------
 */
.factory('$dataSources', function($http, $q, $localStorage, CONFIG){
  var obj = {};

  //obj.get

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

/*
 * Networks sources
 * ----------------------------------------------------------------------
 */
.factory('$networksSources', function($http, $q, $localStorage, $database, CONFIG){
  var obj = {};

  obj.sources = [];

  obj.set = function(){
    var def = $q.defer();
    $database.getAllSelectedMonitoringNetworks().then(
      function(networksAPIurl){
        obj.sources = networksAPIurl;
        def.resolve(networksAPIurl);
      }, function(error){
        def.reject(error);
      }
    );
    return def.promise;
  };

  obj.get = function(){
    return obj.sources;
  };

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

  obj.coordinates = {longitude: 9.254419, latitude: 50.102223}

  obj.get = function(){
    var def = $q.defer();
    
    ionic.Platform.ready(function() {
      // timeout Number  Maximum length of time (milliseconds) that is allowed to pass
      // maximumAge  Number  Accept a cached position whose age is no greater than the specified time in milliseconds
      // enableHighAccuracy  Boolean Provides a hint that the application needs the best possible results
      var posOptions = {timeout: 5000, maximumAge: 300000, enableHighAccuracy: false};
      var defaultCoordinate = {longitude: 9.254419, latitude: 50.102223}; //GeoHack - Geographical Centre of EU in Westerngrund (28 members including Mayotte since 10 May 2014)

      navigator.geolocation.getCurrentPosition(function(success){
        var coordinates = {longitude: success.coords.longitude, latitude: success.coords.latitude};
        obj.coordinates = {longitude: success.coords.longitude, latitude: success.coords.latitude};
        def.resolve(coordinates);
      }, function(error){
        console.error(error);
        def.resolve(defaultCoordinate);
      }, posOptions);
    });
    return def.promise;
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
            db.executeSql("CREATE TABLE IF NOT EXISTS airParameters (id integer primary key, idAirSenseur integer, label text, formula text, unit text, source text, effects text, limitValues text, icon text, description text, type text)");
            db.executeSql("CREATE TABLE IF NOT EXISTS generalContent (id integer primary key, label text, description text)");
            db.executeSql("CREATE TABLE IF NOT EXISTS monitoringNetworks (id integer primary key, APIurl text, label text, flag text, selected text, defaultSelected text)");
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
        var query = "INSERT INTO monitoringNetworks (APIurl, label, flag, selected, defaultSelected) VALUES (?, ?, ?, ?, ?)";
        while (i<arrayMonitoringNetworks.length){
          tx.executeSql(query, [arrayMonitoringNetworks[i].APIurl, arrayMonitoringNetworks[i].label, arrayMonitoringNetworks[i].flag, arrayMonitoringNetworks[i].selected, arrayMonitoringNetworks[i].defaultSelected], function(tx, res) {
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
    var query = "SELECT APIurl FROM monitoringNetworks WHERE selected = 'true OR defaultSelected = 'true";
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
        console.log('transaction ok');
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
              // console.log("localLastUpdate");
              // console.log(localLastUpdate);
              // console.log(serverLastUpdate);
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
          console.error('error');
          console.error(error);
          if(error === 'no result'){ // If there is no lastUpdate date inside the database, that means this is the first run of the app and the database is empty
            obj.populateDatabase(source).then(function(success){
              console.log('populateDatabase');
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
        console.log(data);
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
              "defaultSelected": monitoringNetwork.defaultSelected
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
        console.log(data);
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