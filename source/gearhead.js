/* 

References
	http://www.gearseds.com/files/Approx_method_draw_involute_tooth_rev2.pdf
	http://www.otvinta.com/gear.html
*/

const cos = Math.cos,
	sin = Math.sin;

function involute(t, r, a = 0) {
	return {
		x: r * (cos(t) + (t - a) * sin(t)),
		y: r * (sin(t) - (t - a) * cos(t))
	}
}

function rotate(vec, angle){
	return {
		x: vec.x * cos(angle) - vec.y * sin(angle),
		y: vec.x * sin(angle)  + vec.y * cos(angle)
	}
}

function flipY(vec){
	return {x:vec.x, y: -vec.y}
}

function scale(vec, scalar){
	return {x:vec.x * scalar, y:vec.y * scalar}
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
		let module = 20;
		let pressure_angle = 20 * Math.PI / 180;
		let profile_shift = 0;
		let reference_diameter = module * teeth_count;
		let base_diameter = reference_diameter * cos(pressure_angle)
		let tip_diameter = reference_diameter + 2 * module  * (1 + profile_shift)
		let root_diameter = reference_diameter - (tip_diameter - reference_diameter) * (1.05 + profile_shift)
		let tip_radius = tip_diameter / 2;
		let base_radius = base_diameter / 2;
		let root_radius = root_diameter / 2;
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
		var base_tooth_angle = 2 * top_thickness + 2 * Math.acos(cosx);
		var pitch = (Math.PI * 2) / teeth_count;

		//The pitch is the distance from tooth touch point to tooth touch point. 
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

			let result = involute(a+ratio, involute_radius, a);

			result.i = i;

			return result;
		}

		const intersect = approxIntersect(base_radius, (tip_radius) ** 2);
		const pr = involute((intersect.i - 0.000001) * Math.PI * 2, base_radius, 0);
		const xt = intersect.x - pr.x;
		const yt = intersect.y - pr.y;
		const m = Math.sqrt(xt * xt + yt * yt);
		const xi = xt / m;
		const yi = yt / m;
		const s = intersect.y / yi;
		const xr = -(s * xi) + intersect.x;
		const tip = intersect;
		const base = {x:base_radius, y:0};
		const ctrl = {x:xr, y:0};

		//ctx.moveTo(base.x, base.y);
		//ctx.quadraticCurveTo(xr, 0, intersect.x, intersect.y)

		function drawGearTooth(b, c, t, tooth, pitch,  base_tooth_angle, base_to_root_ratio){
			const base_angle = pitch * tooth;
			const tip = rotate(t, base_angle);
			const base = rotate(b, base_angle);
			const ctrl = rotate(c, base_angle);
			const tipM = rotate(flipY(t), base_angle + base_tooth_angle);
			const baseM = rotate(flipY(b), base_angle + base_tooth_angle);
			const ctrlM = rotate(flipY(c), base_angle + base_tooth_angle);

			const baseNext = rotate(b, base_angle + pitch);
			//const baseInsetCTRL1 = scale(rotate(b, base_angle + pitch - (pitch - base_tooth_angle) * 0.5), base_to_root_ratio*0.8);
			//const baseInsetCTRL2 = scale(rotate(b, base_angle + pitch - (pitch - base_tooth_angle) * 0.5), base_to_root_ratio*0.8);
			const baseInsetCTRL1 = scale(baseM, base_to_root_ratio*0.9);
			const baseInsetCTRL2 = scale(baseNext, base_to_root_ratio*0.9);
			
			ctx.quadraticCurveTo(ctrl.x, ctrl.y, tip.x, tip.y)
			ctx.lineTo(tipM.x, tipM.y);
			ctx.quadraticCurveTo(ctrlM.x, ctrlM.y, baseM.x, baseM.y)
			//Todo - Create A better bottom land, based on root circle 
			ctx.bezierCurveTo(baseInsetCTRL1.x, baseInsetCTRL1.y, baseInsetCTRL2.x, baseInsetCTRL2.y, baseNext.x, baseNext.y);
		}

		for(let i = 0; i < teeth_count; i++){
			drawGearTooth(base, ctrl, tip, i, pitch, base_tooth_angle, root_diameter / base_diameter);
			//break;
		}

		ctx.fill();

		ctx.fillStyle = "red"
		/*

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
		}*/

		strokeCircle(0, 0, base_radius, ctx, "red")
		strokeCircle(0, 0, reference_radius, ctx, "blue")
		strokeCircle(0, 0, tip_radius, ctx, "green")
		strokeCircle(0, 0, root_radius, ctx, "orange")
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
		drawGear(12);
		ctx.restore();

		ctx.save();
		ctx.translate(x, y)
		ctx.rotate(-t / (15 / 12))
		drawGear(15);
		ctx.restore();
	}, 16)
}


window.addEventListener("load", function() {
	GearHead(document.getElementById("gearhead"));
})