function clamp(n, size){
    if(n < 0){
        return 0;
    }
    else if(n >= size){
        return size-1;
    }
    else{
        return n;
    }
}

function createDynamicBuffer(from, itemSize)
{
    bufferPtr = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferPtr);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(from), gl.DYNAMIC_DRAW);
	bufferPtr.itemSize = itemSize;
	bufferPtr.numItems = from.length / bufferPtr.itemSize;
	if (gl.getError() != 0){
		console.log("Error creating " + itemSize + "-component buffer " + from);
		return null;
	}
	return bufferPtr;
}

function createBuffer(from, itemSize){
	gl.getError();
    bufferPtr = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferPtr);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(from), gl.STATIC_DRAW);
	bufferPtr.itemSize = itemSize;
	bufferPtr.numItems = from.length / bufferPtr.itemSize;
	var error = gl.getError();
	if (error != 0){
		console.log("Error creating " + itemSize + "-component buffer " + error);
		return null;
	}
	return bufferPtr;
}
function bindArrayBuffer(bindTo, bufferPtr, stride)
{
	gl.getError();
	gl.bindBuffer(gl.ARRAY_BUFFER, bufferPtr);
    gl.vertexAttribPointer(bindTo, bufferPtr.itemSize, gl.FLOAT, false, stride, 0);	
}
function bindArrayBuffer(bindTo, bufferPtr){
	gl.getError();
	gl.bindBuffer(gl.ARRAY_BUFFER, bufferPtr);
    gl.vertexAttribPointer(bindTo, bufferPtr.itemSize, gl.FLOAT, false, 0, 0);
}
var PI = 3.14159;
var TO_RADIANS = PI / 180.0;