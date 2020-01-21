import Gear from "./gear.js";
import * as v from "./vec2.js";

/* Handles gear animation, hiearchary, and interaction */
export default function(...gears) {


	const
		gear_list = gears.reduce((r, g) => g instanceof Gear ? (r.push({ gear:g, pos: new v.vec2(0,0) }), r) : r, []);

	return {
		/* 
			Goes through each gear and updates their attributes. 
		*/
		update() {

		},

		get gear() { return gear_list },

		mountToDOM(element_mount_point) {

			if (
				element_mount_point == document ||
				element_mount_point == window ||
				!(element_mount_point instanceof Element)
			)
				return;

			for (const g of gear_list){
				const ele = g.gear.bindSVGElement(document);
				ele.style.position ="absolute";
				element_mount_point.appendChild(ele)
			}
		},

		/* Returns a gear found at coordinates x y*/
		selectGear(p, y = 0){
			var point = new v.vec2(Number(p), Number(y));
			
			if(p instanceof v.vec2)
				point = p;

			for(const c of gear_list){
				const gear = c.gear, gpos = c.pos;

				console.log(point, gpos, gear.tip_radius)
				
				if( v.lengthSqrd(v.sub(gpos, point)) <= gear.tip_radius ** 2 ){
					return c;
				}
			}

			return null;
		}
	}
}