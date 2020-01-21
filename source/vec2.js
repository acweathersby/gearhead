const cos = Math.cos,
	sin = Math.sin;

export class vec2 extends Array {
	constructor(x = 0, y = 0) {
		super(x, y);
	}

	get x() {
		return this[0];
	}

	set x(x) {
		this.x = +x;
	}

	get y() {
		return this[1];
	}

	set y(y) {
		this.y = +y;
	}
}

export function involute(t, r, a = 0) {
	return new vec2(
		r * (cos(t) + (t - a) * sin(t)),
		r * (sin(t) - (t - a) * cos(t))
	)
}

export function rotate(vec, angle) {
	return new vec2(
		vec[0] * cos(angle) - vec[1] * sin(angle),
		vec[0] * sin(angle) + vec[1] * cos(angle)
	)
}

export function flipY(vec) {
	return new vec2( vec[0], -vec[1] );
}

export function scale(vec, scalar) {
	return new vec2( vec[0] * scalar, vec[1] * scalar );
}

export function sub(vecA, vecB){
	return new vec2(vecA[0] - vecB[0] , vecA[1] - vecB[1]);
}

export function add(vecA, vecB){
	return new vec2(vecA[0] + vecB[0] , vecA[1] + vecB[1]);
}

export function mul(vecA, vecB){
	return new vec2(vecA[0] * vecB[0] , vecA[1] * vecB[1]);
}

export function div(vecA, vecB){
	return new vec2(vecA[0] / vecB[0] , vecA[1] / vecB[1]);
}

export function dot(vecA, vecB){
	return vecA[0] * vecB[0] + vecA[1] * vecB[1];
}

export function lengthSqrd(vec){
	return dot(vec, vec);
}

export function length(vec){
	return Math.sqrt(lengthSqrd(vec));
}
