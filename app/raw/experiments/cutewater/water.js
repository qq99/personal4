function WATER(resolution, world_botleft, world_topright, world_y, reflectives) {
	var m_shader = shader; // the context
	var m_res = resolution; // [res_x, res_z] for rectangles
	var m_origin = world_botleft; // [rectangle.bottomleft.x, rectangle.bottomleft.z] parallel to ground
	var m_extent = world_topright; // [rectangle.topright.x, rectangle.topright.z]
	var m_worldY = world_y; // how high is this plane from the 0 point?
	var m_reflectives = reflectives;
	var m_reflect = true;

	var rttFramebuffer;
	var rttTexture;
	var renderbuffer;

	console.log("Creating a water plane of resolution [x,y]=" + m_res + " from " + m_origin + " to " + m_extent + " that is at height " + m_worldY);
	var s_polygon = [
        // topwards facing square
        -1.0,  0.0, -1.0,
        -1.0,  0.0,  1.0,
         1.0,  0.0,  1.0,

         -1.0,  0.0, -1.0,
         1.0,  0.0,  1.0,
         1.0,  0.0, -1.0,];
    var s_tex = [
          // Top face
          0.0, 1.0,
          0.0, 0.0,
          1.0, 0.0,

          0.0, 1.0,
          1.0, 0.0,
          1.0, 1.0,
    ];
    var t_vertices;
    var t_normals;
    var t_texcoords;
    this.set_shader = function(shaderP){
    	m_shader = shaderP;
    };
	this.tessellate = function(){
		var xscale = ((m_extent[0] - m_origin[0])) / m_res[0];
		var zscale = ((m_extent[1] - m_origin[1])) / m_res[1];
		//console.log(xscale, zscale);
		//xscale = 1.0;
		//zscale = 1.0;

		var vertices = new Array();
		var normals = new Array();
		var texcoords = new Array();
		for (var x =0; x < m_res[0]; x++ ){
			for (var z = 0; z < m_res[1]; z++){
				var xfrac = x / m_res[0];
				var zfrac = z / m_res[1];
				// per tri:
				for (var a = 0; a < s_polygon.length; a+= 3){
					vertices.push(xscale * s_polygon[a] + m_origin[0] + 2*x*xscale)
					vertices.push(s_polygon[a+1]);
					vertices.push(zscale * s_polygon[a+2] + m_origin[1] + 2*z*zscale);
				}
				for (var a = 0; a < s_polygon.length / 3; a++){
					normals.push(0.0); // upwards
					normals.push(1.0); 
					normals.push(0.0);
				}
			}
		}

		this.t_vertices = createBuffer(vertices, 3);
		this.t_normals = createBuffer(normals, 3);
		this.t_texcoords = createBuffer(texcoords,2);
	};
	this.init = function(){
		this.tessellate();

		rttFramebuffer = gl.createFramebuffer();
		gl.bindFramebuffer(gl.FRAMEBUFFER, rttFramebuffer);
		rttFramebuffer.width = 1024;
		rttFramebuffer.height = 1024;
		rttTexture = gl.createTexture();
	    gl.bindTexture(gl.TEXTURE_2D, rttTexture);

		//gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);  
		//gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);  
		//gl.generateMipmap(gl.TEXTURE_2D); 

		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

	    //gl.generateMipmap(gl.TEXTURE_2D);
	    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, rttFramebuffer.width, rttFramebuffer.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

		renderbuffer = gl.createRenderbuffer();
	    gl.bindRenderbuffer(gl.RENDERBUFFER, renderbuffer);
	    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, rttFramebuffer.width, rttFramebuffer.height);

		gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, rttTexture, 0);
    	gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, renderbuffer);

	    gl.bindTexture(gl.TEXTURE_2D, null);
	    gl.bindRenderbuffer(gl.RENDERBUFFER, null);
	    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	};
	this.disableReflection = function(){
		m_reflect = false;	
	};
	this.enableReflection = function(){
		m_reflect = true;
	};
	this.draw = function(mvMatrix, pMatrix, normalMatrix){

		// switch to the internal framebuffer for the water reflection
		gl.bindFramebuffer(gl.FRAMEBUFFER, rttFramebuffer);
        gl.clearColor(1.0, 1.0, 1.0, 0.0);        
        gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); 
        if (m_reflect) // nothing gets drawn on the texture if false, and the shader acts accordingly
        {
	        gl.cullFace(gl.FRONT);
	        // calulate/reset the normal matrix
	        var tmp = mat4.identity();
		    mat4.scale(tmp, [1, -1, 1]);
		    mat4.translate(tmp, [0, -world_y, 0]);
	        mat4.multiply(mvMatrix, tmp, tmp);
	      
			reflectives[0].draw(tmp, pMatrix, normalMatrix);	
		}
		// switch back
		gl.clearColor(0.5, 0.5, 0.5, 1.0);
		gl.cullFace(gl.BACK);
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);


		// now draw the water plane itself
		// bind the stuffs
		mvPushMatrix();
		mat4.translate(mvMatrix, [0, m_worldY, 0]);
		mvPopMatrix();

		var shader = m_shader.program();
		gl.useProgram(shader);
		bindArrayBuffer(shader.vertexPositionAttribute, this.t_vertices);
		bindArrayBuffer(shader.normalVector, this.t_normals);
		
        gl.uniform1f(shader.time, TICK);
        gl.uniform1f(shader.uTime, TICK);
        gl.uniform2fv(shader.context_size, [game_canvas.width, game_canvas.height]);

		gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, p_gradient);
        gl.uniform1i(shader.grad_sampler, 0);
        
		gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, p_perm);
        gl.uniform1i(shader.perm_sampler, 1);

        gl.activeTexture(gl.TEXTURE2);
        gl.bindTexture(gl.TEXTURE_2D, rttTexture);
        gl.uniform1i(shader.reflection_sampler, 2);

        // set matrix uniforms:
        gl.uniformMatrix4fv(shader.pMatrixUniform, false, pMatrix);
        gl.uniformMatrix4fv(shader.mvMatrixUniform, false, mvMatrix);
		gl.uniformMatrix4fv(shader.normalMatrixUniform, false, normalMatrix);
        gl.uniform4fv(shader.uViewport, [0,0,gl.viewportWidth,gl.viewportHeight]);
   		// draw the buffers yo
        gl.drawArrays(gl.TRIANGLES, 0, this.t_vertices.numItems);
        //gl.depthMask(true);
	};

	// happens on constructor:
	return true;
}