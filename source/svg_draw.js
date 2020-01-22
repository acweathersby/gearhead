const SVG_NS = "http://www.w3.org/2000/svg";

export class Path {
	constructor() {
		this.data = [];
		this.width = 0;
		this.height = 0;
	}

	toElement(document) {
		const svg = document.createElementNS(SVG_NS, "svg");
		svg.setAttribute("viewBox", `${this.width * -0.5} ${this.height * -0.5} ${this.width} ${this.height}`)
		svg.setAttribute("width", this.width);
		svg.setAttribute("height", this.height);
		const path = document.createElementNS(SVG_NS, "path")
		path.setAttribute("d", this.data.join(" "));
		path.setAttribute("width", "100%");
		path.setAttribute("height", "100%");
		path.setAttribute("fill", "none");
		path.setAttribute("stroke", "black");
		svg.appendChild(path);
		return svg;
	}
}

function r(x){
	return Math.round(x * 1000) / 1000
}

export function moveTo(path, x, y, ABSOLUTE = true) {
	path.data.push(`${ABSOLUTE ? "M" : "m"}${r(x)},${r(y)}`);
}

export function lineTo(path, x, y, ABSOLUTE = true) {
	path.data.push(`${ABSOLUTE ? "L" : "l"}${r(x)},${r(y)}`);
}

export function bezierCurveTo(path, cpx1, cpy1, cpx2, cpy2, x, y, ABSOLUTE = true) {
	path.data.push(`${ABSOLUTE ? "C" : "c"}${r(cpx1)},${r(cpy1)} ${r(cpx2)},${r(cpy2)} ${r(x)},${r(y)}`);
}

export function quadraticCurveTo(path, cpx, cpy, x, y, ABSOLUTE = true) {
	path.data.push(`${ABSOLUTE ? "Q" : "Q"}${r(cpx)},${r(cpy)} ${r(x)},${r(y)}`);
}