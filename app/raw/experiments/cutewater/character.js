function CHARACTER()
{
	var m_shader;
	this.m_name = "Deranged CS488 Student";
	this.position = null;
	this.HP = 50;
	this.m_position = null;
	this.m_RESOLUTION = null;
	this.m_ORIGIN = null;
	var point = [
    	0.0, 0.0, 0.0
    ];
    var vertices;
    this.buffer = function()
    {
    	gl.deleteBuffer(this.t_vertices);
		vertices = new Array();
		// convert it into geometry
		vertices.push(point[0] + 2*this.m_position[0] + 2*this.m_ORIGIN[0]*this.m_RESOLUTION); // x
		vertices.push(point[1] + 2*this.m_position[2] + 2*this.m_ORIGIN[1]*this.m_RESOLUTION); 
		vertices.push(point[2] + 2*this.m_position[1] + 2*this.m_ORIGIN[2]*this.m_RESOLUTION); // z
		//console.log(vertices);
		this.t_vertices = createBuffer(vertices, 3);
    };
	this.draw = function(mvMatrix, pMatrix, normalMatrix)
	{
		//gl.disable(gl.DEPTH_TEST);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
		var shader = m_shader.program();
		gl.useProgram(shader);
		bindArrayBuffer(shader.vertexPositionAttribute, this.t_vertices);

		//mvPushMatrix();


        // set matrix uniforms:
        gl.uniformMatrix4fv(shader.pMatrixUniform, false, pMatrix);
        gl.uniformMatrix4fv(shader.mvMatrixUniform, false, mvMatrix);
        gl.uniform4fv(shader.uViewport, [0,0,gl.viewportWidth,gl.viewportHeight]);
        gl.uniform1f(shader.uTime, TICK);

        // calculate scale
        //var diff = vec3.create();
        //vec3.subtract(vertices, CAMERA.getEye(), diff);
    	var scale = 60.0;
    	//console.log(scale);
    	//console.log(scale);

        gl.uniform1f(shader.uScale, scale);

		gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, charTexture);
        gl.uniform1i(shader.sTexture, 0);
		
   		// draw the buffers yo
        gl.drawArrays(gl.POINTS, 0, this.t_vertices.numItems);
        gl.disable(gl.BLEND);
		//gl.enable(gl.DEPTH_TEST);
		//mvPopMatrix();
	};
	var moving = -1;
	var differential;
	this.move = function(to, duration, refresh)
	{
		var position = new SPLINE();
		//console.log(this.m_position[2], to);
		if (this.m_position[2] < to[2]){
			modifier = 5 * (this.m_position[2] - to[2]);
		}
		else if (this.m_position[2] > to[2]) {
			modifier = -5 * (this.m_position[2] - to[2]);
		}
		else {
			modifier = 0.0;
		}
		position.addControlPoint([this.m_position[0], this.m_position[1], this.m_position[2] + modifier]);
		position.addControlPoint(this.m_position);
		position.addControlPoint(to);
		position.addControlPoint([to[0], to[1], to[2]]);

		var dt = refresh / duration;
		var t = 0;
		var which = this;
		moving = setInterval(function(to){
			//console.log("Panning is at ", t);
			if (t>1.0){
				//which.m_origin = to; // finalize it.
				clearInterval(moving);
				delete position;
			}
			var new_position = position.interpolateAt(t);
			if (new_position == null) {clearInterval(moving); delete position; return;}
			which.m_position[0] = new_position[0];
			which.m_position[1] = new_position[1];
			which.m_position[2] = new_position[2];
			which.buffer();
			t += dt;
		}, refresh);
	};
	this.processPath = function(paths_array)
	{
		GAME.printPaths(paths_array);
		for (var a = paths_array.length - 1; a >= 0; a--)
		{
			var t = paths_array.length - 1;
			var which = this;
			setTimeout(function(){
				console.log("fired", paths_array[t].square);
				which.move(paths_array[t].square, 500, 20);
				t -= 1;
				}, 700*a);
		}
	};
    this.init = function(shader, position, name, inside)
    {    	
    	
    	m_shader = shader;
    	this.m_ORIGIN = inside.getOrigin();
    	this.m_name = name;
    	this.m_position = position;
    	this.m_RESOLUTION = inside.getResolution();
    	console.log("Initializing character '" + this.m_name + "' at " + this.m_position + " with " + this.HP);
    	this.buffer();
    };
}