/*
Depends: jquery.ui
*/
(function( $, undefined ) {

$.widget( "ui.scrollpane", {
	options: {
		vScroll: false,
		hScroll: false,
		disabled: false,
		vScrollCaps: true,
		hScrollCaps: true,
		vTrackWidth: 15,
		hTrackHeight: 15
	},
	
	_create: function() {
		console.log("_create()");
		this.element
			.addClass( "ui-scrollpane ui-widget" );
		
		// pane is the viewing area
		this.pane = $("<div class='ui-scrollpane-pane ui-widget'></div>")
			.width(this.element.width())
			.height(this.element.height())
			.css("position","relative") // any positioning is done relevant to this wrapper
			.css("clear","both");
		
		this.originalContent = this.element.html();
		
		// while content is the scrolling div
		this.content = $("<div class='ui-scrollpane-content ui-widget'></div>")
			.css("clear","both") // fixes collapsing margins
			.css("position","absolute")
			.append(this.originalContent);
				
		this.pane.append(this.content);
		this.element.html(this.pane);
		this.element.css("overflow","hidden");
		
		// scroll elements
		this.vertical = $("<div class='ui-scrollpane-trackbar-wrapper vertical ui-widget'></div>")
			.css("position","absolute")
			.css("right","0")
			.css("top","0")
			.css("display","block")
			.width(this.options.vTrackWidth)
			.height(this.pane.height())
			.append(this._createTrackbar());
		this.horizontal = $("<div class='ui-scrollpane-trackbar horizontal ui-widget'></div>");
	},
	
	_createTrackbar: function(){
		var track = $("<div class='ui-scrollpane-trackbar-track ui-slider-handle'></div>")
			.css("position","absolute")
			.css("bottom","100%");
		var cap1 = $("<div class='ui-scrollpane-trackbar-cap'></div>")
			.css("position","absolute");
		var cap2 = $("<div class='ui-scrollpane-trackbar-cap'></div>")
			.css("position","absolute");
		
		return $("<div class='ui-scrollpane-trackbar'></div>")
					.css("position","relative")
					.css("width","100%")
					.css("height","100%")
					.append(cap1)
					.append(track)
					.append(cap2);
	},
		
	_init: function(){
		console.log("_init()");
		this.options.vScroll |= this.content.height() > this.pane.height();
		this.options.hScroll |= this.content.width() > this.pane.width();
		this._updateTrackbars();
	},
		
	_updateTrackbars: function(){
		console.log("_updateTrackbars()");
		var oldWidth = this.pane.width();
		if (this.options.vScroll){
			this.pane.append(this.vertical);
			console.log(oldWidth - this.options.vTrackWidth);
			this.content.css('width', oldWidth - this.options.vTrackWidth + 'px');
		}
		else {
			this.vertical.remove();
			this.pane.width(this.element.width());
		}
		if (this.options.hScroll){
			this.pane.append(this.horizontal);
		}
		else {
			this.horizontal.remove();
		}
	},

	enable: function(){
		if (this.options.disabled == "true") return;
		console.log("enable()");
		this.options.disabled = false;
		this.element.html(this.pane);
		this._init();
	},
		
	disable: function(){
		if (this.options.disabled == "false") return;
		console.log("disable()");
		this.options.disabled = true;
		this.element.html(this.originalContent);
		this.element.css("overflow","");
	},
	
	destroy: function() {
		this.element
			.removeClass("ui-scrollpane ui-widget");

		this.disable();

		$.Widget.prototype.destroy.apply( this, arguments );
	},

	value: function( newValue ) {
		if ( newValue === undefined ) {
			return this._value();
		}

		this._setOption( "value", newValue );
		return this;
	},

	_setOption: function( key, value ) {
		if ( key === "value" ) {
			this.options.value = value;
			this._refreshValue();
			if ( this._value() === this.options.max ) {
				this._trigger( "complete" );
			}
		}

		$.Widget.prototype._setOption.apply( this, arguments );
	},

	_value: function() {
		var val = this.options.value;
		// normalize invalid value
		if ( typeof val !== "number" ) {
			val = 0;
		}
		return Math.min( this.options.max, Math.max( this.min, val ) );
	},

	_percentage: function() {
		return 100 * this._value() / this.options.max;
	},

	_refreshValue: function() {
		var value = this.value();
		var percentage = this._percentage();

		if ( this.oldValue !== value ) {
			this.oldValue = value;
			this._trigger( "change" );
		}

		this.valueDiv
			.toggleClass( "ui-corner-right", value === this.options.max )
			.width( percentage.toFixed(0) + "%" );
		this.element.attr( "aria-valuenow", value );
	}
});

$.extend( $.ui.scrollpane, {
	version: "@VERSION"
});

})( jQuery );
