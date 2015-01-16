if (typeof console == 'undefined') console = {log: $.noop}; // if I forget any console.log this
															// will save my ass ;)
var view = null; // need to select a view on ready




// change stylesheet if the user has a preference already															
if($.cookie("stylesheet")) {
	$("link.maximal").attr("href",$.cookie("stylesheet"));
}

var isTooSmall = function(){
	if ($(window).height() < 550 || $(window).width() < 660){
		return true;
	}
	return false;
};

var optimize = function(){
	$("#buttons").css("bottom",$("footer").outerHeight()+10);
	if (isTooSmall()){
		console.log("viewing window is too small, altering view");
		$("#buttons").hide(); // remove the buttons to switch modes
		if (view != minimal){ // and change to minimal mode, if they're not already in it
			view.unload();
			view = minimal;
			view.init();
		}
	}
	else {
		console.log("#viewing window is fine, keeping view");
		$("#buttons").show();
		if (view != maximal && $("#toggle_view").hasClass("maximized")){ // only swap if they originally wanted maximal mode
			view.unload();
			view = maximal;
			view.init();
		}
	}
}


/* minimal mode ----------- */
var minimal = {};
(function(){
	var active = false;
	
	this.init = function(){
		if (active) return; // only init once 
		active=true;
		console.log("initializing minimal mode");
	};
	this.animating = function(){
		return false;
	};
	this.resize = function(){
		console.log("running minimal resize code");
		return;
	};
	this.unload = function(){
		if (!active) return;
		console.log("unloading minimal mode");
		active = false;
	};
}).apply(minimal);

// --- maximal mode ------------------------------------------------------------------------------
var maximal = {};
(function(){
	// ~~~ private members ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~:	
	var isAnimating = 0;
	var initd = false;
	var active = false;
	// we don't wanna allow the user to click on 2 tabs before the animations are complete
	// so this is a C.V. for synchronizing the 1-5 different animating divs
	var sections = null; // refers to the main animated portions
	var getOffset = function(section){ // fixes the indentation issue
		var offset = -1;
		if (section.hasClass("first")){
			offset = section.width() - section.find(".tab").width();
		}
		else {
			offset = section.width();
		}
		return offset;
	};
	
	// todo: make all animations consistent, that is, not 6 separate animations
	// but animate all 6 sections simultaneously s.t. one may never overlap another
	
	// animates *one* section right
	var moveRight = function(section, lOffset){
		isAnimating+=section.length;
		section.animate({
			left: ('+=' + lOffset)
		},500, function(){
			if (typeof callback == 'function'){
				callback();
				console.log("right cb fired");
			}
			isAnimating-=1;
		});
	};
	
	// animates *one* section left
	var moveLeft = function(section, lOffset, callback){
		isAnimating+=section.length;
		section.animate({
			left: ('-='+ lOffset)
		},500, function(){
			if (typeof callback == 'function') {
				callback();
				console.log("left cb fired");
			}
			isAnimating-=1;
		});
	};
	
	// logical commands for showing / hiding a section
	var hideSection = function(section, callback){
		section.removeClass("expanded");
		var offset = getOffset(section);
		moveLeft(section, offset, callback); // close the current one
		moveLeft(section.nextAll(), offset); // and all its following siblings
	};
	var showSection = function(section){
		if (section.hasClass("expanded")) return; // but don't expand it if it is already open
		
		var expanded = sections.filter(".expanded");
		var openSection = function(){
			section.addClass("expanded");
			var offset = getOffset(section);
			moveRight(section, offset);
			moveRight(section.nextAll(), offset);	
		};
		if (expanded.length >0){ // if there is one open, first move it left
			hideSection(expanded, openSection);
		}
		else { // if none are open
			openSection(); // simply move the requested section open
		}
	};
	
	var sectionClicked = function(section){
		return (function(){
			console.log("clicked");
			if (isAnimating!=0) return; // can't allow multiple clicks until the animations are over
			if (section.hasClass("expanded")){ // it is expanded, so we need to contract it
				hideSection(section);
			}
			else { // it isn't expanded, so we need to expand it
				showSection(section);
			}
		});
	};
	
	// ~~~ public members ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~:
	
	this.init = function(){
		console.log("initializing maximal mode");
		if (active) return; // only perform once
		active=true;
		if (!initd){ // thing here is the DOM needs to be ready
			console.log("doing once only initalization re: DOM");
			sections = $("#main section");
			initd = true;
		}
		// load a section if the user has an anchor highlighted
		if (window.location.href.indexOf('#') != -1){ // if there is an anchor
			var hash = window.location.href.slice(window.location.href.indexOf('#') + 1);
			var section = $("section ." + hash);
			showSection(section, getOffset(section));
		}
		this.bindClicks();

		sections.each(function(){
			var section=$(this);
			section.find("div.content .container").jScrollPane(
				{
					showArrows: true,
					horizontalGutter: 30,
					verticalGutter: 30,
					verticalDragMaxHeight: 25,
					mouseWheelSpeed: 60
				});
		});
	};
	
	this.bindClicks = function(){
		/* click handlers */
		sections.each(function(){
			var section = $(this);
			section.find(".tab").click(sectionClicked(section));
		});
	};
	
	this.unbindClicks = function(){
		console.log("unbinding click functions");
		sections.each(function(){
			var section = $(this);
			section.find(".tab").unbind('click');
		});
	};
	
	this.resize = function(){
		console.log("running maximal resize code");
		sections.each(function(){
			var section=$(this);
			section.find("div.content .container").jScrollPane().data("jsp").reinitialise();
		});
	};
	
	this.unload = function(){
		if (!active) return;
		active = false;
		console.log("unloading maximal mode");
		this.unbindClicks();
		sections.each(function(){
			var section=$(this);
			section.find("div.content .container").jScrollPane().data("jsp").unload();
		});
	};
	
	this.animating = function(){
		console.log(isAnimating != 0);
		return (isAnimating != 0);
	};
	
}).apply(maximal);



$(document).ready(function(){
	console.log("document ready");
	$("#noscript").hide(); // if they make it this far, safe to assume they have .js enabled

	// detect cookies for stylesheet and change button accordingly:
	if ($.cookie("stylesheet") == "css/minimal.css"){
		console.log("cookie stylesheet: " + $.cookie("stylesheet"));
		$("#toggle_view").removeClass("maximized");
		view = minimal;
	}
	else {
		view = maximal;
	}
	// detect cookies for animation and change button accordingly
	if($.cookie("animation")){
		console.log("cookie animation: " + $.cookie("animation"));
		if ($.cookie("animation") == "off"){
			$("#toggle_animation").removeClass("on");
			jQuery.fx.off = true; // a global setting, so not referenced in our views
		}
	}

	// viewport resize specific:
	var rTimeout=0;
	var rHandler = function(){
		var foo = function(){
			view.resize(); // things the view must take care of
			optimize();
		};		
		window.clearTimeout(rTimeout);
		rTimeout = window.setTimeout(foo,75);
	};
	$(window).resize(rHandler);
	// viewport resize specific ends
		
	optimize(); // do initial optimization
	view.init(); // init the view if it hasn't already
	
	// global buttons:
	$("#toggle_animation").click(function(){
		if (view.animating()) return;
		if ($(this).hasClass("on")) {
			console.log("should be off:");
			$(this).removeClass("on");
			$.cookie("animation","off", {expires: 365, path: '/'});
			jQuery.fx.off = true;
			// add code in here to change view to the other object
			console.log("   cookie animation is now: " + $.cookie("animation"));
		}
		else {
			console.log("should be on:");
			$(this).addClass("on");
			$.cookie("animation","on", {expires: 365, path: '/'});
			jQuery.fx.off = false;
			// add code in here to change view to the other object
			console.log("   cookie animation is now: " + $.cookie("animation"));
		}
	});
	$("#toggle_view").click(function(){
		if (view.animating()) return;
		var data = $("link.maximal").data("stylesheets");
		if ($(this).hasClass("maximized")){
			$(this).removeClass("maximized");
			view.unload();
			$("link.maximal").attr("href",data["minimal"]);
			$.cookie("stylesheet",data["minimal"], {expires: 365, path: '/'});
			view = minimal;
			view.init();
			console.log("cookie stylesheet is now: " + $.cookie("stylesheet"));
		}
		else {
			$(this).addClass("maximized");
			view.unload();
			$("link.maximal").attr("href",data["maximal"]);
			$.cookie("stylesheet",data["maximal"], {expires: 365, path: '/'});
			view = maximal;
			view.init();
			console.log("cookie stylesheet is now: " + $.cookie("stylesheet"));
		}
	});
	// global tooltips:
	$("#toggle_animation").mouseenter(function(event){
		var data = $(this).data("tooltip");
		if ($(this).hasClass("on")){
			$("#tooltip").text(data.on);
		}
		else{
			$("#tooltip").text(data.off);
		}
		$("#tooltip").show();
	});
	$("#toggle_animation").mouseleave(function(event){
		$("#tooltip").hide();
	});
	$("#toggle_animation").click(function(event){
		$("#toggle_animation").trigger('mouseenter');
		event.preventDefault();
	});
	$("#toggle_view").mouseenter(function(event){
		var data = $(this).data("tooltip");
		if ($(this).hasClass("maximized")){
			$("#tooltip").text(data.maximized);
		}
		else {
			$("#tooltip").text(data.minimized);
		}
	});
	$("#toggle_view").mouseleave(function(event){
		$("#tooltip").hide();
	});
	$("#toggle_view").click(function(event){
		$("#toggle_view").trigger('mouseenter');
		event.preventDefault();
	});
	$(".button").mousemove(function(event){ //tooltip follows user's mouse
		var button = $(this);
		var offset = button.offset();
		$("#tooltip").show();
		$("#tooltip").css({
			"left": event.clientX + 15,
			"top": event.clientY + 15
		});
	});	
});