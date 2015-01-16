function createBuffer(from, itemSize){
    bufferPtr = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferPtr);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(from), gl.STATIC_DRAW);
	bufferPtr.itemSize = itemSize;
	bufferPtr.numItems = from.length / bufferPtr.itemSize;
	if (gl.getError() != 0){
		console.log("Error creating " + itemSize + "-component buffer " + from);
		return null;
	}
	return bufferPtr;
}
function bindArrayBuffer(bindTo, bufferPtr, stride)
{
	gl.bindBuffer(gl.ARRAY_BUFFER, bufferPtr);
    gl.vertexAttribPointer(bindTo, bufferPtr.itemSize, gl.FLOAT, false, stride, 0);	
}
function bindArrayBuffer(bindTo, bufferPtr){
	gl.bindBuffer(gl.ARRAY_BUFFER, bufferPtr);
    gl.vertexAttribPointer(bindTo, bufferPtr.itemSize, gl.FLOAT, false, 0, 0);
}