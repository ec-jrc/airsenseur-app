/** Config js file
* Declare all constants here
**/

angular.module('senseEurAir.constants', [])

.constant('CONFIG', {
	contactMail : 'mygeoss@jrc.ec.europa.eu',
	//jsonServer: 'http://10.228.0.164:9070/airsenseur/JSON/',
	jsonServer: 'http://digitalearthlab.jrc.ec.europa.eu/files/app/senseeurair/',
	//jsonServer: 'http://inspireaq.jrc.ec.europa.eu/senseeurair/',
	radiusAlert: 20, // Distance in kilometer from a position to look station nearby
	looktresholdDuring: 888888884000000,// Duration to look if a treshold is reached, e.g. last 24hour
	treshold: 30, // ug/m3
	dataSources: [
		{APIEndPoint: "https://geo.irceline.be/sos/api/v1/", country:"Belgium", flagUri: "flag-Belgium.png"},
		{APIEndPoint: "https://sensorweb.demo.52north.org/sensorwebclient-webapp-stable/api/v1", country:"Sweden", flagUri: "flag-Sweden.png"},
		{APIEndPoint: "https://sensors.geonovum.nl/sos/api/v1/", country:"Netherlands", flagUri: "flag-Netherlands.png"},
		{APIEndPoint: "https://sossvr1.liberaintentio.com:8080/52nSOS/api/v1/", country:"AirSensEUR (JRC Ispra)", flagUri: "flag-UE.png"},
		//{APIEndPoint: "http://geo.irceline.be/sos/api/v1/", country:"Lithuania", flagUri: "flag-Lithuania.png"}
	],
})

.constant('TEXT', {
	'noConnection': 'You are offline'
});
