let app = angular.module('delivery', ['ngMaterial', 'firebase', 'ngMap']);


app.controller('mainCtrl', ['$scope', '$firebaseArray', 'NgMap', '$http', function($scope, $firebaseArray, NgMap, $http){
	$scope.googleMapsUrl="https://maps.googleapis.com/maps/api/js?key=AIzaSyCB-bZyNYdVVERXOPnYz_9X9ZCOo2WbgUE";
	
	let marker = null;
	
	$scope.dropOff = {};
	
	$scope.address = null;
	
	$scope.getAddress = pos => {
		$http({
			url:`http://maps.googleapis.com/maps/api/geocode/json?latlng=${pos.lat},${pos.lng}&sensor=true`,
			method:"GET"
		}).then(resp=>{
			// console.log(resp);
			if(resp.status == 200 && resp.data.results.length > 1)
				$scope.address = resp.data.results[0];
		})
	};
	
	$scope.enableListener = (map) => {
		google.maps.event.addListener(map, 'click', function(event) {
			if (marker != null)marker.setMap(null);
			marker = new google.maps.Marker({
				position: event.latLng,
				label: "X",
				map: map
			});
			$scope.dropOff = { 'lat': event.latLng.lat(), 'lng': event.latLng.lng()};
			$scope.getAddress($scope.dropOff);
		});
	};
	
	NgMap.getMap().then(function(map) {
		
		$scope.enableListener(map);
		
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(function (position) {
				
				initialLocation = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
				map.setCenter(initialLocation);
				
				infoWindow = new google.maps.InfoWindow;
				infoWindow.setPosition(initialLocation);
				infoWindow.setContent('You Are Here');
				infoWindow.open(map);
				
			});
		}
	});
	
}]);