$(document).ready(function(){
	var userCount;
	var gameStatus;
	var usersToPlay;
	var userCanPlay;
	var gameArray = ["rock","paper","scissors"];
	var versusArray = [];
	var winner;
	var loser;
	var tie;
	var numberWins;
	var numberLosses;
	var numberTies;
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
  	var userName = prompt("Please Type in Full Name");
  	db.ref().on("value",function(results){
    		$.each(results.val().userRecords, function(i,val){  			
  			if(i === userName){
  				numberWins = val.Wins;
  				numberLosses = val.Losses;
				numberTies = val.Ties;
				console.log(val.Losses);
			}
			});
			if(results.val().userRecords == null){
				console.log("Does not exist");
				db.ref("/userRecords/" + userName).set({
					userID: userName,
					Wins: 0,
					Losses: 0,
					Ties: 0,
				});
				numberWins = 0;
				numberLosses = 0;
				numberTies = 0;
			}
			else if(results.val().userRecords.hasOwnProperty(userName) === false){
					console.log(results.val().userRecords.hasOwnProperty(userName));
					db.ref("/userRecords/" + userName).set({
						userID: userName,
						Wins: 0,
						Losses: 0,
						Ties: 0,
					});
					numberWins = 0;
					numberLosses = 0;
					numberTies = 0;
			}
  		$("#wins").html(numberWins);
		$("#losses").html(numberLosses);
		$("#ties").html(numberTies);
		$("#username").html(userName);
  	});  	
  	
  	
  	//How Many Users & Limit to 2 at a time to return for playing
  	var userRef = db.ref("/presence/" + userName);
  	var amOnline = db.ref("/.info/connected/");
  	var gamePlay = db.ref("/game/" + userName);
  	var chat = db.ref("/chat/");
	amOnline.on('value', function(snapshot) {
 		if(snapshot.val()){
 			userRef.onDisconnect().remove();
 			gamePlay.onDisconnect().remove();
 			userRef.set({
    			userID: userName,
    			timeStamp: firebase.database.ServerValue.TIMESTAMP
      		});
    		db.ref("/presence/").orderByChild("timeStamp").limitToFirst(2).on("value", function(snap){
    			userCount = snap.numChildren();
    			console.log(userCount);
       			usersToPlay = snap.val();
      			$.each(usersToPlay, function(a,val){
      				//console.log(val.userID);
      				if(userName === val.userID){
      					userCanPlay = "true";
      				}
      			});
      			if(userCanPlay === "true"){
      				console.log("You're In");
      				$("#gamestatus-text").html("You are now playing");
      				$("#buttons, #result-display").show();
      				
      			}
      			else if(userCanPlay !== "true"){
      				$("#buttons, #result-display").hide();
      				//console.log("You're Out");
      				$("#gamestatus-text").html("You are on standby");

      			}
      		});
      	}
      });
      $("#buttons").on("click", function(event){
				//console.log(event);
      	db.ref("/game/" + userName).set({
      		userID: userName,
      		userChoice: event.target.innerHTML,
      	});
      	db.ref("/game/").on("value",function(choices){
      		if(choices.numChildren() === 2){
      			//console.log(choices.val());
      			$.each(choices.val(), function(b,val){
      				//console.log(val);
      				versusArray.push(val);
      				console.log(versusArray);
      				console.log(val.userID);
      				if(val.userID === userName){
      					$("#userChoice").html("You chose " + val.userChoice);
      				}
      				else if(val.userID !== userName){
      					$("#opponentChoice").html(val.userID + " chose " + val.userChoice);
      				}
      			});
      			
      			
      			//Game Criteria
      			if(versusArray[0].userChoice.toLowerCase() === "rock" && versusArray[1].userChoice.toLowerCase() === "scissors"){
					winner = versusArray[0].userID;
					loser = versusArray[1].userID;
					
				}
				else if(versusArray[0].userChoice.toLowerCase() === "paper" && versusArray[1].userChoice.toLowerCase() === "rock"){
					winner = versusArray[0].userID;
					loser = versusArray[1].userID;
					
				}
				else if(versusArray[0].userChoice.toLowerCase() === "scissors" && versusArray[1].userChoice.toLowerCase() === "paper"){
					winner = versusArray[0].userID;
					loser = versusArray[1].userID;
					
				}
				if(versusArray[1].userChoice.toLowerCase() === "rock" && versusArray[0].userChoice.toLowerCase() === "scissors"){
					winner = versusArray[1].userID;
					loser = versusArray[0].userID;
					
				}
				else if(versusArray[1].userChoice.toLowerCase() === "paper" && versusArray[0].userChoice.toLowerCase() === "rock"){
					winner = versusArray[1].userID;
					loser = versusArray[0].userID;
					
				}
				else if(versusArray[1].userChoice.toLowerCase() === "scissors" && versusArray[0].userChoice.toLowerCase() === "paper"){
					winner = versusArray[1].userID;
					loser = versusArray[0].userID;
					
				}
				else if(versusArray[1].userChoice.toLowerCase() === versusArray[0].userChoice.toLowerCase()){
					tie = "true";
								
				}
			
      			db.ref("/game/").remove();				
				console.log(winner);
      			console.log(loser);
      			console.log(tie);
      			
				//winner/loser display
				if(winner === userName){
					$("#result").html("You Win!");
					numberWins++;
					db.ref("/userRecords/" + userName).set({
						userID: userName,
						Wins: numberWins,
						Losses: numberLosses,
						Ties: numberTies,
					});
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
				}
				
				
				//Reset Winner, Loser, Tie, and versusArray Variables
				winner = "";
				loser = "";
				tie = "";	
				versusArray = [];				
      				     	
  			}
  			else{
  				versusArray = [];
  			}
		

		console.log("hello");
		//Chat Functionality
		 						
      	});
    });
    $("#submit-btn").on("click",function(){
			message = $("#message-box").val().trim();
			console.log(message);
			db.ref("/chat/").push({
				userID: userName,
				text: message,
				timeStamp: firebase.database.ServerValue.TIMESTAMP
			});
	});
			db.ref("/chat/").orderByChild("timeStamp").limitToLast(10).on("child_added",function(chat){
					console.log(chat.val().text);
					var newSection = $("<section>");
					newSection.attr("class", "messages");
					newSection.html("<strong>" + chat.val().userID + ":</strong> " + chat.val().text);
					$("#chat").append(newSection);
			});

		
});
