var CAMERA = {};
(function(){	
	var m_canvas;
	var m_eye = vec3.create(); // we should push away the canvas by wherever we are in space
	var m_lookat = vec3.create(); // rotate the scene depending on where we're looking
	var m_up = [0,1,0];
	var polling_interval = 200;
	var timer = new Date();

	var m_matrix = mat4.create();
	var orientation = mat4.create();

	// game area is [0..maxX]x[0..maxY]
	var maxX; var maxY;
	// game area % thresholds where mousemove trigger should begin
	var threshX = 0.2;
	var threshY = 0.2;
	var sensitivityX = 2;
	var sensitivityY = 2;

	// camera intervals
	var panning = 0;
	var rotating = 0;
	var elevating = 0;

	var elevate = function(direction){
		vec3.add(m_eye, [0,0.3*direction,0]);
	}
	var rotate = function(direction){
		//var diff = vec3.create();
		//vec3.subtract(m_eye, m_lookat, diff);
		//var about = vec3.create([m_lookat[0],1,m_lookat[2]]);
		var about = vec3.create([0,1,0]);
		//vec3.normalize(about);
		mat4.rotate(orientation, direction*0.0005, about);
		mat4.multiplyVec3(orientation, m_eye);
	}
	var camera_mousewheel = function(event){
		//console.log(m_eye);
		var diff = vec3.create();
		vec3.subtract(m_eye, m_lookat, diff);
		if (event.wheelDelta > 0){
			vec3.scale(diff,0.1);
			vec3.add(m_eye, diff);
		}
		else {
			vec3.scale(diff,-0.1);
			vec3.add(m_eye, diff);
		}
	};
	var camera_keydown = function(event){
		//console.log(event.keyCode);
		var diff = vec3.create();
		vec3.subtract(m_eye, m_lookat, diff);
		vec3.normalize(diff);
		if (event.keyCode == 87) // W
		{
			vec3.scale(diff, -1);
			vec3.add(m_eye, [diff[0],0,diff[2]]);
			vec3.add(m_lookat, [diff[0],0,diff[2]]);
		}
		else if (event.keyCode == 65) // A
		{
			vec3.cross(diff, m_up);
			vec3.normalize(diff);
			vec3.add(m_eye, [diff[0],0,diff[2]]);
			vec3.add(m_lookat, [diff[0],0,diff[2]]);
		}
		else if (event.keyCode == 83) // S
		{
			vec3.add(m_eye, [diff[0],0,diff[2]]);
			vec3.add(m_lookat, [diff[0],0,diff[2]]);
		}
		else if (event.keyCode == 68) // D
		{
			vec3.cross(diff, m_up);
			vec3.normalize(diff);
			vec3.scale(diff,-1);
			vec3.add(m_eye, [diff[0],0,diff[2]]);
			vec3.add(m_lookat, [diff[0],0,diff[2]]);			
		}
	};
	var bind_screenedges = function(){
		$("#top").bind("mouseenter", function(){
			clearInterval(elevating);
			elevating = setInterval(function(){
				elevate(1.0);
			}, 5);
		});
		$("#top").bind("mouseleave", function(){
			clearInterval(elevating);
		});
		$("#bottom").bind("mouseenter", function(){
			clearInterval(elevating);
			elevating = setInterval(function(){
				elevate(-1.0);
			}, 5);
		});
		$("#bottom").bind("mouseleave", function(){
			clearInterval(elevating);
		});
		$("#right").bind("mouseenter", function(){
			clearInterval(rotating);		
			rotating = setInterval(function(){
				rotate(1.0);
			}, 5);
		});
		$("#right").bind("mouseleave", function(){
			clearInterval(rotating);
			mat4.identity(orientation);
		});
		$("#left").bind("mouseenter", function(){
			clearInterval(rotating);			
			rotating = setInterval(function(){
				rotate(-1.0);
			}, 5);
		});
		$("#left").bind("mouseleave", function(){
			clearInterval(rotating);
			mat4.identity(orientation);
		});
	};
	var unbind_screenedges = function(){
		$("#top").unbind("mouseenter");
		$("#top").unbind("mouseleave");	
	};
	var bind_camera = function(event){
		//$(m_canvas).bind("mousemove", camera_mousemove);
		bind_screenedges();
		$(document).bind("mousewheel", camera_mousewheel);
		$(document).bind("keydown", camera_keydown);
	};
	var unbind_camera = function(event){
		$(document).unbind("mousemove", camera_mousemove);
		$(document).unbind("keydown", camera_keydown);
	};
	this.enable = function(){
		bind_camera();
	}
	this.disable = function(){
		unbind_camera();
	}
	this.init = function(canvas, eye, up, lookat){
		orientation = mat4.create();
		mat4.identity(orientation);
		m_canvas = canvas;
		m_eye = vec3.create(eye);
		m_lookat = vec3.create(lookat);
		m_up = up;
		last_move = timer.getTime();
		this.enable();
		maxX = $(canvas).width();
		maxY = $(canvas).height();
	}
	// the internal panning feature
	var ipan = function(position, velocity, t){
		var newT = velocity.interpolateAt(t);
		if (newT == null) return;
		//console.log(newT[0]);
		var newPos = position.interpolateAt(newT[1]);
		if (newPos != null){
			m_eye = newPos;
			vec3.set(m_lookat, [newPos[0]+m_eye[0], 0, newPos[2]+m_eye[2]]);
		}
	};
	this.panTo = function(towhere, howlong, refresh)
	{		
		console.log(towhere, m_eye);
		if ((towhere[0] == m_eye[0]) && (towhere[1] == m_eye[1]) && (towhere[2] == m_eye[2])) { 
			//console.log("Pointless to pan to the same place and risk showing my spline vulnerabilities! Quitting pan.");
			return;
		}
		var position = new SPLINE();

		position.addControlPoint(m_eye);
		position.addControlPoint(m_eye);
		position.addControlPoint(towhere);
		position.addControlPoint(towhere);
		var velocity = new SPLINE();
		velocity.addControlPoint([0.0, 2.0, 0.0]);
		velocity.addControlPoint([0.0, 0.0, 0.0]);
		velocity.addControlPoint([1.0, 1.0, 0.0]);
		velocity.addControlPoint([1.0, 0.0, 0.0]);
		//velocity.testEvaluate(30);
		this.pan(position, velocity, howlong, refresh);
	}
	this.pan = function(spline, velocity, duration, refresh, towhere){
		var dt = refresh / duration;
		var t = 0;
		panning = setInterval(function(){
				//console.log("Panning is at ", t);
				if (t>1.0){
					m_origin = towhere; // finalize it.
					clearInterval(panning);
					delete spline;
					delete velocity;
				}
				ipan(spline, velocity, t);
				t += dt;
			}, refresh);
	}
	this.panRandom = function(){
		CAMERA.panTo([Math.random()*20, Math.random()*20, Math.random()*20], 1000, 20);
	}
	this.zoom = function(){
		return m_zoom;
	}
	this.x = function(){
		return m_eye[0];
	}
	this.y = function(){
		return m_eye[1];
	}
	this.z = function(){
		return m_eye[2];
	}
	this.getMatrix = function(){
		mat4.lookAt(m_eye, m_lookat, m_up, m_matrix);
		return m_matrix;
	}
	this.getEye = function(){
		var diff = vec3.create();
		vec3.subtract(m_eye, m_lookat, diff);
		return diff;
	}
}).apply(CAMERA);