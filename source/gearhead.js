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
