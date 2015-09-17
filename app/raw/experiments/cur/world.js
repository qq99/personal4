function CUBE(res){
	var cube_vertices = [
            // Front face
            -1.0, -1.0,  1.0,
             1.0, -1.0,  1.0,
             1.0,  1.0,  1.0,

            -1.0, -1.0,  1.0,
             1.0,  1.0,  1.0,
            -1.0,  1.0,  1.0,

            // Back face
            -1.0, -1.0, -1.0,
            -1.0,  1.0, -1.0,
             1.0,  1.0, -1.0,

            -1.0, -1.0, -1.0,
             1.0,  1.0, -1.0,
             1.0, -1.0, -1.0,

            // Top face
            -1.0,  1.0, -1.0,
            -1.0,  1.0,  1.0,
             1.0,  1.0,  1.0,

             -1.0,  1.0, -1.0,
             1.0,  1.0,  1.0,
             1.0,  1.0, -1.0,

            // Bottom face
            -1.0, -1.0, -1.0,
             1.0, -1.0, -1.0,
             1.0, -1.0,  1.0,

            -1.0, -1.0, -1.0,
             1.0, -1.0,  1.0,
            -1.0, -1.0,  1.0,

            // Right face
             1.0, -1.0, -1.0,
             1.0,  1.0, -1.0,
             1.0,  1.0,  1.0,

             1.0, -1.0, -1.0,
             1.0,  1.0,  1.0,
             1.0, -1.0,  1.0,

            // Left face
            -1.0, -1.0, -1.0,
            -1.0, -1.0,  1.0,
            -1.0,  1.0,  1.0,

            -1.0, -1.0, -1.0,
            -1.0,  1.0,  1.0,
            -1.0,  1.0, -1.0,
    ];
    var cube_normals = [
            // Front face
            0.0, 0.0, 1.0,
            // Back face
            0.0, 0.0, -1.0,
            // Top Face
            0.0, 1.0, 0.0,
            // Bottom face
            0.0, -1.0, 0.0,
            // Right face
            1.0, 0.0, 0.0,
            // Left face
            -1.0, 0.0, 0.0,
    ];
    var cube_tangent = [
    	1.0, 0.0, 0.0,
    	-1.0, 0.0, 0.0,
    	1.0, 0.0, 0.0,
    	-1.0, 0.0, 0.0,
    	0.0, 1.0, 0.0,
    	0.0, -1.0, 0.0,
    ];
    var cube_bitangent = [
    	0.0, 1.0, 0.0,
    	0.0, -1.0, 0.0,
    	0.0, 0.0, 1.0,
    	0.0, 0.0, -1.0,
    	0.0, 0.0, 1.0,
    	0.0, 0.0, -1.0,
    ];
	var cube_texcoords = [
          // Front face
          0.0, 0.0,
          1.0, 0.0,
          1.0, 1.0,

          0.0, 0.0,          
          1.0, 1.0,
          0.0, 1.0,

          // Back face
          1.0, 0.0,
          1.0, 1.0,
          0.0, 1.0,

          1.0, 0.0,
          0.0, 1.0,
          0.0, 0.0,

          // Top face
          0.0, 1.0,
          0.0, 0.0,
          1.0, 0.0,

          0.0, 1.0,
          1.0, 0.0,
          1.0, 1.0,

          // Bottom face
          1.0, 1.0,
          0.0, 1.0,
          0.0, 0.0,

          1.0, 1.0,
          0.0, 0.0,
          1.0, 0.0,

          // Right face
          1.0, 0.0,
          1.0, 1.0,
          0.0, 1.0,

          1.0, 0.0,
          0.0, 1.0,
          0.0, 0.0,

          // Left face
          0.0, 0.0,
          1.0, 0.0,
          1.0, 1.0,

          0.0, 0.0,
          1.0, 1.0,
          0.0, 1.0,
    ];
	var terrains = {
		AIR: 1,
		GROUND: 2,
		DIRT: 4
	};
	var neighbours = {
		EMPTY: 0,
		TOP: 1,
		BOTTOM: 2,
		LEFT: 4,
		RIGHT: 8,
		FRONT: 16,
		BACK: 32,
		ALL: 63
	};
	//private:
	var biome = {
		test : {
			threshold : function(x,y,z){
				return terrains.GROUND;
			},
			generator: function(x,y,z){
				return 1.0;
			}
		},
		grass : {
			threshold : function(x,y,z){
				if (proc_LUT[index(x,y,z)] > 0.40){
					return terrains.GROUND;
				}
				else{
					return terrains.AIR;
				}	
			},
			generator : function(x,y,z){
				x += m_ORIGIN[0];
				y += m_ORIGIN[1];
				z += m_ORIGIN[2];
		        var noiseCoef = 0.0;
		        for (var level = 1; level < 2; level ++)
		        {
		            noiseCoef = noiseCoef + (level) 
		                * noise(x*level*5,y*level*5,z*level*5);
		        }
		        x -= m_ORIGIN[0];
		        y -= m_ORIGIN[1];
		        z -= m_ORIGIN[2];
		        noiseCoef = (Math.abs(noiseCoef)+9*Math.pow(2,-(1-y)))/12;
		        return noiseCoef;
			}
		}
	};
	// private local placeholders for the world generation
	var generator = function(x,y,z){
		console.log("Remember to set the biome before calling this function");
	};
	var threshold = function(x,y,z){
		console.log("Remember to set the biome before calling this function");
	};
	// end private local etceteras

	var has_neighbours = function(x,y,z){
		var nonAIR = 0;
		if (terrains.AIR!=threshold(x,y+1,z)) nonAIR++;
		if (terrains.AIR!=threshold(x,y-1,z)) nonAIR++;
		if (terrains.AIR!=threshold(x+1,y,z)) nonAIR++;
		if (terrains.AIR!=threshold(x-1,y,z)) nonAIR++;
		if (terrains.AIR!=threshold(x,y,z+1)) nonAIR++;
		if (terrains.AIR!=threshold(x,y,z-1)) nonAIR++;
		if (nonAIR>0) return true;
		return false;
	};
	var tesellate1 = function(x,y,z, vertices_array, normals_array, texture_coords, atlas, tangents_array, bitangents_array){
		// we want an empty block
		/*
		if (x==0 || y == 0 || z == 0 || x == m_RESOLUTION || y == m_RESOLUTION || z == m_RESOLUTION){ // handle these special cases
			if (has_neighbours(x,y,z)) {
				if (terrains.AIR!=threshold(x,y+1,z)){
					
				}
				for (var a=0; a < cube_vertices.length; a+=3){
					vertices_array.push(cube_vertices[a] + 2*x + 2*m_ORIGIN[0]*m_RESOLUTION);
					vertices_array.push(cube_vertices[a+1] + 2*y + 2*m_ORIGIN[1]*m_RESOLUTION);
					vertices_array.push(cube_vertices[a+2] + 2*z + 2*m_ORIGIN[2]*m_RESOLUTION);
				}
				for (var a=0; a < cube_normals.length; a+=3){
					normals_array.push(cube_normals[a]);
					normals_array.push(cube_normals[a+1]);
					normals_array.push(cube_normals[a+2]);
				}
				for (var a=0; a < cube_texcoords.length; a+=2){
					texture_coords.push(cube_texcoords[a]);
					texture_coords.push(cube_texcoords[a+1]);
				}
			}
		}
		*/
		if (terrains.AIR==threshold(x,y,z)){
			//console.log(x,y,z);
			// and it better have some neighbours
			if (has_neighbours(x,y,z)){
				if (threshold(x,y+1,z) == terrains.GROUND){
					for (var a=0; a < cube_vertices.length / 3; a++){
						atlas.push(1.0);
					}
				}
				else {
					for (var a=0; a < cube_vertices.length / 3; a++){
						atlas.push(0.0);
					}					
				}
				for (var a=0; a < cube_vertices.length; a+=3){
					vertices_array.push(cube_vertices[a] + 2*x + 2*m_ORIGIN[0]*m_RESOLUTION);
					vertices_array.push(cube_vertices[a+1] + 2*y + 2*m_ORIGIN[1]*m_RESOLUTION);
					vertices_array.push(cube_vertices[a+2] + 2*z + 2*m_ORIGIN[2]*m_RESOLUTION);
				}
				for (var a=0; a < cube_normals.length; a+=3){
					for (var b=0; b < 6; b++){
						normals_array.push(cube_normals[a]);
						normals_array.push(cube_normals[a+1]);
						normals_array.push(cube_normals[a+2]);
						tangents_array.push(cube_tangent[a]);
						tangents_array.push(cube_tangent[a+1]);
						tangents_array.push(cube_tangent[a+2]);
						bitangents_array.push(cube_bitangent[a]);
						bitangents_array.push(cube_bitangent[a+1]);
						bitangents_array.push(cube_bitangent[a+2]);
					}
				}
				for (var a=0; a < cube_texcoords.length; a+=2){
					texture_coords.push(cube_texcoords[a]);
					texture_coords.push(cube_texcoords[a+1]);
				}
			}
		}
	};
	var index = function(x,y,z){
		var size = m_RESOLUTION;
		return clamp(x, size)+clamp(y, size)*size+clamp(z, size)*size*size;
	};
	var createLUT = function(){
		proc_LUT = new Array(m_RESOLUTION*m_RESOLUTION*m_RESOLUTION);
		var xf; var yf; var zf;
		var xtent = Math.min(m_RESOLUTION, m_MAX[0]); 
		var ytent = Math.min(m_RESOLUTION, m_MAX[1]); 
		var ztent = Math.min(m_RESOLUTION, m_MAX[2]);
		for (var x = 0; x < xtent; x++){
			xf = x / m_RESOLUTION;
			for (var y=0; y < ytent; y++){
				yf = y / m_RESOLUTION;
				for (var z=0; z < ztent; z++){
					zf = z / m_RESOLUTION;
					var idx = index(x,y,z);
					proc_LUT[idx] = generator(xf,yf,zf,x,y,z);
				}
			}
		}
		LUT_READY = true;
	}
	var m_RESOLUTION; // resolution of the world
	var m_ORIGIN; // offset of current chunk wrt world
	var proc_LUT = []; // the look-up table for the procedural function
	var LUT_READY = false;
	var m_MAX = null;
	var normalMatrix = mat4.create();

	var gl = null;
	var m_shader = null;

	//public:
	this.draw = function(mvMatrix, pMatrix, normalMatrix){
		// bind the stuffs
		var shader = m_shader.program();		
		gl.useProgram(shader);
		bindArrayBuffer(shader.vertexPositionAttribute, this.t_vertices);
		bindArrayBuffer(shader.normalVector, this.t_normals);
		bindArrayBuffer(shader.tangentVector, this.t_tangents);
		bindArrayBuffer(shader.bitangentVector, this.t_bitangents);
		bindArrayBuffer(shader.textureCoordAttribute, this.t_texCoords);
		bindArrayBuffer(shader.textureAtlasAttribute, this.t_texAtlas);

		gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, p_gradient);
        gl.uniform1i(shader.grad_sampler, 0);
        
		gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, p_perm);
        gl.uniform1i(shader.perm_sampler, 1);

        /*gl.activeTexture(gl.TEXTURE2);
        gl.bindTexture(gl.TEXTURE_2D, normalTexture);
        gl.uniform1i(shader.normal_sampler, 2);*/
		
        gl.activeTexture(gl.TEXTURE3);
        gl.bindTexture(gl.TEXTURE_2D, terrain_textures);
        gl.uniform1i(shader.texture_sampler, 3);
		
        gl.uniform1f(shader.uTime, TICK);
        //gl.uniform1f(shader.mouseX, mouseX);

        //console.log(gl.getError());
        // set matrix uniforms:
        gl.uniformMatrix4fv(shader.pMatrixUniform, false, pMatrix);
        gl.uniformMatrix4fv(shader.mvMatrixUniform, false, mvMatrix);
		gl.uniformMatrix4fv(shader.normalMatrixUniform, false, normalMatrix);
   		// draw the buffers yo
        gl.drawArrays(gl.TRIANGLES, 0, this.t_vertices.numItems);
	};
	this.init = function(gl_pointer, resolution, x,y,z){
		m_RESOLUTION = resolution;
		m_ORIGIN = [x,y,z];
		m_MAX = [resolution,resolution,resolution];
		gl = gl_pointer;
		// temporarily make the shader in here...
		//shader = new SHADER_PROGRAM(gl, "terrain.vert", "terrain.frag")
	};
	this.set_shader = function(shaderP){
		m_shader = shaderP;
	};
	this.set_max = function(x,y,z){
		m_MAX = [x,y,z];
	};
	this.set_biome = function(name){
		if (name=="grass"){
			generator = biome.grass.generator;
			threshold = biome.grass.threshold;
		}
		else {
			generator = biome.test.generator;
			threshold = biome.test.threshold;
		}
	};
	this.tesselate = function(){
		if (!LUT_READY) {
			console.log("LUT is not ready. Generating LUT now.");
			createLUT();
		}
		// returns the required arrays for use with WebGL
		var xtent = Math.min(m_RESOLUTION, m_MAX[0]); 
		var ytent = Math.min(m_RESOLUTION, m_MAX[1]); 
		var ztent = Math.min(m_RESOLUTION, m_MAX[2]);
		var xf; var yf; var zf;
		for (var x = 0; x < xtent; x++){
			xf = x / m_RESOLUTION;
			for (var y=0; y < ytent; y++){
				yf = y / m_RESOLUTION;
				for (var z=0; z < ztent; z++){
					zf = z / m_RESOLUTION;
					var p = tesellate1(x, y, z, this.vertices, this.normals, this.texCoords, this.texAtlas, this.tangents, this.bitangents);
				}
			}
		}
		// temporary form is complete.
		this.t_vertices = createBuffer(this.vertices, 3);
		this.t_normals = createBuffer(this.normals, 3);
		this.t_texCoords = createBuffer(this.texCoords, 2);
		this.t_texAtlas = createBuffer(this.texAtlas, 1);
		this.t_tangents = createBuffer(this.tangents, 3);
		this.t_bitangents = createBuffer(this.bitangents, 3);
		// TODO: delete this.vertices and so on now that we've buffered them? maybe....
		//console.log(this.t_vertices.numItems, this.t_normals.numItems, this.t_texCoords.numItems, this.t_texAtlas.numItems);
		console.log("World tesselation complete!");
	};
	this.getResolution = function(){
		return m_RESOLUTION;
	};
	this.getHeight = function(){
		return m_MAX[1];
	}
	this.getOrigin = function(){
		return m_ORIGIN;
	};
	this.canBeOccupied = function(x,y,z){
		if (threshold(x,y,z)== terrains.AIR){
			if (threshold(x,y+1,z)== terrains.GROUND){
				return true;
			}
		}
		return false;
	}
	this.print = function(){
		console.log("Chunk of the world @ " + m_ORIGIN + " with resolution " + m_RESOLUTION);
	};
	this.vertices = new Array();
	this.normals = new Array();
	this.texCoords = new Array();
	this.texAtlas = new Array();
	this.tangents = new Array();
	this.bitangents = new Array();

	this.t_vertices;
	this.t_normals;
	this.t_texCoords;
	this.t_texAtlas;
	this.t_tangents;
	this.t_bitangents;

	return true;
}