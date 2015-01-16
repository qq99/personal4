function SPLINE(type) {
	var m_type = type;
	this.m_controls = new Array(); // an array of control points
	// temp vectors to avoid wasting memory:
	var m0 = vec3.create();
	var m1 = vec3.create();
	var r0 = vec3.create();
	var r1 = vec3.create();
	var r2 = vec3.create();
	var r3 = vec3.create();

	this.addControlPoint = function(p)
	{
		var vp = vec3.create(p);
		this.m_controls.push(vp);
	};
	var spline_library = {
		CR : 
		{
			parametric : function(t, p1, p2, p3, p4)
			{
				// calculate the catmull-rom parametric equation efficiently over the points in question
				// use the factorized form:
				// h_00(t) = (1+2t)(1-t)^2
				// h_10(t) = t(1-t)^2
				// h_01(t) = t^2(3-2t)
				// h_11(t) = t^2(t-1)
				var ac = Math.pow((1.0 - t), 2);
				var bc = Math.pow(t,2);
				var cc = 2*t;
				var h00 = (1 + cc) * ac;
				var h10 = t*ac;
				var h01 = bc * (3-cc);
				var h11 = bc * (t-1);

				// p(t) = h_00(t)p_0 + h_10(t)m_0 + h_01(t)p_1 + h_11(t)m_1
				
				// calculate m_0 and m_1, as per CR
				vec3.subtract(p3,p1,m0);
				vec3.subtract(p4,p2,m1);
				// start calculating parts of p(t):				
				vec3.scale(p2, h00, r0);
				vec3.scale(p3, h01, r1);
				vec3.scale(m0, h10, r2);
				vec3.scale(m1, h11, r3);

				// sum them up for result:
				var x = r0[0] + r1[0] + r2[0] + r3[0];
				var y = r0[1] + r1[1] + r2[1] + r3[1];
				var z = r0[2] + r1[2] + r2[2] + r3[2];				
				return [x,y,z];
			},
			interpolator : function(t)
			{
				if ((t > 1.0) || (t < 0.0)) return null;
				return this.interpolate(t, this.m_controls[0], this.m_controls[1], this.m_controls[2], this.m_controls[3]);
			}	
		}	
	};
	this.interpolate = function(t, p1, p2, p3, p4) // t= 0..1
	{
		
	}
	this.interpolateAt = function(t){ // t = 0..1
		console.log("Spline was not initialized correctly.");
	};
	this.getType = function(){
		return m_type;	
	};

	// testing functions:
	this.testEvaluate = function(resolution){
		var granularity = 1.0 / resolution;
		console.log("Evaluating your spline from t=0..1 in intervals of " + granularity);
		for (var x = 0.0; x < 1.0; x += granularity){
			console.log(this.interpolate(x, this.m_controls[0], this.m_controls[1], this.m_controls[2], this.m_controls[3]));
		}
	};
	this.testPoints = function(){
		var p0 = vec3.create([-2.0, 0.0, 0.0]);
		var p1 = vec3.create([0.0, 0.0, 0.0]);;
		var p2 = vec3.create([1.0, 1.0, 1.0]);;
		var p3 = vec3.create([3.0, 1.0, 1.0]);;
		this.addControlPoint(p0);
		this.addControlPoint(p1);
		this.addControlPoint(p2);
		this.addControlPoint(p3);
	};

	this.interpolateAt = spline_library.CR.interpolator;
	this.interpolate = spline_library.CR.parametric;
}