function SHADER_PROGRAM(vProg, fProg){
	var m_shader_program; // the GL state of the program
	var m_vertex_program = vProg;
	var m_fragment_program = fProg;

	this.getShader = function(id){
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
            alert(gl.getShaderInfoLog(shader));
            return null;
        }

        return shader;
	};

	this.init = function(){
		// init shaders:
		var fragmentShader = this.getShader(m_fragment_program);
		var vertexShader = this.getShader(m_vertex_program);

		m_shader_program = gl.createProgram();
		gl.attachShader(m_shader_program, vertexShader);
		gl.attachShader(m_shader_program, fragmentShader);
		gl.linkProgram(m_shader_program);

		if (!gl.getProgramParameter(m_shader_program, gl.LINK_STATUS)) {
		    alert("Could not initialise shaders");
		}
		if (m_fragment_program == "terrain.frag"){
			gl.useProgram(m_shader_program);

			m_shader_program.vertexPositionAttribute = gl.getAttribLocation(m_shader_program, "aVertexPosition");
			gl.enableVertexAttribArray(m_shader_program.vertexPositionAttribute);

			m_shader_program.textureCoordAttribute = gl.getAttribLocation(m_shader_program, "aTextureCoord");
			gl.enableVertexAttribArray(m_shader_program.textureCoordAttribute);

			m_shader_program.normalVector = gl.getAttribLocation(m_shader_program, "aNormal");
			gl.enableVertexAttribArray(m_shader_program.normalVector);

			m_shader_program.tangentVector = gl.getAttribLocation(m_shader_program, "aTangent");
			gl.enableVertexAttribArray(m_shader_program.tangentVector);

			m_shader_program.bitangentVector = gl.getAttribLocation(m_shader_program, "aBitangent");
			gl.enableVertexAttribArray(m_shader_program.bitangentVector);

			m_shader_program.textureAtlasAttribute = gl.getAttribLocation(m_shader_program, "aTextureAtlasIndex");
			gl.enableVertexAttribArray(m_shader_program.textureAtlasAttribute);

			m_shader_program.pMatrixUniform = gl.getUniformLocation(m_shader_program, "uPMatrix");
			m_shader_program.mvMatrixUniform = gl.getUniformLocation(m_shader_program, "uMVMatrix");
			m_shader_program.normalMatrixUniform = gl.getUniformLocation(m_shader_program, "uNormalMatrix");
			m_shader_program.perm_sampler = gl.getUniformLocation(m_shader_program, "uperm_sampler");
			m_shader_program.grad_sampler = gl.getUniformLocation(m_shader_program, "igrad_sampler");
			m_shader_program.texture_sampler = gl.getUniformLocation(m_shader_program, "texture_sampler");
			m_shader_program.time = gl.getUniformLocation(m_shader_program, "time");
			m_shader_program.mouseX = gl.getUniformLocation(m_shader_program, "mouseX");
		}
		else if (m_fragment_program == "water.frag"){
			gl.useProgram(m_shader_program);

			m_shader_program.vertexPositionAttribute = gl.getAttribLocation(m_shader_program, "aVertexPosition");
			gl.enableVertexAttribArray(m_shader_program.vertexPositionAttribute);

			m_shader_program.normalVector = gl.getAttribLocation(m_shader_program, "aNormal");
			gl.enableVertexAttribArray(m_shader_program.normalVector);

			m_shader_program.context_size = gl.getUniformLocation(m_shader_program, "uContextSize");
			m_shader_program.pMatrixUniform = gl.getUniformLocation(m_shader_program, "uPMatrix");
			m_shader_program.mvMatrixUniform = gl.getUniformLocation(m_shader_program, "uMVMatrix");
			m_shader_program.reflection_sampler = gl.getUniformLocation(m_shader_program, "reflection_sampler");
			m_shader_program.perm_sampler = gl.getUniformLocation(m_shader_program, "uperm_sampler");
			m_shader_program.grad_sampler = gl.getUniformLocation(m_shader_program, "igrad_sampler");			
			m_shader_program.normalMatrixUniform = gl.getUniformLocation(m_shader_program, "uNormalMatrix");
			m_shader_program.time = gl.getUniformLocation(m_shader_program, "time");
			m_shader_program.uTime = gl.getUniformLocation(m_shader_program, "uTime");
			m_shader_program.uViewport = gl.getUniformLocation(m_shader_program, "uViewport");

		}
		else if (m_fragment_program == "quad.frag")
		{
			gl.useProgram(m_shader_program);

			m_shader_program.vertexPositionAttribute = gl.getAttribLocation(m_shader_program, "aVertexPosition");
			gl.enableVertexAttribArray(m_shader_program.vertexPositionAttribute);
			m_shader_program.pathColorAttribute = gl.getAttribLocation(m_shader_program, "aColor");
			gl.enableVertexAttribArray(m_shader_program.pathColorAttribute);
			m_shader_program.time = gl.getUniformLocation(m_shader_program, "time");
			m_shader_program.pMatrixUniform = gl.getUniformLocation(m_shader_program, "uPMatrix");
			m_shader_program.mvMatrixUniform = gl.getUniformLocation(m_shader_program, "uMVMatrix");
		}
		else if (m_fragment_program == "character.frag")
		{
			gl.useProgram(m_shader_program);

			m_shader_program.vertexPositionAttribute = gl.getAttribLocation(m_shader_program, "aPosition");
			gl.enableVertexAttribArray(m_shader_program.vertexPositionAttribute);
			m_shader_program.pMatrixUniform = gl.getUniformLocation(m_shader_program, "uPMatrix");
			m_shader_program.uScale = gl.getUniformLocation(m_shader_program, "uScale");
			m_shader_program.mvMatrixUniform = gl.getUniformLocation(m_shader_program, "uMVMatrix");
			m_shader_program.uTime = gl.getUniformLocation(m_shader_program, "uTime");
			m_shader_program.uViewport = gl.getUniformLocation(m_shader_program, "uViewport");

			m_shader_program.sTexture = gl.getUniformLocation(m_shader_program, "sTexture");
			
		}
		var error = gl.getError();
		if (error>0){
			console.log("Error somewhere in the init of shader " + m_fragment_program);
		}
	};

	this.program = function(){
		return m_shader_program;	
	};

	return true;

}