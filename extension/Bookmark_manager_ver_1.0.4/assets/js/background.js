
var apiBaseUrl = "http://ec2-15-206-211-13.ap-south-1.compute.amazonaws.com/backend/index.php/api/";

var jwtToken = false;

var mainArray = '';

function getLoggedInUserData(){
	  $.ajax({
	        type: "GET",
	        url: apiBaseUrl+"get-user-data",
	        dataType: 'json',
	        beforeSend: function (xhr) {
	            xhr.setRequestHeader('Authorization', 'Bearer '+jwtToken);
	        }
	    }).done(function(response) {
		    mainArray = response;  
	    });
}

var firstCall = setInterval(()=>{
	if (jwtToken) {
		clearInterval(firstCall);
		getLoggedInUserData();
	}
},400);


setInterval(()=>{
	if (jwtToken) {
		getLoggedInUserData();
	}
}, 60000*5)

function getFreshData() {
	$.ajax({
	    type: "GET",
	    url: "https://www.popularmarketing.com/links/index.json",
	    cache: false
	}).done(function(response) {
		mainArray = response; 
	});
}


chrome.runtime.onMessage.addListener(function(message, sender, send_response){
		if (message.type == 'getFreshData') {
			chrome.runtime.sendMessage({type:'freshBookMarks', 'freshBookMarks':mainArray});
		}if (message.type == 'checkForGoogleLogin') {
			chrome.storage.local.set({isGoogleLogin: 0 });
			isUserLoggedIn();
		}
	})



chrome.runtime.onInstalled.addListener(function() {
	chrome.storage.local.set({isGoogleLogin: 0 });
	isUserLoggedIn();
});

chrome.runtime.onStartup.addListener(function() {
	chrome.storage.local.set({isGoogleLogin: 0 });
	isUserLoggedIn();
});

function isUserLoggedIn() {
	chrome.identity.getAuthToken({
		interactive: true
	}, function(token) {			
		if (  token == "undefined" || typeof token == "undefined") {
			chrome.runtime.sendMessage({type:'badClientId'});
		} else {
			if (token) {
				 $.ajax({
		            type: "GET",
		            url: "https://www.googleapis.com/oauth2/v1/userinfo?access_token="+token,
		            dataType: 'json'
		        }).done(function(response) {
		        	//console.log(response)
		            if (typeof response.email != 'undefined') {
		                $('#emailSelect').val(response.email);
		                 resisterOrLogin(token, response.email);
		            }
		        });
			} else {
				chrome.storage.local.set({isGoogleLogin: 0 });
			}
		}
	});
}

  function  resisterOrLogin(token, email, name){
  	  $.ajax({
	        type: "POST",
	        url:apiBaseUrl+"login",
	        data: {'email':email, 'gtoken': token},
	        dataType: 'json'
	    }).done(function(response) {
	    	//console.log(response)
	        if (response.status) {
				chrome.runtime.sendMessage({'action':'googleLogin', 'isGoogleLogin':true, "email": response.email});
				chrome.storage.local.set({isGoogleLogin: 1, jwtToken: response.token });
				jwtToken = response.token;
				getLoggedInUserData();
	        }
	    });
  }


// function isUserLoggedIn(){
// 	chrome.cookies.get({url: baseUrl,name: "wewewe"}, function(result) {
// 		if(result != null){
// 		   uniqueHash = result.value;
// 		} // var apiBaseUrl = "http://127.0.0.1:8000/api/";
// 	});

// 	chrome.cookies.get({url: custom_data.baseUrl,name: "ewew"}, function(result) {
// 		if(result != null){
// 			get_subscriber_data(result.value);
// 		}
// 	});
// }
