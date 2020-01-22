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

	const gear1 = new Gear, gear2 = new Gear, gear3 = new Gear, gear4 = new Gear;

	gear1.number_of_teeth = 12;
	gear2.number_of_teeth = 36;
	gear3.number_of_teeth = 30;
	gear4.number_of_teeth = 20;

	const train = GeartrainFactory(gear1,gear2, gear3, gear4)

	train.mountToDOM(document.body);

	gear1.pos.x = 600;
	gear1.pos.y = 406.08;

	//gear1.pos.x = 160;
	//gear1.pos.y = 130;

	gear1.pos.x = 244;
	gear1.pos.y = 344;

	gear2.pos.x = 244;
	gear2.pos.y = 585;

	gear3.pos.x = 460
	gear3.pos.y = 344

	gear4.pos.x = 711
	gear4.pos.y = 345


	train.connectGears(gear1, gear2);
	train.connectGears(gear1, gear3);
	train.connectGears(gear3, gear4);

	let i = 0;

	setInterval(()=>{

		gear1.angle_degrees = Math.cos(i += 1.0) * 200;

		train.update();
	}, 16.66666)
}


window.addEventListener("load", function() {
	GearHead();
})