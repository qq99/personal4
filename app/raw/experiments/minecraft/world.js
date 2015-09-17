var cube = {};
(function(){
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
            0.0, 0.0, 1.0,
            0.0, 0.0, 1.0,

            0.0, 0.0, 1.0,   
            0.0, 0.0, 1.0,       
            0.0, 0.0, 1.0,    
            // Back face
            0.0, 0.0, -1.0,
            0.0, 0.0, -1.0,
            0.0, 0.0, -1.0,

            0.0, 0.0, -1.0,     
            0.0, 0.0, -1.0,              
            0.0, 0.0, -1.0,
            // Top Face
            0.0, 1.0, 0.0,
            0.0, 1.0, 0.0,
            0.0, 1.0, 0.0,

            0.0, 1.0, 0.0,
            0.0, 1.0, 0.0,
            0.0, 1.0, 0.0,

            // Bottom face
            0.0, -1.0, 0.0,
            0.0, -1.0, 0.0,
            0.0, -1.0, 0.0,

            0.0, -1.0, 0.0,
            0.0, -1.0, 0.0,
            0.0, -1.0, 0.0, 

            // Right face
            1.0, 0.0, 0.0,
            1.0, 0.0, 0.0,
            1.0, 0.0, 0.0,

            1.0, 0.0, 0.0,
            1.0, 0.0, 0.0,        
            1.0, 0.0, 0.0,
            // Left face
            -1.0, 0.0, 0.0,
            -1.0, 0.0, 0.0,
            -1.0, 0.0, 0.0,

            -1.0, 0.0, 0.0,
            -1.0, 0.0, 0.0,
            -1.0, 0.0, 0.0,
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
	var threshold = function(x,y,z){
		if (proc_LUT[index(x,y,z)] > 0.46){
			return terrains.GROUND;
		}
		else{
			return terrains.AIR;
		}
	};
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
	var tesellate1 = function(x,y,z, vertices_array, normals_array, texture_coords){
		// we want an empty block
		if (terrains.AIR==threshold(x,y,z)){
			//console.log(x,y,z);
			// and it better have some neighbours
			if (has_neighbours(x,y,z)){

				for (var a=0; a < cube_vertices.length; a+=3){
					vertices_array.push(cube_vertices[a] + 2*x);
					vertices_array.push(cube_vertices[a+1] + 2*y);
					vertices_array.push(cube_vertices[a+2] + 2*z);
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
	};
	var clamp = function(n, size){
	    if(n < 0){
	        return 0;
	    }
	    else if(n >= size){
	        return size-1;
	    }
	    else{
	        return n;
	    }
	};
	var index = function(x,y,z){
		var size = m_RESOLUTION;
		return clamp(x, size)+clamp(y, size)*size+clamp(z, size)*size*size;
	};
	var generator = function(x,y,z){
		x += m_ORIGIN[0];
		y += m_ORIGIN[1];
		z += m_ORIGIN[2];
        var noiseCoef = 0.0;
        for (var level = 1; level < 2; level ++)
        {
            noiseCoef = noiseCoef + (level) 
                * noise(x*level*5,y*level*5,z*level*5);
        }
        return Math.abs(noiseCoef);
	};
	var createLUT = function(){
		proc_LUT = new Array(m_RESOLUTION*m_RESOLUTION*m_RESOLUTION);
		var xf; var yf; var zf;
		for (var x = 0; x < m_RESOLUTION; x++){
			xf = x / m_RESOLUTION;
			for (var y=0; y < m_RESOLUTION; y++){
				yf = y / m_RESOLUTION;
				for (var z=0; z < m_RESOLUTION; z++){
					zf = z / m_RESOLUTION;
					var idx = index(x,y,z);
					proc_LUT[idx] = generator(xf,yf,zf);
				}
			}
		}
		LUT_READY = true;
	}
	var m_RESOLUTION; // resolution of the world
	var m_ORIGIN; // offset of current chunk wrt world
	var proc_LUT = []; // the look-up table for the procedural function
	var LUT_READY = false;
	//public:
	this.init = function(resolution, x,y,z){
		m_RESOLUTION = resolution;
		m_ORIGIN = [x,y,z];
		createLUT();
	}
	this.tesselate = function(vertices, normals, texcoords){
		if (!LUT_READY) {
			console.log("LUT is not ready. Terminating tesselation");
			return null;
		}
		// returns the required arrays for use with WebGL
		var obj = {};
		obj.vertices = new Array();
		obj.normals = new Array();

		var xf; var yf; var zf;
		for (var x = 0; x < m_RESOLUTION; x++){
			xf = x / m_RESOLUTION;
			for (var y=0; y < m_RESOLUTION; y++){
				yf = y / m_RESOLUTION;
				for (var z=0; z < m_RESOLUTION; z++){
					zf = z / m_RESOLUTION;
					var p = tesellate1(x, y, z, vertices, normals, texcoords);
				}
			}
		}
		this.vertices = obj.vertices;
		this.normals = obj.normals;
		console.log("World tesselation complete!");
	}
	this.print = function(){
		console.log("Chunk of the world @ " + m_ORIGIN + " with resolution " + m_RESOLUTION);
	}
	this.clone = function(){
		return jQuery.extend(true, {}, this);
	}
	this.vertices = [];
	this.normals = [];
}).apply(cube);