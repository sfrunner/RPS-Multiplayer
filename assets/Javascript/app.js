$(document).ready(function(){
	$("#buttons-div").hide();

	//Global Variables
	var userCount;
	var gameStatus;
	var usersToPlay;
	var userCanPlay;
	var gameArray = ["rock","paper","scissors"];
	var versusArray = [];
	var winner;
	var loser;
	var tie;
	var numberWins = 0;
	var numberLosses = 0;
	var numberTies = 0;
	var message;
	
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
  	db.ref("/presence/").on("value", function(snapshot){
		if(snapshot.numChildren() == 0){
			db.ref("/chat/").remove();
		}
	});

	//User Prompt and Null Check for UserRecords to add User
  	var userName = prompt("Please Type in Full Name");
  	db.ref().on("value",function(results){
    	$.each(results.val().userRecords, function(i,val){  			
  			if(i === userName){
  				numberWins = val.Wins;
  				numberLosses = val.Losses;
				numberTies = val.Ties;
			}
		});
		if(results.val().userRecords == null){
			db.ref("/userRecords/" + userName).set({
				userID: userName,
				Wins: 0,
				Losses: 0,
				Ties: 0,
			});
		}
		else if(results.val().userRecords.hasOwnProperty(userName) === false){
			db.ref("/userRecords/" + userName).set({
				userID: userName,
				Wins: 0,
				Losses: 0,
				Ties: 0,
			});
		}
		$("#username").html("Your User Name is " + userName);	
  		$("#wins").html("Wins: " + numberWins);
		$("#losses").html("Losses: " + numberLosses);
		$("#ties").html("Ties: " + numberTies);
  	});  	
  	
  	
  	//How Many Users & Limit to 2 at a time to return for playing
  	
  	var userRef = db.ref("/presence/" + userName);
  	var amOnline = db.ref("/.info/connected/");
  	var chat = db.ref("/chat/");
	amOnline.on('value', function(snapshot) {
 		if(snapshot.val()){
 			userRef.onDisconnect().remove();
 			userRef.set({
    			userID: userName,
    			timeStamp: firebase.database.ServerValue.TIMESTAMP
      		});
    		db.ref("/presence/").orderByChild("timeStamp").limitToFirst(2).on("value", function(snap){
    			userCount = snap.numChildren();
       			usersToPlay = snap.val();
      			$.each(usersToPlay, function(a,val){
      				if(userCount == 1){
      					$("#gamestatus-text").html("Your Current Status: Game Is Waiting For One More Player");	
      					$("#buttons-div, #result-display").hide();
      					userCanPlay = "false";
      				}
      				if(userName === val.userID && userCount > 1){
      					userCanPlay = "true";
      				} 
      			});
      			if(userCanPlay === "true"){
      				$("#gamestatus-text").html("Your Current Status: In Session");
      				$("#buttons-div, #result-display").show();
      			}
      			else if(userCanPlay !== "true" && userCount > 1){
      				$("#buttons-div, #result-display").hide();
      				$("#gamestatus-text").html("Your Current Status: Your Are On Standby");
      			}
      		});
      	}
     });

	//On-Click Function for Buttons and to send choices to Firebase	
     $(".buttons").on("click", function(event){
		event.preventDefault();
		$("#userChoice").html("You chose " + event.target.innerHTML.toLowerCase());
		$("#currentStatus").html("Waiting on other player...");
      	db.ref("/game/" + userName).set({
      		userID: userName,
      		userChoice: event.target.innerHTML,
      	});
      	
      	//Listener for Changes to Game Directory in Firebase
      	db.ref("/game/").on("value",function(choices){
      		if(choices.numChildren() === 2){
      			$("#currentStatus").html("");
      			$.each(choices.val(), function(b,val){
      				versusArray.push(val);
      				if(val.userID !== userName){
      					$("#opponentChoice").html(val.userID + " chose " + val.userChoice.toLowerCase());
      				}
      			});
      			
      			//Game Criteria for Result
      			if(versusArray[0].userChoice.toLowerCase() === "rock" && versusArray[1].userChoice.toLowerCase() === "scissors"){
					winner = versusArray[0].userID;
					loser = versusArray[1].userID;
					versusArray = [];
				}
				else if(versusArray[0].userChoice.toLowerCase() === "paper" && versusArray[1].userChoice.toLowerCase() === "rock"){
					winner = versusArray[0].userID;
					loser = versusArray[1].userID;
					versusArray = [];
				}
				else if(versusArray[0].userChoice.toLowerCase() === "scissors" && versusArray[1].userChoice.toLowerCase() === "paper"){
					winner = versusArray[0].userID;
					loser = versusArray[1].userID;
					versusArray = [];
				}
				else if(versusArray[1].userChoice.toLowerCase() === "rock" && versusArray[0].userChoice.toLowerCase() === "scissors"){
					winner = versusArray[1].userID;
					loser = versusArray[0].userID;
					versusArray = [];
				}
				else if(versusArray[1].userChoice.toLowerCase() === "paper" && versusArray[0].userChoice.toLowerCase() === "rock"){
					winner = versusArray[1].userID;
					loser = versusArray[0].userID;
					versusArray = [];
				}
				else if(versusArray[1].userChoice.toLowerCase() === "scissors" && versusArray[0].userChoice.toLowerCase() === "paper"){
					winner = versusArray[1].userID;
					loser = versusArray[0].userID;
					versusArray = [];
				}
				else if(versusArray[1].userChoice.toLowerCase() === versusArray[0].userChoice.toLowerCase()){
					tie = "true";
					versusArray = [];		
				}
				db.ref("/game/").remove();		
				
				//winner-loser display and update of records in UserRecords Firebase Directory
				if(winner === userName){
					$("#result").html("You Win!");
					numberWins++;
					db.ref("/userRecords/" + userName).set({
						userID: userName,
						Wins: numberWins,
						Losses: numberLosses,
						Ties: numberTies,
					});
					winner = "";
					loser = "";
					tie = "";	
					versusArray = [];
				}
				else if(loser === userName){
					$("#result").html("You Lose!");
					numberLosses++;
					db.ref("/userRecords/" + userName).set({
						userID: userName,
						Wins: numberWins,
						Losses: numberLosses,
						Ties: numberTies,
					});	
					winner = "";
					loser = "";
					tie = "";	
					versusArray = [];
				}
				else if(tie === "true"){
					$("#result").html("You tied!");
					numberTies++;
					db.ref("/userRecords/" + userName).set({
						userID: userName,
						Wins: numberWins,
						Losses: numberLosses,
						Ties: numberTies,
					});	
					winner = "";
					loser = "";
					tie = "";	
					versusArray = [];
				}
				
				
				//Reset Winner, Loser, Tie, and versusArray Variables
				setTimeout(function(){
					$("#userChoice, #result, #opponentChoice").html("");
				},3000);    	
  			}
			else if(choices.numChildren() > 2){
				db.ref("/game/").remove();
			}
  			else{
  				versusArray = [];
  			}		 						
      	});
   	});

     //Chat Functional (Submit On-Click Listener and Set/Receive Messages from Firebase (Limit = 10))
    $("#submit-btn").click(function(){
		message = $("#message-box").val().trim();
		$("#message-box").val("");
		db.ref("/chat/").push({
			userID: userName,
			text: message,
			timeStamp: firebase.database.ServerValue.TIMESTAMP
		});
	});
	db.ref("/chat/").orderByChild("timeStamp").limitToLast(10).on("child_added",function(chat){
		var newSection = $("<section>");
		newSection.attr("class", "messages");
		newSection.html("<strong>" + chat.val().userID + ":</strong> " + chat.val().text);
		$("#chat").append(newSection);
	});
});