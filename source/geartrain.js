import Gear from "./gear.js";
import * as v from "./vec2.js";
const cos = Math.cos,
	sin = Math.sin;
/* Handles gear animation, hiearchary, and interaction */
export default function(...gears) {


	const
		gear_list = gears.reduce((r, g) => g instanceof Gear ? (g.c = [], g.angle = 0, g.pos = new v.vec2(0,0), r.push(g), r) : r, []);

	return {
		/* 
			Goes through each gear and updates their attributes. 
		*/
		update() {


			for (const g of gear_list){

				const angle = g.angle;

				if(g.c){
					for(const child of g.c){
						child.angle = -g.angle * child.ratio + child.angle_offset;
					}
				}
				const r = g.tip_radius;
				const x = g.pos.x-r;
				const y = g.pos.y-r;

				g.ele.style.transform = `matrix(${[cos(angle),sin(angle),sin(angle),-cos(angle), x,y].join(',')})`
			}
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
				const ele = g.bindSVGElement(document);
				const w = g.tip_radius
				ele.style.position ="absolute";
				ele.style.transformOrigin = "center";
				ele.style.transform = `matrix(${[1,0,0,1, -w,-w].join(',')})`
				element_mount_point.appendChild(ele)
			}
		},

		/* Returns a gear found at coordinates x y*/
		selectGear(p, y = 0){
			var point = new v.vec2(Number(p), Number(-y));
			
			if(p instanceof v.vec2)
				point = p;

			for(const c of gear_list){
				const gear = c, gpos = c.pos;
				
				if( v.length(v.sub(gpos, point)) <= gear.tip_radius ){
					return c;
				}
			}

			return null;
		},
		/* Connects the gear to another gear, accounting positional and angular offsets */
		connectGears(parent, child){
			const angle_vec = v.sub(parent.pos, child.pos)
			const gear_distance = v.length(angle_vec);
			const norm_vec = v.scale(angle_vec, 1/gear_distance)

			if(
				gear_distance < parent.tip_radius + child.tip_radius &&
				gear_distance > parent.root_radius + child.root_radius &&
				parent.module == child.module
			){
				const ratio = parent.number_of_teeth / child.number_of_teeth;

				//calculate the angle offset necessary for correct meshing
				const dot = v.dot(norm_vec, new v.vec2(1,0));

				const angle = Math.asin(dot);

				console.log(Math.asin(dot), 106 * Math.PI / 180 , norm_vec)


				child.ratio = ratio;

			

				child.angle_offset = parent.pitch - child.base_tooth_angle ///+ angle * 2;

				//const rotational_offset = 
				parent.c.push(child);

			} 
		}
	}
}