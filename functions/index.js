'use strict';

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const moment = require('moment');

admin.initializeApp(functions.config().firebase);


function sendTopicNotification(topic, payload, priority){
	admin.messaging().sendToTopic(topic, payload, {"priority": priority})
		.then(function(response) {
			console.log("Successfully sent message:", response);
		})
		.catch(function(error) {
			console.log("Error sending message:", error);
		});
}

function sendNotification(receiver, payload, priority){
	admin.messaging().sendToDevice(receiver, payload, {"priority": priority})
		.then(function(response) {
			console.log("Successfully sent message:", response);
		})
		.catch(function(error) {
			console.log("Error sending message:", error);
		});
}

exports.boardcastCoupon = functions.database.ref('/couponList/{pushId}')
	.onWrite(event => {
		let coupon = event.data.val();
		let time = moment().utcOffset("-04:00").add(1, 'h');
		let androidPayload = {
			"data":{
				"title": "Special Offer!",
				"code" : coupon.code,
				"lat" : coupon.lat,
				"lng" : coupon.lng,
				"exp" : time.format('x').toString()
			}
		};
		
		console.log(coupon, androidPayload);
		
		let webPayload = {
			"notification" : {
				"title" : "Special Offer!",
				"click_action" : "https://lilys-aaf3d.firebaseapp.com",
				"body" : `Order by ${time.format('h:mm:ss a')} and get free delivery to your location using the code ${coupon.code}`,
				"icon" : "https://firebasestorage.googleapis.com/v0/b/lilys-aaf3d.appspot.com/o/images%2FLily.png?alt=media&token=3528a95a-328e-4ca0-bf01-8502df8df985"
			}
		};
		
		sendTopicNotification('coupon', androidPayload, 'normal');
		if(coupon.sender != null)sendNotification(coupon.sender, webPayload, 'high');
	});
