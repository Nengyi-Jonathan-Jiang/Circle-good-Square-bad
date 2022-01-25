const {sin, cos, pow, atan2, sqrt, floor, ceil, min, max, random, PI} = Math; const TAU = PI * 2;

/** @abstract */
class NPOBaseClass{
	/**
	 * @param {(self:NPOBaseClass,elapsedTime:number,player:PO)=>void} spawnFunc
	 * @param {(self:NPOBaseClass,elapsedTime:number,player:PO)=>void} updateFunc
	 * @param {(self:NPOBaseClass,elapsedTime:number)=>void} drawFunc
	 * @param {(self:NPOBaseClass,target: NPO|PO)=>void} onCollideFunc
	 * @param {number} radius
	 * @param {String} color
	 */
	constructor(spawnFunc, updateFunc, drawFunc, onCollideFunc, radius, color){
		this.spawnFunc = spawnFunc;
        this.updateFunc = updateFunc;
        this.drawFunc = drawFunc;
        this.onCollideFunc = onCollideFunc;
		this.radius = radius;
		this.color = color;
		/** @type {NPO[]} */
		this.list = [];
	}

	spawn(elapsedTime, player){
		this.spawnFunc(this,elapsedTime,player);
	}
    update(elapsedTime, player){
        
    }

	static basicSpawn(spawnChance,min,cap){
		return function(elapsedTime, player){
			let shouldSpawn = this.list.length < min && random() < elapsedTime
				|| this.list.length < cap && random() < spawnChance * elapsedTime;
			if(shouldSpawn){
				while(true){
					t.list.unshift(t.create());
					if(t.list[0].hardCollide(
						player.x, player.y,
					1.5 * R + 25 * t.list[0].maxSpeed * R)) t.list.shift();
					else break;
				}
			}
		}
	}
}

class NPO{
    /** @param {(r:number)=>any} drawFunc @param {number} boost @param {number} maxT @param {number} maxSpeed @param {number} jitter */
    constructor(drawFunc, boost, maxT, maxSpeed = .1, jitter = .01, homing = false, x,y){
        this.drawFunc = drawFunc;
        this.boost = boost;
        this.maxT = maxT;
        this.maxSpeed = maxSpeed;
        this.jitter = jitter;

        this.t = 0;
        this.x = x === undefined ? random() * 2 : x;
        this.y = y === undefined ? random() : y;
        
        let angle = random() * TAU, energy = random() * maxSpeed;
        this.vx = energy * sin(angle);
        this.vy = energy * cos(angle);

        this.flicker = false;
        this.homing = homing;
    }
    /** @param {number} elapsedTime */
    update(elapsedTime){
        this.t += elapsedTime;

        if(this.x + R > 2) this.x = 2 - R, this.vx *= -1;
        if(this.x < R)     this.x = R,     this.vx *= -1
        if(this.y + R > 1) this.y = 1 - R, this.vy *= -1;
        if(this.y < R)     this.y = R,     this.vy *= -1;

        if(this.homing){
            let dx = p.x - this.x, dy = p.y - this.y;
            let d = sqrt(dx * dx + dy * dy);
            let a = max(1 - d * 2, 0) * elapsedTime / 5;
            this.vx += dx * a;
            this.vy += dy * a;
        }
        else{
            this.vx += (random() - .5) * this.jitter * elapsedTime;
            this.vy += (random() - .5) * this.jitter * elapsedTime;
        }
        
        let speed = sqrt(this.vx * this.vx + this.vy * this.vy);

        if(speed > this.maxSpeed) this.vx *= this.maxSpeed / speed, this.vy *= this.maxSpeed / speed;

        this.x += this.vx;
        this.y += this.vy;

        this.flicker = (f=>f < this.t && f < this.maxT - this.t)(random());
    }
    draw(r){
        c.ctx.globalAlpha = min(this.t, 1, this.maxT - this.t);
        this.drawFunc.call(this,r);
        c.ctx.globalAlpha = 1;
    }
    collide(x,y){
        return this.flicker && this.hardCollide(x,y) && (this.t = Number.POSITIVE_INFINITY, true);
    }
    hardCollide(x,y,r = 2*R){
        return Math.sqrt((this.x - x) * (this.x - x) + (this.y - y) * (this.y - y)) <= r;
    }
    filter(){return this.t < this.maxT}

    static drawSquareFunc(r){
        c.drawPolygon(coord(this.x, this.y),[
            [ sin(this.t), cos(this.t)],
            [ cos(this.t),-sin(this.t)],
            [-sin(this.t),-cos(this.t)],
            [-cos(this.t), sin(this.t)],
        ].map(i=>scaleAndRot(...i.map(j=>j*r))))
    }
    static drawTriFunc(r){
        let a = atan2(this.vy,this.vx);
        c.drawPolygon(coord(this.x, this.y),[
            [sqrt(.5) * cos(a),  sqrt(.5) * sin(a) ],
            [-cos(a + TAU * 1/8),-sin(a + TAU * 1/8)],
            [-cos(a - TAU * 1/8),-sin(a - TAU * 1/8)],
        ].map(i=>scaleAndRot(...i.map(j=>j*r))))
    }
    static circleFunc(r){
        c.drawCircle(...coord(this.x,this.y),...scale(r));
    }
}


class PO{
    constructor(){
        this.x = this.y = this.energy = this.angle = this.lastPositions = this.turns = undefined;
        this.reset();
    }
    reset(){
        this.x = 1; this.y = .5;
        this.energy = 10;
        this.angle = random() * TAU;

        /**@type {[number,number][]}*/
        this.lastPositions = [];
        /**@type {[number,number,number][]}*/
        this.turns = [];
    }
    turn(angle){
        this.angle = angle;
        this.turns.push([this.x, this.y, 0]);
    }
    update(elapsedTime){
        this.energy -= .1 * elapsedTime;

        if(this.energy <= 0) return true;

        let ds = elapsedTime * PLAYER_MAX_SPEED * (1 - Math.pow(1.05 , -this.energy));

        let maxTailLength = min(128, 8 * sqrt(this.energy));

        for(;ds > 0; ds -= W){
            let _ds = min(ds,W);
            this.x -= _ds * sin(this.angle * TAU);
            this.y -= _ds * cos(this.angle * TAU);

            if(this.x + R > 2) this.turn(0.0 - this.angle), this.x = 2 - R;
            if(this.x < R)     this.turn(0.0 - this.angle), this.x = R;
            if(this.y + R > 1) this.turn(0.5 - this.angle), this.y = 1 - R;
            if(this.y < R)     this.turn(0.5 - this.angle), this.y = R;
            
            this.lastPositions.push([this.x,this.y]);
            while(this.lastPositions.length > maxTailLength) this.lastPositions.shift();
            this.turns = this.turns.filter(i => (++i[2]) <= maxTailLength);
        }
    }
    draw(){
        for(let i = 0; i < 8; i++){
            c.setDrawColor("#FD0" + "FC864321".charAt(i));
            c.drawCircle(...coord(this.x, this.y), scale(R + W * i)[0]);
        }
    
        c.setDrawColor("#FD01");
        if(this.lastPositions.length){
        let positions = [this.lastPositions[0],...this.turns,[this.x,this.y]];
            for(let i = 0; i + 1 < positions.length;){
                let [prev,next] = [positions[i],positions[++i]];
                let length = sqrt((prev[0] - next[0]) * (prev[0] - next[0]) + (prev[1] - next[1]) * (prev[1] - next[1]));
                let _length = 1 / length;
                for(let j = 0; j < length; j += W){
                    c.drawCircle(...coord(
                        prev[0] + (next[0] - prev[0]) * j * _length,
                        prev[1] + (next[1] - prev[1]) * j * _length,
                    ), scale(R)[0]);
                }
            }
        }
    }
}


/**@type {{canvas:HTMLCanvasElement}} */
let c = new Canvas(0,0,container);
c.ctx.lineCap = "square";
c.setFont("monospace");
c.setFont('Orbitron');
// c.canvas.addEventListener("contextmenu",e=>e.preventDefault());
window.onresize = (f=>(f(),f))(_=>{
    document.body.style.setProperty("--W",window.innerWidth);
    document.body.style.setProperty("--H",window.innerheight);
    c.resize();
});

c.canvas.addEventListener("dblclick",_=>{
	document.body.requestFullscreen();
})

const R = .025,
      W = .003125,
      PLAYER_MIN_SPEED = 0.05,
      PLAYER_MAX_SPEED = 2;

var p = new PO();

/**
 * @type {Map<string,{
 *     list: NPO[],
 *     create: (()=>NPO),
 *     color: String,
 *     initial_num: number,
 *     spawnChance: number,
 *     min: number,
 *     cap: number
 * }>}
 * */
var obstacles = new Map([
    ["squares",{
        list:[],
        create: (x,y)=>{return new NPO(NPO.drawSquareFunc, -2, 16, .002, .0001,false,x,y)},
        color:"#F3A",
        spawnChance: .6,
        min: 8,
        cap: 12
    }],
    ["squares2",{
        list:[],
        create: (x,y)=>{return new NPO(NPO.drawSquareFunc, -4, 10, .02, .1,false,x,y)},
        color:"#F0F",
        spawnChance: .1,
        min: 0,
        cap: 2,
    }],
    ["squares3",{
        list:[],
        create: (x,y)=>{return new NPO(NPO.drawTriFunc, -1,  8, .01,  .05, true,x,y)},
        color:"#F07",
        spawnChance: 1,
        min: 0,
        cap: 6,
    }],
    ["circles",{
        list:[],
        create: (x,y)=>{return new NPO(NPO.circleFunc,  1,  8, .002, .0001,false,x,y)},
        color:"#0FF",
        spawnChance: .3,
        min: 2,
        cap: 4,
    }],
    ["circles2",{
        list:[],
        create: (x,y)=>{return new NPO(NPO.circleFunc,  3,  5, .02, .1,false,x,y)},
        color:"#0F4",
        spawnChance: .1,
        min: 0,
        cap: 2,
    }],
])

var score = 0;

function coord(x, y){return c.width > c.height ? scale(x, y) : scale(1 - y, x)}
function scale(...a){return a.map(i=>i* min(c.width,c.height))}
function scaleAndRot(x,y){return c.width > c.height ? scale(x, y) : scale(-y, x)}

createDragDetector(c.canvas,(oldX,oldY,newX,newY)=>{
    p.turn(- atan2(newY - oldY, newX - oldX) / PI / 2 - (c.width > c.height) * .25);
})
var clicked = createClickDetector(c.canvas);

const minSpawnDistance = 0.5;

function update(elapsedTime){
    for(let t of obstacles.values()){
        let shouldSpawn = t.list.length < t.min && random() < elapsedTime
            || t.list.length < t.cap && random() < t.spawnChance * elapsedTime;
        if(shouldSpawn){
			let angle = 0;
			let spawnRange = -1;
			while(spawnRange < 0){

				angle = random() * TAU;

				let distanceToEdge = min(
					((p.x * cos(angle) <= 0 ? 0 : 2) - p.x) / cos(angle),
					((p.y * sin(angle) <= 0 ? 0 : 1) - p.y) / sin(angle),
				);
				spawnRange = distanceToEdge - minSpawnDistance;
			}

			let distance = random() * spawnRange + minSpawnDistance;

			function trunc(x){return ~~(x * 100) / 100}

			let pos = [p.x + cos(angle) * distance, p.y + sin(angle) * distance];

			t.list.unshift(t.create(...pos));
        }
    }

    for(let o of [].concat(...[...obstacles.values()].map(i=>i.list))){
        o.update(elapsedTime);
        if(o.collide(p.x,p.y)) p.energy += o.boost;
    }

    obstacles.forEach(t=>(t.list = t.list.filter(o=>o.filter())))

    if(p.update(elapsedTime)) return true;

    score += p.energy * elapsedTime * 0.1;
}

function draw(){
    c.clear("#014");
	
    c.setStrokeWidth(scale(W));

	c.ctx.lineCap = "square";

	for(let i = 0; i < 5; i++){
        let opacity = "F8421".charAt(i)

		c.setDrawColor("#FFF" + opacity);
		c.drawRect(...coord(W * (i + 0.5), W * (i + 0.5)), ...coord(2 - W * (i + 0.5), 1 - W * (i + 0.5)));
    }

    for(let i = 0; i < 3; i++){
        let opacity = "F84".charAt(i)
        for(let t of obstacles.values()){
            c.setDrawColor(t.color + opacity);
            for(let o of t.list) o.draw(R + i * W);
        }
    }

    p.draw();

    c.setDrawColor("#FFF");
    c.fillText("ENERGY: " + ceil(p.energy) + "  |  SCORE: " + ceil(score), c.width / 2, ...scale(.05 + 2 * W), ...scale(.05));
}


(f=>f())(function reset(){
    score = 0;
    p.reset();
	
    for(let t of obstacles.values()) t.list = [];

    Canvas.createAnimation((_,elapsedTime)=>{
        if(update(elapsedTime)) return true;
        draw();
    }).then(_=>{
    p.energy = 0;
    clicked.clicked();
    Canvas.createAnimation(currTime=>{
        draw();

		let redOpacity = sin(currTime * 4.0) + 1;
        c.clear("#FF0000" + "65"[~~redOpacity] + "FEDCBA9876543210"[~~((redOpacity % 1) * 16)]);
        c.setDrawColor("#FFF")
        c.fillText("GAME OVER",c.w/2,c.h/2 - c.w * .04,c.w/20);
        c.fillText("FINAL SCORE: " + ceil(score), c.w/2,c.h/2,c.w/30);
        c.fillText("CLICK ANYWHERE TO PLAY AGAIN", c.w/2,c.h/2 + c.w * .04,c.w/36);
        if(clicked.clicked()) return true;
    }).then(reset)});
})
