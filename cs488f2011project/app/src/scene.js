function SCENE(world_resolution)
{
	this.RES = world_resolution;
	this.drawables = new Array();
	this.initialized = false;
	this.draw = function(){
		var RES = this.RES;

        gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
        gl.clearColor(1.0, 1.0, 1.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, 1, 2000.0, pMatrix);

        mat4.identity(mvMatrix);
        mat4.multiply(mvMatrix,CAMERA.getMatrix());
        mat4.translate(mvMatrix, [-1*RES, 0, -1* RES]);

        // calulate/reset the normal matrix
        mat4.set(mvMatrix,normalMatrix);

        mat4.inverse(normalMatrix);
        mat4.transpose(normalMatrix);

        for (var x = 0; x < this.drawables.length; x++){
            this.drawables[x].draw(mvMatrix, pMatrix, normalMatrix);
        }
	};
}