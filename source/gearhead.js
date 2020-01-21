/* 

References
	http://www.gearseds.com/files/Approx_method_draw_involute_tooth_rev2.pdf
	http://www.otvinta.com/gear.html
*/

import Gear from "./gear.js";
import GeartrainFactory from "./geartrain.js";

const cos = Math.cos,
	sin = Math.sin;

function strokeCircle(x, y, r, ctx, style = "black") {
	//draw minor circle
	ctx.beginPath();
	ctx.strokeStyle = style;
	ctx.arc(x, y, r, 0, Math.PI * 2);
	ctx.stroke();
}

function GearHead(canvas) {

	const ctx = canvas.getContext("2d");

	let t = 0;
	let x = 0;
	let y = 0;

	window.addEventListener("pointermove", e => {
		x = e.x;
		y = e.y;
	})

	const gear1 = new Gear, gear2 = new Gear;

	gear1.number_of_teeth = 12;
	gear2.number_of_teeth = 20;

	const train = GeartrainFactory(gear1, gear2)

	train.mountToDOM(document.body);

	setInterval(()=>{
		console.log(train.selectGear(x,y));
	}, 60)
}


window.addEventListener("load", function() {
	GearHead(document.getElementById("gearhead"));
})