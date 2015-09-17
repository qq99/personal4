big_terrain = new SCENE(128.0);
big_terrain.create = function()
{
	if (this.initialized) return;
	this.initialized = true;
	console.log("Initializing scene: big terrain");
	console.log("Initializing shaders...");
	var RES = this.RES;

	var terrain_shader = new SHADER_PROGRAM("terrain.vert", "terrain.frag");
	var water_shader = new SHADER_PROGRAM("flat.vert", "water.frag");
	terrain_shader.init();
	water_shader.init();
	console.log("Shaders initialized.");

	var cube = new CUBE();
	cube.set_shader(terrain_shader);
	cube.set_biome("grass");
	cube.init(gl, RES, 0, 0, 0);
	cube.print();
	cube.tesselate();

	var water_system = new WATER([RES,RES], [0,0], [RES,RES], 1.5, [cube]);
	water_system.set_shader(water_shader);
	water_system.init();
	//water_system.disableReflection();
	this.drawables.push(cube);
	this.drawables.push(water_system);

	CAMERA.init(game_canvas, [0,RES,-RES], [0,1,0], [0,0,0], RES); 

};