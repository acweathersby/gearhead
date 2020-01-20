/* 

References
	http://www.gearseds.com/files/Approx_method_draw_involute_tooth_rev2.pdf
*/

const cos = Math.cos,
	sin = Math.sin;

function involute(t, r, a = 0) {
	return {
		x: r * (cos(t) + (t - a) * sin(t)),
		y: r * (sin(t) - (t - a) * cos(t))
	}
}

function strokeCircle(x, y, r, ctx, style = "black") {
	//draw minor circle
	ctx.beginPath();
	ctx.strokeStyle = style;
	ctx.arc(x, y, r, 0, Math.PI * 2);
	ctx.stroke();
}

function GearHead(canvas) {

	const ctx = canvas.getContext("2d");

	const pitch_angle = 50 * (Math.PI / 180);
	const pitch_diameter = 50;

	function drawGear(teeth_count) {
		let module = 30;
		let pressure_angle = 20 * Math.PI / 180;
		let profile_shift = 0;
		let pitch_diameter = 360 / teeth_count;
		let reference_diameter = module * teeth_count;
		let base_diameter = reference_diameter * cos(pressure_angle)
		let tip_diameter = reference_diameter + 2 * module  * (1 + profile_shift)
		let tip_radius = tip_diameter / 2;
		let base_radius = base_diameter / 2;
		let reference_radius = reference_diameter /2;
		var tip_pressure_angle = Math.acos(base_diameter / tip_diameter);
		var inv_alpha = Math.tan(pressure_angle) - pressure_angle;
		var inv_alpha_a = Math.tan(tip_pressure_angle) - tip_pressure_angle;
		let top_thickness = Math.PI / (2 * teeth_count) + (2 * profile_shift * Math.tan(pressure_angle)) / teeth_count + inv_alpha - inv_alpha_a;
		let umax = Math.sqrt( tip_radius ** 2 / base_radius / base_radius - 1),
		x1 = base_radius,
		y1 = 0,
		x2 = base_radius * ( cos( umax ) + umax * sin( umax ) ),
		y2 = base_radius * ( sin( umax ) - umax * cos( umax ) );
		// distance between beginning and end of the involute curve
		var d = Math.sqrt( ( x1 - x2 ) * ( x1 - x2 ) + ( y1 - y2 ) * ( y1 - y2 ) );
		var cosx = (base_radius ** 2 + tip_radius ** 2 - d ** 2) / 2 / base_radius / tip_radius;
		var base_tooth_angle = 2 * top_thickness + 2 * Math.acos(cosx) ;

		console.log(base_tooth_angle * 180 / Math.PI)

		let NoT = teeth_count;

		//

		//The pitch is the distance from tooth touch point to tooth touch point. 

		//let pitch_diameter = NoT/pitch;


		//console.log({pitch, module, pitch_diameter, pitch_diameter})

		let pressure_radius = pitch_diameter;
		const count = 50;
		const tooth_count = teeth_count;

		strokeCircle(0, 0, base_radius, ctx, "red")
		strokeCircle(0, 0, reference_radius, ctx, "blue")
		strokeCircle(0, 0, tip_radius, ctx, "green")
		//strokeCircle(0, 0, inner_diameter, ctx, "green")

		ctx.beginPath();


		//Scale out to beginning of curve
		ctx.moveTo(base_radius, 0)
		//determin intersection of involute using an apoximation method

		function approxIntersect(involute_radius, end_radius_squared, a = 0,  error = 0.01) {
			let involute_radius_squared = 0,
				i = 0,
				resolution = 100,
				direction = 0.05, 
				ratio = 0;

			while (Math.abs(involute_radius_squared - end_radius_squared) > 0.005 && (i) < 2) {

				if(
					(i < 0) ||
					(direction > 0 && (end_radius_squared - involute_radius_squared) < 0) || 
					(direction < 0 && (end_radius_squared - involute_radius_squared) > 0)
				){
					direction *= -0.5;
				}

				ratio = (i += direction) * Math.PI * 2;

				const invol = involute(a+ratio, involute_radius);

				involute_radius_squared = (invol.x ** 2) + (invol.y ** 2);
			}

			console.log({involute_radius_squared, end_radius_squared} , i)

			let result = involute(a+ratio, involute_radius, a);

			result.i = i;

			return result;
		}


		const intersect = approxIntersect(base_radius, (tip_radius) ** 2);
		
		console.log(intersect, )

		const pr = involute((intersect.i - 0.000001) * Math.PI * 2, base_radius, 0);
		const r = ((360 / NoT) * Math.PI / 180) * 0.5;

		const xt = intersect.x - pr.x;
		const yt = intersect.y - pr.y;
		const m = Math.sqrt(xt * xt + yt * yt);
		const xi = xt / m;
		const yi = yt / m;
		const s = intersect.y / yi;
		const xr = -(s * xi) + intersect.x;
		const yr = -(s * yi) + intersect.y;

		console.log({xr, yr}, {xi,yi})

		ctx.quadraticCurveTo(xr, 0, intersect.x, intersect.y)
		
		ctx.lineTo(intersect.x, intersect.y + 10, 2, 0, 6);

		ctx.fill();

		ctx.fillStyle = "red"

		for (let j = 0; j < NoT; j++) {

			for (let i = 0; i < count; i++) {
				const ratio = ((i / count) * Math.PI * 0.5);

				const invol = involute(ratio, base_radius, 0);

				ctx.fillRect(invol.x, invol.y, 1, 1);
			}

			var l = base_tooth_angle;


			for (let i = 0; i < count; i++) {
				const ratio = ((i / count) * Math.PI * 0.5);

				const invol2 = involute(l-ratio, base_radius, l);

				ctx.fillRect(invol2.x, invol2.y, 1, 1);
			}

			ctx.rotate(((360 / NoT) * Math.PI / 180));
		}
	}
	let t = 0;

	let x = 0;
	let y = 0;

	window.addEventListener("pointermove", e => {
		x = e.x - 400;
		y = e.y - 400;
	})

	setInterval(() => {
		canvas.width = 800;
		ctx.translate(400, 400)


		ctx.beginPath()
		ctx.moveTo(0, 400);
		ctx.lineTo(0, -400);
		ctx.stroke();

		ctx.beginPath()
		ctx.moveTo(400, 0);
		ctx.lineTo(-400, 0);
		ctx.stroke();

		ctx.save();
		ctx.rotate(t +=0.002 )
		drawGear(20);
		ctx.restore();

		ctx.save();
		ctx.translate(x, y)
		ctx.rotate(-t / (5 / 20))
		drawGear(5);
		ctx.restore();
	}, 16)
}


window.addEventListener("load", function() {
	GearHead(document.getElementById("gearhead"));
})