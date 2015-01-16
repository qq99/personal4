// Anthony Cameron, July 26, 

$(document).ready(function()
{
  $("#document_options .toggle").click(function(){
    var to_close = $("#document_options h4, #document_options ul");
    if ($(this).hasClass("close")){
      $(this).removeClass("close");
      $(this).addClass("expand");
      to_close.hide();
    }
    else
    {
      $(this).addClass("close");
      $(this).removeClass("expand");
      to_close.show();
    }
  });
  $("#document_options #more_technical").click(function(){
    var barebones = $("h1.title, #author, #gallery, #introduction, #vision, #gallery, #references"); 
    if ($(this).is(":checked"))
    {
      $("article").children().hide();
      barebones.show();
    }
    else
    {
      $("article").children().show();
      $("noscript").hide();
      $(".forprint").hide();
    }
  });
  
  var starting_width = ( 100 * parseFloat($('article').css('width')) / parseFloat($('body').css('width')));

  $("#width_slider").slider({
			value:0,
			min: -35,
			max: 15,
			step: 1,
			slide: function( event, ui ) {			  
			  $("article").animate({
			    "width": ((starting_width + ui.value) + "%")
		    }, 0);
			}
	});
	
	
	var old_font_slider = 0;
	var to_change = $("article p, article h1, article h2, article h3, article h4, article h5, article ul li, article ol li, article code, article a");
  $("#font_slider").slider({
			value:0,
			min: -3,
			max: 3,
			step: 1,
			slide: function( event, ui ) {			  
		    var diff = ui.value - old_font_slider;
		    console.log(diff);
			  to_change.each(function(){
			    var cur = parseInt($(this).css("font-size"));
			    $(this).css("font-size", cur+diff);
		    });
		    old_font_slider = ui.value;
			}
		});				
		
  jQuery("#picasagallery").EmbedPicasaGallery('ar.cameron',{
    albumid: "5631455218906031857",
    size: 144, // thumb size
    loading_animation: "http://oss.oetiker.ch/jquery/css/loading.gif",
    msg_more: 'show<br/>more',
    show_more: 5
  });
}); // end document ready
