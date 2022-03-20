"use strict";

const t0 = Date.now();

function Cd(x, y) {
    this.x = x;
    this.y = y;
    this.equals = function (othercd) {
        return this.x === othercd.x && this.y === othercd.y;
    }
    this.add = function (othercd) {
        return new Cd(this.x + othercd.x, this.y + othercd.y);
    }
    this.scale = function (factor)  {
        return new Cd(this.x * factor, this.y * factor);
    }
}
const cd_n      = new Cd(0, -1);
const cd_e      = new Cd(1, 0);
const cd_s      = new Cd(0, 1);
const cd_w      = new Cd(-1, 0);
const cd_ne     = cd_n.add(cd_e);
const cd_se     = cd_s.add(cd_e);
const cd_sw     = cd_s.add(cd_w);
const cd_nw     = cd_n.add(cd_w);

const mazewidth = 40;
const mazeheight = 40;

function shufflearr(arr) {
    for (let rem = arr.length; rem > 0; rem--) {
        // get random index from remaining pool
        const r = Math.floor(Math.random() * rem);
        // swap random from pool with last in pool
        const temp = arr[rem - 1];
        arr[rem - 1] = arr[r];
        arr[r] = temp;
    }
}

function Nextdir() {
    const arr = [ cd_e, cd_s, cd_w, cd_n ];
    shufflearr(arr);
    this.get = function () { return arr.pop(); };
    this.isempty = function () { return arr.length === 0; };
}

function list_latest() {
    return this[this.length - 1]
}
function list_includes(x) {
    for (const el of this) {
        if (el.equals(x)) return true;
    }
    return false;
}

const activetiles = [];
activetiles.push(new Cd(
    Math.floor(Math.random() * mazewidth),
    Math.floor(Math.random() * mazeheight)
));
activetiles.latest = list_latest;
activetiles.includes = list_includes;

const visitedtiles = [activetiles[0]];
visitedtiles.latest = list_latest;
visitedtiles.includes = list_includes;

function Edge(a, b) {
    if      (a.x < b.x) { this.a = a; this.b = b; }
    else if (a.x > b.x) { this.a = b; this.b = a; }
    else if (a.y < b.y) { this.a = a; this.b = b; }
    else if (a.y > b.y) { this.a = b; this.b = a; }
    else                { this.a = a; this.b = b; }
    this.equals = function (otheredge) {
        return this.a.equals(otheredge.a) && this.b.equals(otheredge.b);
    };
}

const walls = [];
walls.removewall = function (tile, dir) {
    function tiletoedge(tile, dir) {
        if (dir.equals(cd_n)) {
            return new Edge(tile, tile.add(cd_e));
        }
        else if (dir.equals(cd_e)) {
            return new Edge(tile.add(cd_e), tile.add(cd_se));
        }
        else if (dir.equals(cd_s)) {
            return new Edge(tile.add(cd_se), tile.add(cd_s));
        }
        else if (dir.equals(cd_w)) {
            return new Edge(tile.add(cd_s), tile);
        }
        else {
            console.log('line 96');
        }
    }
    const removedwall = tiletoedge(tile, dir);
    const iremovedwall = this.findIndex((wall) => removedwall.equals(wall));
    this.splice(iremovedwall, 1);
}
for (let y = 0; y < mazeheight + 1; y++) {
    for (let x = 0; x < mazewidth; x++) {
        walls.push(new Edge(
            new Cd(x, y), new Cd(x + 1, y)
        ));
    }
}
for (let x = 0; x < mazewidth + 1; x++) {
    for (let y = 0; y < mazeheight; y++) {
        walls.push(new Edge(
            new Cd(x, y), new Cd(x, y + 1)
        ));
    }
}

const ctx = document.getElementById('canvas').getContext('2d');
const linewidth = 2;
const corigin = new Cd(linewidth / 2, linewidth / 2);
const cwidth = ctx.canvas.width - linewidth;
const cheight = ctx.canvas.height - linewidth;
const twidth = Math.floor(cwidth / mazewidth);
const theight = Math.floor(cheight / mazeheight);

function clearmaze() {
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, cwidth, cheight);
}

function drawmaze() {
    ctx.strokeStyle = 'black';
    ctx.lineWidth = linewidth;

    ctx.beginPath();
    for (const wall of walls) {
        ctx.moveTo(
            corigin.x + wall.a.x * twidth,
            corigin.y + wall.a.y * theight
        );
        ctx.lineTo(
            corigin.x + wall.b.x * twidth,
            corigin.y + wall.b.y * theight
        );
    }
    ctx.stroke();
}

function algostep() {
    const nextdircarousel = new Nextdir();
    // repeat until valid direction found
    while (true) {
        if (nextdircarousel.isempty()) {
            // backtrack
            activetiles.pop();
            break;
        }
        const nextdir = nextdircarousel.get();
        const nextpos = activetiles.latest().add(nextdir);
        const isnextposvalid =
            0 <= nextpos.x && nextpos.x < mazewidth &&
            0 <= nextpos.y && nextpos.y < mazeheight;
        if (!visitedtiles.includes(nextpos) && isnextposvalid) {
            // move to untouched tile
            walls.removewall(activetiles.latest(), nextdir);
            activetiles.push(nextpos);
            visitedtiles.push(nextpos);
            break;
        }
    }
}

// maze algorithm
while (activetiles.length !== 0) {
    algostep();
}

clearmaze();
ctx.strokeStyle = 'black';
ctx.lineWidth = linewidth;
ctx.lineCap = 'square';
for (let y = 0; y < mazeheight + 1; y++) {
    for (let x = 0; x < mazeheight + 1; x++) {
        const realx = corigin.x + x * twidth;
        const realy = corigin.y + y * theight;
        ctx.moveTo(realx, realy);
        ctx.lineTo(realx, realy);
    }
}
ctx.stroke();
ctx.lineCap = 'butt';
drawmaze();

const t1 = Date.now();
console.log(`maze generated in ${t1 - t0}ms`);