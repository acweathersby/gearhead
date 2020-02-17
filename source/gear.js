import * as svg from "./svg_draw.js";

import { involute, rotate, flipY, scale, vec2 } from "./vec2.js";
import * as v from "./vec2.js";

const cos = Math.cos,
	sin = Math.sin,
	tan = Math.tan,
	atan = Math.atan,
	PI = Math.PI,
	sqrt = Math.sqrt,
	acos = Math.acos;

/** Finds the intersection of an involute curve and a circle defined by its radius. */
function approxIntersect(involute_radius, end_radius_squared, a = 0, error = 0.01) {
	let involute_radius_squared = 0,
		i = 0,
		direction = 0.05,
		ratio = 0;

	while (Math.abs(involute_radius_squared - end_radius_squared) > 0.005 && (i) < 2) {

		if (
			(i < 0) ||
			(direction > 0 && (end_radius_squared - involute_radius_squared) < 0) ||
			(direction < 0 && (end_radius_squared - involute_radius_squared) > 0)
		) {
			direction *= -0.5;
		}

		ratio = (i += direction) * Math.PI * 2;

		const invol = involute(a + ratio, involute_radius);

		involute_radius_squared = (invol.x ** 2) + (invol.y ** 2);
	}

	let result = involute(a + ratio, involute_radius, a);

	result.i = i;

	return result;
}

function getToothData(gear) {
	const
		tr = gear.tip_radius,
		br = gear.base_radius,
		intersect = approxIntersect(br, (tr) ** 2),
		pr = involute((intersect.i - 0.000001) * Math.PI * 2, br, 0),
		xt = intersect.x - pr.x,
		yt = intersect.y - pr.y,
		m = sqrt(xt * xt + yt * yt),
		xi = xt / m,
		yi = yt / m,
		s = intersect.y / yi,
		xr = -(s * xi) + intersect.x;

		gear.tip_involute_intersect = intersect.i; 

	return { tip: intersect, base: new vec2(br, 0), ctrl: new vec2(xr, 0) };
}

function gearToothDrawData(b, c, t, tooth, pitch, base_tooth_angle, base_to_root_ratio, angle_offset = 0) {
	const base_angle = pitch * tooth + angle_offset;
	return {
		tip: rotate(t, base_angle),
		base: rotate(b, base_angle),
		ctrl: rotate(c, base_angle),
		tipM: rotate(flipY(t), base_angle + base_tooth_angle),
		baseM: rotate(flipY(b), base_angle + base_tooth_angle),
		ctrlM: rotate(flipY(c), base_angle + base_tooth_angle),
		baseNext: rotate(b, base_angle + pitch),
		rootInsetStart: rotate(scale(b, base_to_root_ratio* 0.97 ), base_angle + base_tooth_angle),
		rootInsetCTRL1: rotate(scale(b, base_to_root_ratio* 0.97), base_angle + base_tooth_angle),
		rootInsetCTRL2: rotate(scale(b, base_to_root_ratio* 0.97), base_angle + pitch),
		rootInsetEnd: rotate(scale(b, base_to_root_ratio * 0.97), base_angle + pitch)
	}
}

function drawGearToothCTX(ctx, ...d) {
	const {
		tip,
		base,
		ctrl,
		tipM,
		baseM,
		ctrlM,
		baseNext,
		rootInsetStart,
		rootInsetCTRL1,
		rootInsetCTRL2,
		rootInsetEnd
	} = gearToothDrawData(...d);

	ctx.quadraticCurveTo(ctrl.x, ctrl.y, tip.x, tip.y)
	ctx.lineTo(tipM.x, tipM.y);
	ctx.quadraticCurveTo(ctrlM.x, ctrlM.y, baseM.x, baseM.y)
	ctx.lineTo(rootInsetStart.x, rootInsetStart.y)
	ctx.bezierCurveTo(rootInsetCTRL1.x, rootInsetCTRL1.y, rootInsetCTRL2.x, rootInsetCTRL2.y, rootInsetEnd.x, rootInsetEnd.y);
	ctx.lineTo(baseNext.x, baseNext.y)
}

function drawGearToothSVG(path, ...d) {
	const {
		tip,
		base,
		ctrl,
		tipM,
		baseM,
		ctrlM,
		baseNext,
		rootInsetStart,
		rootInsetCTRL1,
		rootInsetCTRL2,
		rootInsetEnd
	} = gearToothDrawData(...d);

	svg.quadraticCurveTo(path, ctrl.x, ctrl.y, tip.x, tip.y)
	svg.lineTo(path, tipM.x, tipM.y);
	svg.quadraticCurveTo(path, ctrlM.x, ctrlM.y, baseM.x, baseM.y)
	svg.lineTo(path, rootInsetStart.x, rootInsetStart.y)
	svg.bezierCurveTo(path, rootInsetCTRL1.x, rootInsetCTRL1.y, rootInsetCTRL2.x, rootInsetCTRL2.y, rootInsetEnd.x, rootInsetEnd.y);
	svg.lineTo(path, baseNext.x, baseNext.y)
}


export default class Gear {
	constructor() {
		this.d = [];
		this.module = 10;
		this.pressure_angle_degrees = 20;
		this.profile_shift = 0;
		this.parent = null;
		this.rotation_direction = 0;
	}

	build() {

	}

	set module(m) {
		this.d[0] = m;
	}

	get module() {
		return this.d[0];
	}

	set pressure_angle_degrees(m) {
		this.d[1] = m * PI / 180;
	}

	get pressure_angle_degrees() {
		return this.d[1] * 180 / PI;
	}

	set pressure_angle(m) {
		this.d[1] = m;
	}

	get pressure_angle() {
		return this.d[1];
	}

	get angle_degrees() {
		return this.angle * 180 / PI;
	}

	set angle_degrees(m){
		this.angle = m * PI / 180;
	}

	get angle() {
		return this.d[4];
	}

	set angle(m){
		//Calculate the absolute slope of the direction delta
		this.rotation_direction

		this.d[4] = m;
	}

	set profile_shift(p) {
		this.d[2] = p;
	}

	get profile_shift() {
		return this.d[2];
	}

	set number_of_teeth(t) {
		this.d[3] = t;
	}

	get number_of_teeth() {
		return this.d[3];
	}

	get pitch() {
		return PI * 2 / this.number_of_teeth;
	}

	get patch() {
		return PI * 2 / this.number_of_teeth;
	}

	get reference_diameter() {
		return this.module * this.number_of_teeth;
	}

	get reference_radius() {
		return this.reference_diameter * 0.5;
	}

	get base_diameter() {
		return this.reference_diameter * cos(this.pressure_angle);
	}

	get base_radius() {
		return this.base_diameter * 0.5;
	}

	get tip_diameter() {
		return this.reference_diameter + 2 * this.module * (1 + this.profile_shift)
	}

	get tip_radius() {
		return this.tip_diameter * 0.5;
	}

	get root_diameter() {
		return this.reference_diameter - (this.tip_diameter - this.reference_diameter) * (1.05 + this.profile_shift)
	}

	get root_radius() {
		return this.root_diameter * 0.5;
	}

	get tip_pressure_angle() {
		return acos(this.base_diameter / this.tip_diameter);
	}

	get top_thickness() {
		const
			inv_alpha = tan(this.pressure_angle) - this.pressure_angle,
			inv_alpha_a = tan(this.tip_pressure_angle) - this.tip_pressure_angle;

		return PI / (2 * this.number_of_teeth) +
			(2 * this.profile_shift * tan(this.pressure_angle)) / this.number_of_teeth +
			inv_alpha - inv_alpha_a;
	}

	get base_tooth_angle() {
		// distance between beginning and end of the involute curve

		const br = this.base_radius,
			tr = this.tip_radius,
			umax = sqrt(tr ** 2 / br / br - 1),
			x1 = br,
			y1 = 0,
			x2 = br * (cos(umax) + umax * sin(umax)),
			y2 = br * (sin(umax) - umax * cos(umax)),
			d = sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2)),
			cosx = (br ** 2 + tr ** 2 - d ** 2) / 2 / br / tr;

		return 2 * this.top_thickness + 2 * acos(cosx);
	}

	drawOnCanvasContext(ctx) {

		ctx.save();
		//ctx.translate(-this.x, -this.y);
		ctx.beginPath();

		const
			invData = getToothData(this),
			bta = this.base_tooth_angle,
			rd = this.root_diameter,
			bd = this.base_diameter,
			p = this.pitch;

		for (let i = 0; i < this.number_of_teeth; i++)
			drawGearToothCTX(ctx, invData.base, invData.ctrl, invData.tip, i, p, bta, rd / bd);

		ctx.fill();
		ctx.restore();
	}

	bindSVGElement(document = window.document) {
		const path = new svg.Path;
		path.width = this.tip_diameter;
		path.height = this.tip_diameter;

		const
			invData = getToothData(this),
			bta = this.base_tooth_angle,
			rd = this.root_diameter,
			bd = this.base_diameter,
			p = this.pitch;

		svg.moveTo(path, this.base_radius, 0)

		for (let i = 0; i < this.number_of_teeth; i++)
			drawGearToothSVG(path, invData.base, invData.ctrl, invData.tip, i, p, bta, rd / bd, -this.base_tooth_angle/2);

		this.ele = path.toElement(document);

		return this.ele;
	}
}

window.Gear = Gear;