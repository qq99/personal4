small_grassy = new SCENE(32.0);
small_grassy.create = function()
{
	if (this.initialized) return;
	this.initialized = true;
	console.log("Initializing shaders...");
	var RES = this.RES;

	var terrain_shader = new SHADER_PROGRAM("terrain.vert", "terrain.frag");
	var water_shader = new SHADER_PROGRAM("flat.vert", "water.frag");
	var path_shader = new SHADER_PROGRAM("quad.vert", "quad.frag");
	var character_shader = new SHADER_PROGRAM("character.vert", "character.frag");
	var tree_shader = new SHADER_PROGRAM("skeleton_tree.vert", "skeleton_tree.frag");
	terrain_shader.init();
	water_shader.init();
	path_shader.init();
	character_shader.init();
	tree_shader.init();
	console.log("Shaders initialized.");

	var cube = new CUBE();
	cube.set_shader(terrain_shader);
	cube.set_biome("grass");
	cube.init(gl, RES, 0, 0, 0);
	cube.print();
	cube.tesselate();

	var T = new TREE([9.0,2.5,12.0]);
	T.set_shader(tree_shader);
	T.init(6);
	//T.print();
	var t2 = new TREE([15.0, 1.5, 19.0]);
	t2.set_shader(tree_shader);
	t2.init(4);
	this.drawables.push(T,t2);

	var water_system = new WATER([4*RES,4*RES], [0,0], [RES,RES], 1.5, [cube, T, t2]);
	water_system.set_shader(water_shader);
	water_system.init();
	//water_system.disableReflection();
	this.drawables.push(cube);
	this.drawables.push(water_system);
	this.drawables.push(GAME);

	test_character = new CHARACTER();
	test_character.init(character_shader, [10.0, 10.0, 2.0], "Bob", cube);
	this.drawables.push(test_character);

	p2 = new CHARACTER();
	p2.init(character_shader, [17.0, 15.0, 3.0], "Deranged CS488 Student", cube);
	p2.modifyMoveDistance(10)
	this.drawables.push(p2);

	GAME.init([cube], path_shader); // for now it can only take 1 terrain at a time
	GAME.addCharacter(test_character);
	GAME.addCharacter(p2);

	CAMERA.init(game_canvas, [0,RES,-RES], [0,1,0], [0,0,0], RES); 
    $(window).bind("keydown", function(event){
        if (event.keyCode == 80) // path demonstration mode initiate!
        {
            GAME.demonstratePathFinding();
        }
    });
};