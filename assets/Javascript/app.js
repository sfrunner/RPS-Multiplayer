$(document).ready(function(){
	// Initialize Firebase
  	var config = {
  		apiKey: "AIzaSyAjpsly3uR9VJheiGcMuNBHbwKvUeivtkc",
  		authDomain: "rps-week-7-sbf.firebaseapp.com",
  		databaseURL: "https://rps-week-7-sbf.firebaseio.com",
  		storageBucket: "rps-week-7-sbf.appspot.com",
  		messagingSenderId: "208779766537"
  	};
  	firebase.initializeApp(config);
  	var db = firebase.database();
  	db.ref(".info/connected").on("value",function(snapshot){
  		console.log(snapshot.val());
  	});
  	
  	db.ref().set({
  		name: "Steven"
  	});
  	
  	console.log("hello");
  	
});
