let app = angular.module('delivery', ['ngMaterial', 'firebase', 'ngMap', 'ngStorage', 'ionic-toast', 'ngSanitize']);

app.run(function(FB) {
	FB.registerSW();
});

app.factory('FB', ['$http', '$firebaseAuth', '$firebaseArray', '$firebaseObject', '$q', '$localStorage', 'ionicToast', function($http, $firebaseAuth, $firebaseArray, $firebaseObject, $q, $localStorage, ionicToast){
	
	const config = {
		apiKey: "AIzaSyAGiile0fX6rwsun5T9KB2NyPkUoIRubuE",
		authDomain: "lilys-aaf3d.firebaseapp.com",
		databaseURL: "https://lilys-aaf3d.firebaseio.com",
		projectId: "lilys-aaf3d",
		storageBucket: "lilys-aaf3d.appspot.com",
		messagingSenderId: "280483830227"
	};
	
	firebase.initializeApp(config);
	
	const msg = firebase.messaging();
	
	const db = firebase.database();
	
	const obj = {};
	
	//**********************************Service Worker****************************************
	
	obj.registerSW = () => {
		if ('serviceWorker' in navigator) {
			navigator.serviceWorker.register('service-worker.js').then(function(reg) {
				
				msg.useServiceWorker(reg);
				reg.onupdatefound = function() {
					
					let installingWorker = reg.installing;
					
					installingWorker.onstatechange = function() {
						switch (installingWorker.state) {
							case 'installed':
								if (navigator.serviceWorker.controller) {
									ionicToast.show('New Content Available Please Refresh', 'bottom', false, 4000);
									console.log('New or updated content is available.');
								} else {
									console.log('Content is now available offline!');
								}
								break;
							case 'redundant':
								console.error('The installing service worker became redundant.');
								break;
						}
					};
				};
			}).catch(function(e) {
				console.error('Error during service worker registration:', e);
			});
		}
	};
	
	//***********************************Cloud Messaging***************************************
	
	obj.deleteToken = () => {
		obj.set('/subscriptions/web/'+$localStorage.savedToken, null);
		console.log('Notifications Disabled!');
		delete $localStorage.savedToken;
	};
	
	obj.saveToken = token => {
		$localStorage.savedToken = token;
		obj.set(`subscriptions/web/${token}`, true);
		
		// $http({
		// 		method: 'POST',
		// 		url: `https://iid.googleapis.com/iid/v1/${token}/rel/topics/web`,
		// 		headers: {
		// 			'Content-Type': 'application/json',
		// 			'Authorization':'key=AAAAQU4jmdM:APA91bHZ517PwFoB6XZa_Zl4u2Fwjvc6J_bz10ZqLiP9IBKPB5_8XjaDJe_XrJfoj1OJgY1Igs3Yy5156ODFTwDSwRGhmNFNCVpxjS9HIqgGYecUia-RyCcHhiCq05wUQu5wlkkRlm3j'
		// 		}
		// 	},
		// 	response => {
		// 		console.log('Registered for coupon notifications', response);
		// 	},
		// 	err => {
		// 		console.log(err);
		// 	}).then(resp=>{
		// 	console.log("Registered for coupon notifications", resp);
		// });
		
		console.log("Messaging token saved");
	};
	
	obj.isMsgEnabled = () => {
		return  $localStorage.savedToken != undefined;
	};
	
	obj.handleMessage = (handler) => {
		msg.onMessage(payload =>{
			console.log("Message Received: ", payload);
			handler(payload);
		});
	};
	
	msg.onTokenRefresh(() => {
		msg.getToken()
			.then(refreshedToken => {
				console.log("Token Refreshed");
				obj.deleteToken();
				obj.saveToken(refreshedToken);
			})
			.catch(err => {
				console.log('Unable to retrieve refreshed token ', err);
			});
	});
	
	obj.getToken = (success, failure) => {
		msg.getToken()
			.then(token => {success(token)})
			.catch(err => {failure(err)});
	};
	
	obj.enableMessaging = (success, failure) => {
		msg.requestPermission()
			.then(()=>{
				console.log('Notifications supported');
				obj.getToken(
					token => {
						obj.saveToken(token);
						if(success != undefined)success(token);
					},
					err => {
						console.log('Error getting token ', err);
						if(success != undefined)failure(err);
					}
				);
				
			})
			.catch(function(err) {
				console.log('Unable to get permission to notify.', err);
				if(success != undefined)failure(err);
			})
	};
	
	obj.checkMessaging = () => {
		return $localStorage.savedToken != undefined;
	};
	
	
	//************************************* Database ******************************************
	
	obj.set = function(child, data){
		db.ref(child).set(data);
	};
	
	//returns promise
	obj.get = function(child){
		return db.ref(child).once("value").then(function(snapshot){
			return snapshot.val();
		});
	};
	
	obj.getList = function(child){
		
	};
	
	obj.onChange = function(child, type, callback){
		return db.ref(child).on(type, snapshot => {
			callback(snapshot);
		});
	};
	
	obj.getLastChild = (child, callback) => {
		db.ref(child).limitToLast(1).on("child_added", function(snapshot) {
			callback(snapshot.val());
		});
	};
	
	obj.update = function(child, obj){
		return db.ref(child).update(obj);
	};
	
	obj.getOrderedbyLast = function(child, prop, num){
		return db.ref(child).orderByChild(prop).limitToLast(num);
	};
	
	obj.pushKey = (child) => {
		return db.ref(child).push();
	};
	
	obj.push = function(child, data){
		return db.ref(child).push().set(data);
	};
	
	obj.getCollection = function(child){
		return $firebaseArray(db.ref(child));
	};
	
	obj.getObject = function(child){
		return $firebaseObject(db.ref(child));
	};
	
	return obj;
}]);

app.controller('mainCtrl', ['$scope', 'FB', 'NgMap', '$http', '$localStorage', 'ionicToast', function($scope, FB, NgMap, $http, $localStorage, ionicToast){
	$scope.googleMapsUrl="https://maps.googleapis.com/maps/api/js?key=AIzaSyCB-bZyNYdVVERXOPnYz_9X9ZCOo2WbgUE";
	
	let marker = null;
	
	$scope.test = $localStorage.savedToken != undefined;
	
	$scope.dropOff = {};
	
	$scope.address = null;
	
	$scope.last = null;
	
	$scope.toggleNotification = () => {
		if($scope.test){
			FB.enableMessaging(token=>{
				console.log(token);
				ionicToast.show('Notifications Enabled', 'bottom', false, 4000);
			}, error=>{
				console.log(error);
				ionicToast.show('Cannot enable notifications at the moment', 'bottom', false, 4000);
			});
		}else{
			FB.deleteToken();
		}
	};
	
	FB.handleMessage(payload => {
		console.log(payload.notification.title, payload.notification.body);
		alert(payload.notification.title+" : "+payload.notification.body);
	});
	
	$scope.generateCode = (length, chars) => {
		let result = '';
		for (let i = length; i > 0; --i) result += chars[Math.round(Math.random() * (chars.length - 1))];
		return result;
	};
	
	$scope.sendLocation = () => {
		// ionicToast.show('Location Sent!', 'bottom', false, 1000);
		FB.push('/couponList', {
			code: $scope.generateCode(5, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ').toString(),
			lat : $scope.dropOff.lat.toString(),
			lng : $scope.dropOff.lng.toString(),
			sender: $scope.test ? $localStorage.savedToken : null
		});
	};
	
	FB.getLastChild('couponList', val => {
		$scope.last = val;
	});
	
	
	$scope.getAddress = pos => {
		$http({
			url:`https://maps.googleapis.com/maps/api/geocode/json?latlng=${pos.lat},${pos.lng}&sensor=true`,
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
