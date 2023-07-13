$(function () {

    $(document).on('click','.google-login-btn',function(){
     	chrome.runtime.sendMessage({type:'checkForGoogleLogin'})
    });

    homePage();
  
});


function homePage() {
	
$('.tab').hide();
$('.tab-1').show()


chrome.storage.local.get(["isGoogleLogin"], function(result) {
	console.log(result)
	if(typeof result.isGoogleLogin != "undefined" && result.isGoogleLogin == 1){
		window.location.href = chrome.runtime.getURL("index.html");
	}
});

	
}


// Listen for message to reload current page
chrome.runtime.onMessage.addListener(function(message, sender, send_response){
   // add group 
		if (message.action == 'googleLogin') {
			if (message.isGoogleLogin) {
				homePage()
			}
		}else if (message.type == 'badClientId') {
			toastr["error"]('bad client id: APP_ID_OR_ or ORIGIN_NOT_MATCH');
		}


	})

