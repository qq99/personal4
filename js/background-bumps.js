<script id="bg.frag" type="x-shader/x-fragment">
    #ifdef GL_ES
    precision highp float;
    #endif

    varying vec3 vNormal;
    varying vec2 vTextureCoord;
    varying vec3 vPosition;
    uniform sampler2D background_sampler;
    varying vec2 mouse;

    uniform vec4 diffuse_material;
    uniform float light_z;
    uniform float rho;
    uniform float bump_scale;
    uniform float delta_s;
    uniform float delta_t;

    vec3 bump_map(vec3 normal)
    {
        float scale = bump_scale;
        vec4 tex = texture2D(background_sampler,vTextureCoord);
        float deltaS = vTextureCoord.s+delta_s;
        float deltaT = vTextureCoord.t+delta_t;


        vec4 ds = texture2D(background_sampler,vec2(deltaS,vTextureCoord.t)) - tex;
        vec4 dt = texture2D(background_sampler,vec2(vTextureCoord.s,deltaT)) - tex;
        float magX = ds.b;
        float magY = dt.b;

        normal += scale*magX*vec3(1.0,0.0,0.0);
        normal += scale*magY*vec3(0.0,1.0,0.0);
        return normalize(normal);
    }

    void main(void) {
        vec3 N = vNormal;
        N = bump_map(N);
        // lights:
        vec4 ambient = vec4(0.01, 0.01, 0.01, 1.0); //colours
        vec4 light_spec = vec4(0.1, 0.1, 0.1, 1.0); // ^
        vec4 light_diffuse = vec4(1.0, 1.0, 1.0, 1.0);// ^
        vec3 test_light = vec3(0.0,0.0,light_z); //position
    	vec3 light_position = vec3(mouse.xy, light_z); // the one controlled by mouse

        vec3 view = vPosition;

    	vec3 L_m = normalize(light_position - view);

        // materials:
        //vec4 md = texture2D(background_sampler, vTextureCoord);
        //vec4 md = vec4(0.7,0.0,0.0,1.0);
        vec4 md = diffuse_material;
        vec4 ms = vec4(0.1,0.1,0.1,1.0);
        //ms = md*0.5;


        // Diffuse
        float Idiff = max(dot(N,L_m), 0.0);
        Idiff = clamp(Idiff, 0.0, 1.0); 
        // Specular:
        vec3 R_m = reflect(-L_m, N);
        float Ispec = pow(dot(R_m,view), rho);      // calculate Phong specular intensity, Ispec
        //Ispec = 0.0;

    	//gl_FragColor = 0.8* texture2D(background_sampler,vTextureCoord) + cd * vec4(1,0,0,1.0);

        vec4 combination = (Idiff * light_diffuse * md) + (Ispec * light_spec * ms) + ambient;
        gl_FragColor = combination;
    }
</script>
<script id="bg.vert" type="x-shader/x-vertex">
    attribute vec3 aVertexPosition;
    attribute vec2 aTextureCoord;
    
    uniform float mouseX;
    uniform float mouseY;
    uniform float viewport_aspect;
    uniform float texture_aspect;
    uniform float texture_coord_scale;

    varying vec3 vNormal;
    varying vec2 vTextureCoord;
    varying vec3 vPosition;
    varying vec2 mouse;
    void main(void) {
        gl_Position = vec4(aVertexPosition, 1.0);
        vPosition = aVertexPosition;
        vNormal = vec3(0.0, 0.0, 1.0);
        vTextureCoord = texture_coord_scale * aTextureCoord; // scale
        vTextureCoord.s = texture_aspect * viewport_aspect * vTextureCoord.s; // adjust in S to account for viewport and texture variations
        mouse = vec2(mouseX, mouseY);
    }

</script>
<script type="text/javascript">
$(document).ready(function(){
    var Controls = function(){
        this.light_z = 0.5;
        this.mouse_x = 0.0;
        this.mouse_y = 0.0;
        this.offset_x = 0.01;
        this.offset_y = 0.01;
        this.rho = 0;
        this.bump_scale = 29.9;
        this.delta_s = 0.005;
        this.delta_t = 0.005;
        this.texture_coord_scale = 4.2;
        this.diffuse = [64,67,76,255]; // CSS string
        this.pattern = '45degreee_fabric';
        this.texture_aspect = 1; // not all textures are square, so we need to have a way to accomodate for that
        this.texture_diffuse_rgba = [this.diffuse[0]/255.0, this.diffuse[1]/255.0, this.diffuse[2]/255.0, this.diffuse[3]/255.0]; // save the shader acceptable rgba here to avoid recomputation
    };
    var gui = new dat.GUI({
 /*       load: {
            "preset": "Dem Bumps",
            "remembered": {
                "Dem Bumps" : {
                    "0" : {
                        "pattern" : "flowers",
                        "light_z" : 0.35,
                        "offset_x" : 0,
                        "offset_y" : 0,
                        "rho" : 2,
                        "bump_scale" : 40,
                        "delta_s" : 0.005,
                        "delta_t" : 0.005,
                        "texture_coord_scale" : 4.2,
                        "diffuse": [64,67,76,255]
                    }
                }
            }
        }*/
    });    
    var gui_data = new Controls();
    //gui.remember(gui_data);
    gui.add(gui_data, "light_z", 0, 2);
    gui.add(gui_data, "offset_x", -2.0, 2.0);
    gui.add(gui_data, "offset_y", -2.0, 2.0);
    gui.add(gui_data, "rho", 0.0, 150.0);
    gui.add(gui_data, "bump_scale", 0, 40);
    gui.add(gui_data, "delta_s", 0, 0.1);
    gui.add(gui_data, "delta_t", 0, 0.1);
    gui.add(gui_data, "texture_coord_scale", 1, 40);
    gui.add(gui_data, 'pattern', [
        'always_grey',
        'black_scales',
        'crissXcross',
        'flowers',
        'hixs_pattern_evolution',
        'leather_1',
        'light_honeycomb',
        'mirrored_squares',
        'paven',
        'pool_table',
        'px_by_Gre3g',
        'random_grey_variations',
        'rip_jobs',
        'soft_circle_scales',
        'starring',
        'struckaxiom',
        'type',
        'washi',
        'wood_1',
        'wood_pattern',
        'woven',
        'xv'
         ]).onChange(function(value)
        {
            var src = '../img/subtlepatterns/' + value + '.png';
            textureSrc(src);
        });
    gui.addColor(gui_data, 'diffuse').onChange(function(value){
        // memoize the rgba 0..255 > 0..1 conversion here.
        gui_data.texture_diffuse_rgba[0] = value[0]/255.0;
        gui_data.texture_diffuse_rgba[1] = value[1]/255.0;
        gui_data.texture_diffuse_rgba[2] = value[2]/255.0;
        gui_data.texture_diffuse_rgba[3] = value[3]/255.0;

    });

    // shim layer with setTimeout fallback
    window.requestAnimFrame = (function(){
      return  window.requestAnimationFrame       || 
              window.webkitRequestAnimationFrame || 
              window.mozRequestAnimationFrame    || 
              window.oRequestAnimationFrame      || 
              window.msRequestAnimationFrame     || 
              function( callback ){
                window.setTimeout(callback, 1000 / 60);
              };
    })();
	var drawing_quad = {}, paused = false, mouse_position = {x:0, y:0};
    var canvas = document.getElementById("c");
    function getShader(gl, id) {
        var shaderScript = document.getElementById(id);
        if (!shaderScript) {
            return null;
        }

        var str = "";
        var k = shaderScript.firstChild;
        while (k) {
            if (k.nodeType == 3) {
                str += k.textContent;
            }
            k = k.nextSibling;
        }

        var shader;
        if (shaderScript.type == "x-shader/x-fragment") {
            shader = gl.createShader(gl.FRAGMENT_SHADER);
        } else if (shaderScript.type == "x-shader/x-vertex") {
            shader = gl.createShader(gl.VERTEX_SHADER);
        } else {
            return null;
        }

        gl.shaderSource(shader, str);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.log(gl.getShaderInfoLog(shader));
            return null;
        }

        return shader;
    }
    function initShaders() {
        var fragmentShader = getShader(gl, "bg.frag");
        var vertexShader = getShader(gl, "bg.vert");

        shaderProgram = gl.createProgram();
        gl.attachShader(shaderProgram, vertexShader);
        gl.attachShader(shaderProgram, fragmentShader);
        gl.linkProgram(shaderProgram);

        if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
            alert("Could not initialise shaders");
        }

        gl.useProgram(shaderProgram);

        shaderProgram.aVertexPosition = gl.getAttribLocation(shaderProgram, "aVertexPosition");
        gl.enableVertexAttribArray(shaderProgram.aVertexPosition);

        shaderProgram.aTextureCoord = gl.getAttribLocation(shaderProgram, "aTextureCoord");
        gl.enableVertexAttribArray(shaderProgram.aTextureCoord);

        shaderProgram.background_sampler = gl.getUniformLocation(shaderProgram, "background_sampler");
        shaderProgram.mouseX = gl.getUniformLocation(shaderProgram, "mouseX");
        shaderProgram.mouseY = gl.getUniformLocation(shaderProgram, "mouseY");
        shaderProgram.light_z = gl.getUniformLocation(shaderProgram, "light_z");
        shaderProgram.rho = gl.getUniformLocation(shaderProgram, "rho");
        shaderProgram.bump_scale = gl.getUniformLocation(shaderProgram, "bump_scale");
        shaderProgram.delta_s = gl.getUniformLocation(shaderProgram, "delta_s");
        shaderProgram.delta_t = gl.getUniformLocation(shaderProgram, "delta_t");
        shaderProgram.viewport_aspect = gl.getUniformLocation(shaderProgram, "viewport_aspect");
        shaderProgram.texture_aspect = gl.getUniformLocation(shaderProgram, "texture_aspect");
        shaderProgram.texture_coord_scale = gl.getUniformLocation(shaderProgram, "texture_coord_scale");
        shaderProgram.diffuse_material = gl.getUniformLocation(shaderProgram, "diffuse_material");
    }
	function initBuffers() {
	    drawing_quad.vertices = gl.createBuffer();
	    gl.bindBuffer(gl.ARRAY_BUFFER, drawing_quad.vertices);
	    var vertices = [
	        // Back face
	        -1.0, -1.0, 0.0,
	        -1.0,  1.0, 0.0,
	         1.0,  1.0, 0.0,
	         1.0, -1.0, 0.0,
	    ];
	    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
	    drawing_quad.vertices.itemSize = 3;
	    drawing_quad.vertices.numItems = 4;

	    drawing_quad.texture_coords = gl.createBuffer();
	    gl.bindBuffer(gl.ARRAY_BUFFER, drawing_quad.texture_coords);
	    var textureCoords = [
	      // Back face
	      -1.0, 0.0,
	      -1.0, 1.0,
	      0.0, 1.0,
	      0.0, 0.0,
	    ];
	    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoords), gl.STATIC_DRAW);
	    drawing_quad.texture_coords.itemSize = 2;
	    drawing_quad.texture_coords.numItems = 4;

	    drawing_quad.indices = gl.createBuffer();
	    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, drawing_quad.indices);
	    var cubeVertexIndices = [
	        0, 1, 2,      0, 2, 3,    // Back face
	    ];
	    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cubeVertexIndices), gl.STATIC_DRAW);
	    drawing_quad.indices.itemSize = 1;
	    drawing_quad.indices.numItems = 6;
	}
    function isPowerOfTwo(x) { // http://www.khronos.org/webgl/wiki/WebGL_and_OpenGL_Differences#Non-Power_of_Two_Texture_Support
        return (x & (x - 1)) == 0;
    }
     
    function nextHighestPowerOfTwo(x) { // http://www.khronos.org/webgl/wiki/WebGL_and_OpenGL_Differences#Non-Power_of_Two_Texture_Support
        --x;
        for (var i = 1; i < 32; i <<= 1) {
            x = x | x >> i;
        }
        return x + 1;
    }
	function handleLoadedTexture(texture) {
	    gl.bindTexture(gl.TEXTURE_2D, texture);
        gui_data.texture_aspect = texture.image.height / texture.image.width; // calculate aspect ratio of pre-POT-converted image
        if (!isPowerOfTwo(texture.image.width) || !isPowerOfTwo(texture.image.height)) {
            // Scale up the texture to the next highest power of two dimensions.
            var temp_canvas = document.createElement("canvas");
            temp_canvas.width = nextHighestPowerOfTwo(texture.image.width);
            temp_canvas.height = nextHighestPowerOfTwo(texture.image.height);
            var ctx = temp_canvas.getContext("2d");
            ctx.drawImage(texture.image, 0, 0, temp_canvas.width, temp_canvas.height);
            texture.image = temp_canvas;
        }

	    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
	    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
	    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
	    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);  
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.bindTexture(gl.TEXTURE_2D, null);
	}
    function initGL(canvas) {
        try {
            gl = canvas.getContext("experimental-webgl");
            gl.viewportWidth = canvas.width;
            gl.viewportHeight = canvas.height;
        } catch (e) {
        	console.log(e);
        }
        if (!gl) {
            $("#status").html("Could not initialise WebGL, sorry :-(");
        }
        else {
            $("#status").html("WebGL seems to have loaded correctly.  <a id='hide'>Hide this text, let me play with the background.</a>");
        }
    }
	function drawScene() {

        // calculate viewport aspect:
        var viewport_aspect = canvas.width / canvas.height;

	    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
	    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	    gl.bindBuffer(gl.ARRAY_BUFFER, drawing_quad.vertices);
	    gl.vertexAttribPointer(shaderProgram.aVertexPosition, drawing_quad.vertices.itemSize, gl.FLOAT, false, 0, 0);

	    gl.bindBuffer(gl.ARRAY_BUFFER, drawing_quad.texture_coords);
	    gl.vertexAttribPointer(shaderProgram.aTextureCoord, drawing_quad.texture_coords.itemSize, gl.FLOAT, false, 0, 0);

	    gl.activeTexture(gl.TEXTURE0);
	    gl.bindTexture(gl.TEXTURE_2D, drawing_quad.texture);
	    gl.uniform1i(shaderProgram.background_sampler, 0);
	    gl.uniform1f(shaderProgram.mouseX, gui_data.mouse_x);
	    gl.uniform1f(shaderProgram.mouseY, gui_data.mouse_y);
        gl.uniform1f(shaderProgram.light_z, gui_data.light_z);
        gl.uniform1f(shaderProgram.rho, gui_data.rho);
        gl.uniform1f(shaderProgram.bump_scale, gui_data.bump_scale);
        gl.uniform1f(shaderProgram.delta_s, gui_data.delta_s);
        gl.uniform1f(shaderProgram.delta_t, gui_data.delta_t);
        gl.uniform1f(shaderProgram.texture_coord_scale, gui_data.texture_coord_scale);
        gl.uniform1f(shaderProgram.viewport_aspect, viewport_aspect);
        gl.uniform4f(shaderProgram.diffuse_material, gui_data.texture_diffuse_rgba[0], gui_data.texture_diffuse_rgba[1], gui_data.texture_diffuse_rgba[2], gui_data.texture_diffuse_rgba[3]);
        gl.uniform1f(shaderProgram.texture_aspect, gui_data.texture_aspect);

	    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, drawing_quad.indices);
	    gl.drawElements(gl.TRIANGLES, drawing_quad.indices.numItems, gl.UNSIGNED_SHORT, 0);
	}
    function textureSrc(src)
    {
        if (drawing_quad.texture) // if it exists, delete old one
        {
            gl.deleteTexture(drawing_quad.texture);
        }
        drawing_quad.texture = gl.createTexture();
        drawing_quad.texture.image = new Image();
        drawing_quad.texture.image.onload = function () {
            handleLoadedTexture(drawing_quad.texture)
        }
        drawing_quad.texture.image.src = src;
        $("#texture_example").attr("src",src);
        $("#texture_src").val(src);
    }

    function webGLStart() {                
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        initGL(canvas);
        initShaders();
        initBuffers();
        textureSrc("../img/subtlepatterns/flowers.png");

        gl.clearColor(0.5, 0.5, 0.5, 1.0);
        gl.enable(gl.DEPTH_TEST);
        drawScene();
    }
    $("#texture_src").blur(function(){
        var newsrc = $(this).val();
        textureSrc(newsrc);
    });
	webGLStart();
	function animate(t) {
		if (!paused) {
		  last = t;
		  drawScene();
		}
		window.requestAnimFrame(animate, canvas);
	};
	animate(new Date().getTime());

	document.onmousemove = function(e)
	{
		ev = e || window.event;
		gui_data.mouse_x = (((ev.pageX - window.pageXOffset) / window.innerWidth)-0.5)+gui_data.offset_x;
		gui_data.mouse_y = -(((ev.pageY - window.pageYOffset) / window.innerHeight)-0.5)+gui_data.offset_y;
	};
    $(window).resize(function(){
        canvas.height = window.innerHeight;
        canvas.width = window.innerWidth;
        try {
            gl = canvas.getContext("experimental-webgl");
            gl.viewportWidth = canvas.width;
            gl.viewportHeight = canvas.height;
        } catch (e) {
            console.log(e);
        }
    });
    $("#hide").click(function(){
        $("section").fadeOut();
    });

});

</script>