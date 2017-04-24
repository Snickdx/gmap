let app = angular.module('delivery', ['ngMaterial', 'firebase', 'uiGmapgoogle-maps']);



app.config(function(uiGmapGoogleMapApiProvider) {
	uiGmapGoogleMapApiProvider.configure({
		key: 'AIzaSyCB-bZyNYdVVERXOPnYz_9X9ZCOo2WbgUE',
		v: '3.20', //defaults to latest 3.X anyhow
		libraries: 'weather,geometry,visualization'
	});
});

app.controller('mainCtrl', ['$scope', '$firebaseArray', function($scope, $firebaseArray){
	$scope.map =  { center: { latitude: 45, longitude: -73 }, zoom: 8 };

	
	// uiGmapGoogleMapApi.then(maps =>{
	// 	console.log(maps);
	// });
}]);