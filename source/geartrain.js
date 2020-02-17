import Gear from "./gear.js";
import * as v from "./vec2.js";
const cos = Math.cos,
    sin = Math.sin;
/* Handles gear animation, hiearchary, and interaction */
export default function(...gears) {
 
    const
        gear_list = gears.reduce((r, g) => g instanceof Gear ? (g.c = [], g.angle = 0, g.pos = new v.vec2(0, 0), r.push(g), r) : r, []);

    return {
        /* 
            Goes through each gear and updates their attributes. 
        */
        update() {


            this.checkGearConnections();

            for (const g of gear_list) {

                const angle = g.angle;


                if (g.c)
                    for (const child of g.c) {
                        this.updateConnectGearOffset(g, child)
                        child.angle = -g.angle * child.ratio + child.offset;
                    }

                const r = g.tip_radius;
                const x = g.pos.x - r;
                const y = g.pos.y - r;

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

            for (const g of gear_list) {
                const ele = g.bindSVGElement(document);
                const w = g.tip_radius
                ele.style.position = "absolute";
                ele.style.transformOrigin = "center";
                ele.style.transform = `matrix(${[1,0,0,1, -w,-w].join(',')})`
                element_mount_point.appendChild(ele)
            }
        },

        /* Returns a gear found at coordinates x y*/
        selectGear(p, y = 0) {
            var point = new v.vec2(Number(p), Number(-y));

            if (p instanceof v.vec2)
                point = p;

            for (const c of gear_list) {
                const gear = c,
                    gpos = c.pos;

                if (v.length(v.sub(gpos, point)) <= gear.tip_radius) {
                    return c;
                }
            }

            return null;
        },
        updateConnectGearOffset(parent, child) {
            const
                angle_vec = v.sub(parent.pos, child.pos),
                gear_distance = v.length(angle_vec),
                norm_vec = v.scale(angle_vec, 1 / gear_distance),
                dot = v.dot(norm_vec, new v.vec2(1, 0)),
                acos = (Math.acos(dot)) * -Math.sign(norm_vec.y);

            child.ratio = child.pitch / parent.pitch;
            child.offset = -acos * child.ratio - acos + child.pitch / 2;
        },
        /* Connects the gear to another gear, accounting positional and angular offsets */
        connectGears(parent, child) {

            if (child.parent == parent) return;
            if (
                this.canConnect(parent, child)
            ) {

                parent.c.push(child);
                child.parent = parent;
                this.updateConnectGearOffset(parent, child)

            }
        },

        disconnectGears(parent, child) {

            if (child.parent !== parent)
                return;

            child.parent = null;

            for (let i = 0; i < parent.c.length; i++) {
                if (parent.c[i] == child) {
                    parent.c.splice(i, 1);
                    break;
                }
            }
        },

        canConnect(parent, child) {
            const
                angle_vec = v.sub(child.pos, parent.pos),
                gear_distance = v.length(angle_vec),
                reference_distance = parent.reference_radius + child.reference_radius,
                tip_distance = parent.tip_radius + child.tip_radius;

            return (gear_distance < tip_distance &&
                gear_distance > reference_distance &&
                parent.module == child.module)
        },

        checkGearConnections() {
            //go through all gears and make sure their connections are still valid
            for (const gear of gear_list) {
                for (const child of gear.c) {
                    if (!this.canConnect(gear, child))
                        this.disconnectGears(gear, child);
                }
            }
        },

        connectToNearest() {

        }
    }
}
