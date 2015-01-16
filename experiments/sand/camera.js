var CAMERA = {};
(function(){	
	var m_zoom = 128;
	var m_canvas;
	var m_position = [0,0,0];
	var polling_interval = 20;
	var timer = new Date();

	// game area is [0..maxX]x[0..maxY]
	var maxX; var maxY;
	// game area % thresholds where mousemove trigger should begin
	var threshX = 0.2;
	var threshY = 0.2;
	var sensitivityX = 2;
	var sensitivityY = 2;

	var camera_mousemove = function(event){
		timer = new Date();
		var now = timer.getTime();
		if (now - last_move < polling_interval) return; // don't let the event fire
		last_move = now;
		// code the mouse move evaluation
		// parameterize mouse position wrt DOM element between [0..1]x[0..1]
		var diffX = (maxX - event.layerX) / maxX;
		var diffY = (maxY - event.layerY) / maxY;
		if (diffX < threshX){
			m_position[0] -= sensitivityX;
		}
		else if (diffX > (1-threshX)){
			m_position[0] += sensitivityX;
		}
		if (diffY < threshY){
			m_position[1] += sensitivityY;
		}
		else if (diffY > (1-threshY)){
			m_position[1] -= sensitivityY;
		}
	};
	var camera_mousewheel = function(event){
		if (event.wheelDelta > 0){
			m_zoom-=2;
		}
		else {
			m_zoom+=2;
		}
	};
	var bind_camera = function(event){
		$(m_canvas).bind("mousemove", camera_mousemove);
		$(m_canvas).bind("mousewheel", camera_mousewheel);
	};
	var unbind_camera = function(event){
		$(m_canvas).unbind("mousemove", camera_mousemove);
	};
	this.enable = function(){
		bind_camera();
	}
	this.disable = function(){
		unbind_camera();
	}
	this.init = function(canvas, settings){
		m_zoom = settings[2];
		m_position[0] = settings[0];
		m_position[1] = settings[1];
		m_canvas = canvas;
		last_move = timer.getTime();
		this.enable();
		maxX = $(canvas).width();
		maxY = $(canvas).height();
	}
	this.zoom = function(){
		return m_zoom;
	}
	this.x = function(){
		return m_position[0];
	}
	this.y = function(){
		return m_position[1];
	}
}).apply(CAMERA);