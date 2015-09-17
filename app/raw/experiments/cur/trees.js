function TREE(position_xyz){
	// constructor:
	this.world_position = vec3.create(position_xyz);
	// private:
	var m_shader;
	var growth_system = "analytic"; // abtract types later
	this.LEAVES = {
		NONE: 0,
		POINTSPITE : 1
	};
	var m_leaf_system = this.LEAVES.NONE;
	var m_branch_scale_y = 0.9; // how much shorter should the next segment be with respect to the previous?
	var m_branch_scale_radius = 0.9; // how much thinner should the radii be with respect to the previous?
	var m_iteration = 0; // the current life of the tree
	var m_growth_direction = vec3.create([0.0, 1.0, 0.0]);

	var degreesX = 55.0 // max
	var degreesZ = 55.0 // max
	
	var rX = degreesX * TO_RADIANS;
	var rZ = degreesZ * TO_RADIANS;
	// segment data structure:
	function SEGMENT(iteration, bot, top, mvMatrix){
		this.mvMatrix = mvMatrix;
		this.iteration = iteration;
		this.top_radius = null;
		this.bottom_radius = null;
		// vectors:
		this.top = top;
		this.bottom = bot; // should probably be the top of the previous segment for polygon tessellation continuity
		this.randomRotation = function(){
			var zRot = mat4.identity();
			var randRZ = (Math.random() * rZ) - (0.5*rZ); // a random radian bounded by degreesX;
			mat4.rotateZ(zRot, randRZ);
			var xRot = mat4.identity();
			var randRX = (Math.random() * rX) - (0.5*rX); // get rid of the 0.5*rX type term from each to get something more like the fractal fern
			mat4.rotateX(xRot, randRX);
			mat4.multiply(xRot,zRot);
			return xRot;
		},
		this.branch = function(i){
			var new_branches = new Array();
			var upwards = vec3.create();
			vec3.add(this.top, m_growth_direction, upwards);
			// how many branches?
			var n = Math.random() * (m_iteration - i) + 4;
			n = parseInt(n);
			for (var a = 0; a < n; a++)
			{
				var tmp = vec3.create();
				mat4.multiplyVec3(this.randomRotation(),upwards, tmp);
				new_branches.push(new SEGMENT(i, this.top, tmp, this.mvMatrix));
			}

			return new_branches;
		};
		this.skeleton = function(){
			
		};
		this.print = function()
		{
			console.log("Iteration Depth: " + this.iteration, "TopRadius: " + this.top_radius, "BotRadius: " + this.bottom_radius, "[" + this.bottom[0] + "," + this.bottom[1] + "," + this.bottom[2] + "]", "[" + this.top[0] + "," + this.top[1] + "," + this.top[2] + "]");	
		};
	}

	var segments = null;

	// private methods:
	var iterate = function(nodes, cur, max, storage)
	{
		if (cur==max) return;
		for (var i = 0; i < nodes.length; i++)
		{
			storage.push(nodes[i]);
			iterate(nodes[i].branch(cur+1), cur+1, max, storage);
		}
	};
	this.t_vertices = null;
	this.t_iterations = null;
	tessellate = function(which){
		console.log("Tessellating tree in skeleton mode...");
		//console.log(m_iteration);
		// skeleton mode:
		vertices = new Array();
		iterations = new Array();
		for (var i = 0; i < segments.length; i++)
		{
			var top = segments[i].top;
			var bot = segments[i].bottom;			
			// convert it into geometry
			vertices.push(top[0] + 2*which.world_position[0]);
			vertices.push(top[1] + 2*which.world_position[1]); 
			vertices.push(top[2] + 2*which.world_position[2]);
			vertices.push(bot[0] + 2*which.world_position[0]);
			vertices.push(bot[1] + 2*which.world_position[1]); 
			vertices.push(bot[2] + 2*which.world_position[2]);
			iterations.push(segments[i].iteration / m_iteration);
			iterations.push(segments[i].iteration / m_iteration);
		}
		//console.log(vertices);
		which.t_vertices = createBuffer(vertices, 3);
		which.t_iterations = createBuffer(iterations, 1);
		//console.log(iterations);
		console.log("Tessellation of tree complete");
	};
	// public:
	this.draw = function(mvMatrix, pMatrix, normalMatrix)
	{
		var shader = this.m_shader.program();
		gl.useProgram(shader);
		//console.log(this.t_vertices, this);
		bindArrayBuffer(shader.vertexPositionAttribute, this.t_vertices);
		bindArrayBuffer(shader.aLife, this.t_iterations);

        // set matrix uniforms:
        gl.uniformMatrix4fv(shader.pMatrixUniform, false, pMatrix);
        gl.uniformMatrix4fv(shader.mvMatrixUniform, false, mvMatrix);
        gl.uniform1f(shader.uTime, TICK);
        gl.uniform1f(shader.uMaxIterations, 10);
		
   		// draw the buffers yo
        gl.drawArrays(gl.LINES, 0, this.t_vertices.numItems);
        gl.disable(gl.BLEND);		
	};
	this.init = function(numIterations)
	{
		m_iteration = numIterations;
		segments = new Array();
		var root = new SEGMENT(0, vec3.create([0,0,0]), vec3.create([0,1,0]), mat4.identity());
		//this.print();
		console.log("Creating tree...");
		iterate([root], 0, numIterations, segments);
		console.log("Tree created.");
		tessellate(this);

	};
	this.set_shader = function(shader)
	{
		this.m_shader = shader;	
	};
	this.print = function(){
		for (var i = 0; i < segments.length; i++)
		{
			segments[i].print();
		}
	};
}
var TREE_TEST = function()
{
	var T = new TREE([0.0,5.0,0.0]);
	T.init(5);
	T.print();
};