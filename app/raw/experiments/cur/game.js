var GAME = {};
(function(){
	var m_path_shader;
	var characters = new Array();
	var phm; // pseudo-heightmap
	var m_RESOLUTION;
	var maxheight;
	var p;
	var m_ORIGIN;
	var INITD = false;

	var topface = [
            -1.0,  0.0, -1.0,
            -1.0,  0.0,  1.0,
             1.0,  0.0,  1.0,

             -1.0,  0.0, -1.0,
             1.0,  0.0,  1.0,
             1.0,  0.0, -1.0,
	];
	var t_path;
	var t_path_colors;
	this.testPaths = null;

	var show_path_bias = false;
	this.path_discovery = false;
	this.current_paths;
	this.highlit = null;

	var index = function(x,z){
		var size = m_RESOLUTION;
		return clamp(x, size)+clamp(z, size)*size;
	};
	this.clearPaths = function()
	{
		INITD= false;	
	};
	this.drawPaths = function(mvMatrix, pMatrix, normalMatrix)
	{
		//gl.disable(gl.DEPTH_TEST);
		if (this.t_path == null) return;
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
		var shader = m_path_shader.program();
		gl.useProgram(shader);
		bindArrayBuffer(shader.vertexPositionAttribute, this.t_path);
		bindArrayBuffer(shader.pathColorAttribute, this.t_path_colors);

        // set matrix uniforms:
        gl.uniformMatrix4fv(shader.pMatrixUniform, false, pMatrix);
        gl.uniformMatrix4fv(shader.mvMatrixUniform, false, mvMatrix);
		//gl.uniformMatrix4fv(shader.normalMatrixUniform, false, normalMatrix);
   		// draw the buffers yo
        gl.uniform1f(shader.time, TICK);
        gl.drawArrays(gl.TRIANGLES, 0, this.t_path.numItems);
        gl.disable(gl.BLEND);
        //gl.enable(gl.DEPTH_TEST);
	};
	this.draw = function(mvMatrix, pMatrix, normalMatrix)
	{
		if (INITD)
		{
			this.drawPaths(mvMatrix, pMatrix, normalMatrix);
		}
	};
	this.bufferPaths = function(paths_array){
		var vertices = new Array();
		var path_colors = new Array();
		var color;
		gl.deleteBuffer(this.t_path);
		gl.deleteBuffer(this.t_path_colors);
		// convert it into geometry
		for (var i = 0; i < paths_array.length; i++){
			var path = paths_array[i];
			for (var a = 0; a < topface.length; a+=3){
				var x = path.square[0];
				var z = path.square[1];
				var y = path.height + 0.5; // TODO: fix this
				if ((x == path.from[0]) && (z == path.from[1])) // this is where we're standing
				{  
					color = [1.0, 0.0, 0.0];
				}
				else if ((x == this.highlit[0]) && (z == this.highlit[1]))
				{
					color = [0.0, 0.0, 1.0];
				}
				else {
					color = [0.2, 1.0, 0.5];
					if (this.path_discovery){
						var scale = 4.0*(i / paths_array.length);
						color[0] *= scale;
						color[1] *= scale;
						color[2] *= scale;
					}
				}
				vertices.push(topface[a] + 2*x + 2*m_ORIGIN[0]*m_RESOLUTION); // x
				vertices.push(topface[a+1] + 2*y + 2*m_ORIGIN[1]*m_RESOLUTION + 0.05); // y should actually be modified by path's height, 0.05 for z-fighting?
				vertices.push(topface[a+2] + 2*z + 2*m_ORIGIN[2]*m_RESOLUTION); // z
				path_colors.push(color[0]);
				path_colors.push(color[1]);
				path_colors.push(color[2]);
			}
		}
		//console.log(path_colors.length, vertices.length);
		this.t_path = createBuffer(vertices, 3);
		this.t_path_colors = createBuffer(path_colors, 3);
		INITD = true;
	};
	this.printPaths = function(paths){
		for (var i = 0; i < paths.length; i++){
			cur = paths[i];
			console.log("From [" + cur.from + "] to [" + cur.square + "] @ y=" + cur.height + " is distance " + cur.distance + " (" + cur.name + ")");
		}
	};
	// recursively calculate the allowable paths for the current game state
	// we should really be checking character stamina and stuff like that as well.
	// e.g., how high can he actually jump?
	this.paths = function(paths_array, f, current, extinction, d){
		// this bounds check may not be necessary, but it might speed things up
		if ((current[0] < 0) || (current[1] < 0) || (current[0] > m_RESOLUTION) || (current[1] > m_RESOLUTION)) return;

		var jumpHeight = function(from, to){ //TODO: abstract this function over characters, and use it as a passable parameter to the paths function
			if ((to-from) <= 1) return true;
			return false;
		}

		var curHeight = f[2];
		var idx = index(current[0], current[1]);
		var results = phm[idx];
		if (results == null){ // no use making a path where he can't go? this represents a null square in pseudo-heightmap
			return;
		}

		var heights = new Array();
		var exists = false; // start off assuming there is no path to current in the paths array
		for (var i = 0; i < paths_array.length; i++) // iterate over the entire path array
		{			
			var path = paths_array[i]; // and check to see if the path to this square already exists?
			if (path.name == idx) // it does, so we check to see if we should redefine the path if it is shorter
			{
				
				// can the character jump high enough?
				for (var hi = 0; hi < results.length; hi++){					
					if (path.height == results[hi])
					{
						exists = true;
					}
					else {
						break;
					}
					if (!jumpHeight(curHeight,results[hi])) // he can't jump to that square from here
					{
						return; // so don't redefine the path
					}
					if (path.distance <= d){ // but there's a shorter path
						return; // so it does not change
					}
					else { // finally, we redefine the path, having passed the required tests
						paths_array[i].distance = d;
						paths_array[i].from = f;
					}
				}
			}
		}

		// only happens if we didn't redefine a previously existing path
		if (!exists){ 
			var highest = -1;
			for (var hi = 0; hi < results.length; hi++){ // what are the accessible squares?
				if (jumpHeight(curHeight,results[hi]))
				{
					if (results[hi] > highest) highest = results[hi];
				}
			}
			heights.push(highest);
			for (var a = 0; a < heights.length; a++) // create a variable # of paths to those squares
			{
				paths_array.push({
					square: [current[0], current[1], heights[a]+1],
					distance: d,
					from: f,
					name: idx,
					height: heights[a]
				});
			}
		}
		if (extinction > 0){
			this.paths(paths_array, current, [current[0]+1, current[1], curHeight], extinction-1, d+1); // check the square above
			this.paths(paths_array, current, [current[0]-1, current[1], curHeight], extinction-1, d+1); // below
			this.paths(paths_array, current, [current[0], current[1]+1, curHeight], extinction-1, d+1); // right
			this.paths(paths_array, current, [current[0], current[1]-1, curHeight], extinction-1, d+1); // left
		}
	};
	this.calculatePathsFor = function(single_character)
	{
		this.current_paths = new Array();
		this.paths(this.current_paths, single_character.m_noninterpolated, single_character.m_noninterpolated, single_character.MOVE_DISTANCE, 0);	
	};

	// draw a path using the paths array we have constructed
	// this will cull the complete paths array to draw only the path we will be following
	this.drawSinglePath = function(paths_array, from, to)
	{
		this.bufferPaths(this.extractPathTo(paths_array, from, to));
	};
	this.extractPathTo = function(paths_array, from, to)
	{
		var culled = new Array();
		var changeOccurred = true;
		while (changeOccurred){
			changeOccurred = false;
			if ((to[0] == from[0]) && (to[1] == from[1])) break; // we have arrived
			for (var x = 0; x < paths_array.length; x++)
			{
				var p = paths_array[x];
				var square = p.square;
				if ((square[0] == to[0]) && (square[1] == to[1]))
				{
					//console.log(square[0], square[1], " ", to[0], to[1]);
					culled.push(p);
					to = p.from;
					changeOccurred = true;
				}
				if ((to[0] == from[0]) && (to[1] == from[1])) break; // we have arrived
			}
		}
		return culled;
	};
	// from 3column vector
	this.pathfinding_destinations = null;
	this.curEle = 0;
	this.demoFrom = [10,10,3];
	this.demoExtinction = 5;

	this.updateSingular = function(){
		this.pathfinding_destinations = new Array();
		this.curEle = 0;
		for (var a = 0; a < this.testPaths.length; a++)
		{
			var p = this.testPaths[a];
			var exists = false;
			for (var b = 0; b < this.pathfinding_destinations.length; b++)
			{
				var consider = this.pathfinding_destinations[b];
				if ((consider[0] == p[0]) && (consider[1] == p[1]))
				{
					exists = true;
				}
			}
			if (!exists)
			{
				this.pathfinding_destinations.push(p.square);
			}
		}
	};

	var pathfindingDemoKeybinds = function(event){
		//console.log(event.keyCode);
		var moved = false;
		if (event.keyCode == 189){ // - key
			GAME.demoExtinction -=1;
			moved = true;
		}
		else if (event.keyCode == 187) { // + key
			GAME.demoExtinction += 1;
			moved = true;
		}

		if (event.keyCode == 37){ // left arrow
			GAME.demoFrom[0]+=1;			
			moved = true;
		}
		else if (event.keyCode == 38){ // up
			GAME.demoFrom[1]+=1;
			moved = true;
		}
		else if (event.keyCode == 39){ // right
			GAME.demoFrom[0]-=1;			
			moved = true;
		}
		else if (event.keyCode == 40){ // down
			GAME.demoFrom[1]-=1;			

			moved = true;
		}
		if (moved)
		{
			GAME.testPaths = new Array();
			GAME.paths(GAME.testPaths, GAME.demoFrom, GAME.demoFrom, GAME.demoExtinction, 0);
			GAME.bufferPaths(GAME.testPaths);
			GAME.updateSingular();
		}
		if (event.keyCode == 221) // { key
		{
			if (GAME.curEle < GAME.pathfinding_destinations.length - 1)
			{
				GAME.curEle += 1;
			}
			GAME.drawSinglePath(GAME.testPaths, GAME.demoFrom, GAME.pathfinding_destinations[GAME.curEle]);
		}
		else if (event.keyCode == 219) // } key
		{
			if (GAME.curEle > 0)
			{
				GAME.curEle -= 1;
			}
			GAME.drawSinglePath(GAME.testPaths, GAME.demoFrom, GAME.pathfinding_destinations[GAME.curEle]);
		}
	};
	this.demoPaths = false;
	this.demonstratePathFinding = function()
	{
		if (!this.demoPaths) {this.demoPaths = true;}
		else {this.demoPaths = false;}
		
		if (this.demoPaths) {
			$(window).bind("keydown", pathfindingDemoKeybinds);
		}
		else {
			this.pathfinding_demonstration_on = false;
			$(window).unbind("keydown", pathfindingDemoKeybinds);
			INITD = false;
		}
	};
	// the AI shoudl form an enduring plan, not get stuck on terrain
	// as such, it should plan out an entire route and stick to that route
	// popping off state as it goes along
	this.findpath = function(from, to){
		
	};
	var highlightSquares = function(event){
		var moved = false;
		if (event.keyCode == 37){ // left arrow
			event.preventDefault();
			GAME.highlit[0]+=1;			
			moved = true;
		}
		else if (event.keyCode == 38){ // up
			event.preventDefault();
			GAME.highlit[1]+=1;
			moved = true;
		}
		else if (event.keyCode == 39){ // right
			event.preventDefault();
			GAME.highlit[0]-=1;			
			moved = true;
		}
		else if (event.keyCode == 40){ // down
			event.preventDefault();
			GAME.highlit[1]-=1;			
			moved = true;
		}
		else if (event.keyCode == 13){ // enter key
			event.preventDefault();
			// finalize move IF possible
			$(window).unbind("keydown", highlightSquares);
			var c = characters[GAME.processing];
			var extraction = GAME.extractPathTo(GAME.current_paths, c.m_noninterpolated, GAME.highlit);
			GAME.bufferPaths(extraction);
			c.processPath(extraction);
			GAME.processing += 1;
			if (GAME.processing == characters.length) GAME.processing = 0;
			return;
		}
		if (moved)
		{
			GAME.bufferPaths(GAME.current_paths);
		}
	};
	// for interacting with the menus of the game
    var menuKeys = function(event){
    	console.log(event.keyCode);
	    if (event.keyCode == 13){ // enter key
	        event.preventDefault();
	        var active = $(".gamemenu .selectable.active").attr("id");
	        if (active == "move")
	        {	        	

	        	var activeChar = characters[GAME.processing];
	        	console.log(activeChar);
	        	GAME.disableGameMenus();
	        	
	        	//var panPos = [activeChar.m_position[0] * 0.5 * ACTIVE_SCENE.RES, 40, activeChar.m_position[2] ];
	        	//CAMERA.panTo(panPos, 2000, 20);

	        	GAME.calculatePathsFor(activeChar);
	        	GAME.highlit = vec3.create(activeChar.m_noninterpolated);
	        	GAME.bufferPaths(GAME.current_paths);
	        	setTimeout(function(){
	        		$(window).bind("keydown", highlightSquares);	
	        	}, 100);
	        	
	        }
	    }
	    else if (event.keyCode == 27){ // esc key
	        event.preventDefault();

	    }
	    else if (event.keyCode == 37){ // left arrow

	    }
	    else if (event.keyCode == 38){ // up
	        event.preventDefault();
	        var cur = $(".selectable.active");
	        if (cur.prev().length == 0) return;
	        cur.removeClass("active");
	        cur.prev().addClass("active");
	    }
	    else if (event.keyCode == 39){ // right

	    }
	    else if (event.keyCode == 40){ // down
	        event.preventDefault();
	        var cur = $(".selectable.active");
	        if (cur.next().length == 0) return;
	        cur.removeClass("active");
	        cur.next().addClass("active");
	    }
	};
	this.enableGameMenus = function()
	{
        $(document).bind("keydown", menuKeys);		
        $(".gamemenu").fadeIn(100);
	};
	this.disableGameMenus = function()
	{
		$(document).unbind("keydown", menuKeys);
        $(".gamemenu").fadeOut(100);
	};

	this.init = function(terrains, path_shader){

		this.enableGameMenus();
		m_path_shader = path_shader;
		console.log("Initializing game board; consulting terrain tiles");
		//for (var a = 0; a < terrains.length; a ++){
			//var localres = terrains[a].getResolution();
		//} // calculate an efficient heightmap based on the various tiles
		// or at least, we'd want to do something like that if we had more time ^

		var terrain = terrains[0]; // we'll just slack and pretend the game can support more than 1 terrain cube

		m_RESOLUTION = terrain.getResolution();
		m_ORIGIN = terrain.getOrigin();
		maxheight = terrain.getHeight();

		//debugger;
		phm = new Array(m_RESOLUTION*m_RESOLUTION);

		var nullcount = 0;
		for (var x = 0; x < m_RESOLUTION; x++){
			for (var z = 0; z < m_RESOLUTION; z++){ // scoop through the plane
				var existent = 0;
				var cur = null;
				var idx = index(x,z);
				for (var y = 0; y < maxheight; y++){ // then add an entry to the phb as we can
					if (terrain.canBeOccupied(x,y,z)){
						if (existent==0){							
							cur = new Array();
						}
						cur.push(y);
						existent+=1;
					}
				}
				if (existent > 0) {
					phm[idx] = cur;
				}
				if (cur==null){ nullcount+=1;}
			}
		}
		//console.log(phm);
		//console.log(nullcount);
		this.testPaths = new Array();
		this.paths(this.testPaths, [10,10,2], [10,10,2], 5, 0);
		all_singular_paths = new Array();
	};
	this.processing = 0; // an index into characters array
	this.addCharacter = function(c)
	{
		characters.push(c);
	};
	this.setPathDiscoveryOrderDisplay = function(state) // true or false
	{
		this.path_discovery = state;
	};
}).apply(GAME);