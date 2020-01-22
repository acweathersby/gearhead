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

function GearHead() {


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

	const train = GeartrainFactory(gear1,gear2)

	train.mountToDOM(document.body);

	gear1.pos.x = 150;
	gear1.pos.y = 140;

	gear2.pos.x = 160;
	gear2.pos.y = 300;


	train.connectGears(gear1, gear2);

	setInterval(()=>{

		gear1.angle_degrees += 0.5;

		train.update();
	}, 16)
}


window.addEventListener("load", function() {
	GearHead();
})