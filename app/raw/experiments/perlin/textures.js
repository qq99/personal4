var turbulence = function(u,v, scale, depth, levels)
{
	// turbulence texture
	var noiseCoef = 0;
	for (var level = 1; level < levels; level ++)
	{
		noiseCoef += (1 / level) 
			* Math.abs(noise(level * scale * u, 
							level * scale * v,
							depth));
	}
	return noiseCoef;
};
var jupiter = function(u,v,scale,depth,levels)
{
	// first get some base Perlin noise from turbulence
	var noiseCoef = turbulence(u,v,scale,depth,levels);
	// then we'll alter it to have the jupiter pattern
	noiseCoef = 0.5 * Math.cos((u + v) * scale + noiseCoef) + 0.5;
	return noiseCoef;
};
var sinusoidal = function(u,v,scale,depth,levels,trig_func,axis)
{
	trig_func = trig_func || Math.cos;
	if (axis==0 || axis==null) axis = u;
	var noiseCoef = turbulence(u,v,scale,depth,levels);
	noiseCoef = 0.5 * trig_func(axis * scale + noiseCoef ) + 0.5;
	return noiseCoef;
}
var oscillator = function(u,v,scale,depth,levels)
{
	// oscillator
	var noiseCoef = 0;
	for (var level = 1; level < levels; level ++)
	{
		noiseCoef += (1 / level) 
			* Math.abs(noise(Math.sin(depth) * scale * u, 
							Math.sin(depth) * scale * v,
							depth));
	}
	return noiseCoef;
};