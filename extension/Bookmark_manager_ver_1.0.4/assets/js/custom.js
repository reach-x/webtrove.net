var mainArray = '';
var levelOneHtml = '';
var levelTwoHtml = '';
var projectTitle = ''
var NotFoundUrl =  `<span class="no-url-found">No url found.</span>`;
$(function () {

	chrome.runtime.sendMessage({'type':'getFreshData'});

  	$(document).on('click','span.level-1-item',function(){
   		var levelOneKey = $(this).attr('data-key')
  		var list2Html = '';
  		$('.level-2').html(list2Html);


  		var tempLinks = bookMarkArray[levelOneKey].links
  

  		if (tempLinks.length) {
	  		tempLinks.forEach(function (oneT, oneId) {
				
				list2Html += `  <span title="`+oneT.bookmark+`" data-key="`+oneT.url+`"  class="level-2-item level-2-link level-2-com">
	                          <img src="chrome://favicon/`+oneT.url+`">`+oneT.bookmark+`</span>`;
	                  

			});
			 $('.level-2').html(list2Html);
  		}else{
  			$('.level-2').html(NotFoundUrl);
  		}

		
		$('.level-1-item').removeClass('current-sub');
		$('.level-1-item').addClass('hover-css');
		$(this).addClass('current-sub')
		$(this).removeClass('hover-css')
    });

    $(document).on('click','.level-2-link, .level-1-link',function(){
       window.open($.trim($(this).attr('data-key')));
    });

  

    homePage();

    

    $(document).on('click','.logout-link',function(){
      	chrome.storage.local.set({isGoogleLogin: 0 });
      	homePage()
    });


  
})


function homePage() {
	
$('.tab').hide();
$('.tab-2').show()


chrome.storage.local.get(["isGoogleLogin"], function(result) {
	console.log(result)
	if(typeof result.isGoogleLogin != "undefined" && result.isGoogleLogin == 1){
		//window.location.href = window.location.origin+'/index.html';
	}else{
		window.location.href = window.location.origin+'/login.html';
	}
});

	
}

var bookMarkArray = [];

chrome.runtime.onMessage.addListener(function(message, sender, send_response){

	if (message.type == 'freshBookMarks') {
		freshBookMarks = message.freshBookMarks;
		projectTitle =  freshBookMarks.project_title;
		$('.project-title').html(projectTitle)
		bookMarkArray = freshBookMarks.bookmarks;
		displayBookmarks();
	}else if (message.type == 'badClientId') {
		toastr["error"]('bad client id: APP_ID_OR_ or ORIGIN_NOT_MATCH');
	}

})


function displayBookmarks() {
		var levelOneHtml1 = '';
		bookMarkArray.forEach(function (oneBookmark, oneId) {
			
			levelOneHtml1 += `<span title="`+oneBookmark.title+`" data-key="`+oneId+`" class="level-1-item sub-items hover-css">
			<i class="fa fa-folder" aria-hidden="true"></i><span class="sub-items-text">`+oneBookmark.title+`</span><i class="fa fa-caret-right"></i>
			</span>
			</span>`;

		});

		$('.level-1').html(levelOneHtml1)	
}
