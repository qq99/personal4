function WATER(resolution, world_botleft, world_topright, world_y) {
	var m_shader = shader; // the context
	var m_res = resolution; // [res_x, res_z] for rectangles
	var m_origin = world_botleft; // [rectangle.bottomleft.x, rectangle.bottomleft.z] parallel to ground
	var m_extent = world_topright; // [rectangle.topright.x, rectangle.topright.z]
	var m_worldY = world_y; // how high is this plane from the 0 point?
	console.log("Creating a water plane of resolution [x,y]=" + resolution + " from " + m_origin + " to " + m_extent + " that is at height " + m_worldY);
	var s_polygon = [
        // topwards facing square
        -1.0,  0.0, -1.0,
        -1.0,  0.0,  1.0,
         1.0,  0.0,  1.0,

         -1.0,  0.0, -1.0,
         1.0,  0.0,  1.0,
         1.0,  0.0, -1.0,];
    var t_vertices;
    var t_normals;
    this.set_shader = function(shaderP){
    	m_shader = shaderP;
    };
	this.tessellate = function(){
		var xscale = ((m_extent[0] - m_origin[0])) / m_res[0];
		var zscale = ((m_extent[1] - m_origin[1])) / m_res[1];
		console.log(xscale, zscale);
		//xscale = 1.0;
		//zscale = 1.0;

		var vertices = new Array();
		var normals = new Array();
		for (var x =0; x < m_res[0]; x++ ){
			for (var z = 0; z < m_res[1]; z++){

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
	};
	this.init = function(){
		this.tessellate();
	};
	this.draw = function(mvMatrix, pMatrix, normalMatrix){
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

		gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, p_gradient);
        gl.uniform1i(shader.grad_sampler, 0);
        
		gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, p_perm);
        gl.uniform1i(shader.perm_sampler, 1);

        // set matrix uniforms:
        gl.uniformMatrix4fv(shader.pMatrixUniform, false, pMatrix);
        gl.uniformMatrix4fv(shader.mvMatrixUniform, false, mvMatrix);
		gl.uniformMatrix4fv(shader.normalMatrixUniform, false, normalMatrix);
   		// draw the buffers yo
        gl.drawArrays(gl.TRIANGLES, 0, this.t_vertices.numItems);
	};

	// happens on constructor:
	return true;
}