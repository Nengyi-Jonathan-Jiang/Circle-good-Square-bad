const {sin, cos, pow, atan2, sqrt, floor, min, max, random, PI} = Math;

let c = new Canvas(0,0,container);
c.ctx.lineCap = "square";
c.setFont("monospace");

window.onresize = (f=>(f(),f))(_=>c.resize());

const R = .025,
      W = .003125,
      PLAYER_MIN_SPEED = 0.05,
      PLAYER_MAX_SPEED = 2;

class NPO{
    /** @param {(r:number)=>any} drawFunc @param {number} boost @param {number} maxT @param {number} maxSpeed @param {number} jitter */
    constructor(drawFunc, boost, maxT, maxSpeed = .1, jitter = .01){
        this.drawFunc = drawFunc;
        this.boost = boost;
        this.maxT = maxT;
        this.maxSpeed = maxSpeed;
        this.jitter = jitter;

        this.t = 0;
        this.x = random() * 2;
        this.y = random();
        
        let angle = random() * 2 * PI, speed = random() * maxSpeed;
        this.vx = speed * sin(angle);
        this.vy = speed * cos(angle);
    }
    /** @param {number} elapsedTime */
    update(elapsedTime){
        this.t += elapsedTime;

        this.vx += (random() - .5) * this.jitter * elapsedTime;
        this.vy += (random() - .5) * this.jitter * elapsedTime;
        this.x += this.vx;
        this.y += this.vy;

        if(this.x + R > 2) this.x = 2 - R, this.vx *= -1;
        if(this.x < R)     this.x = R,     this.vx *= -1
        if(this.y + R > 1) this.y = 1 - R, this.vy *= -1;
        if(this.y < R)     this.y = R,     this.vy *= -1;

        let speed = sqrt(this.vx * this.vx + this.vy * this.vy);
        if(speed > this.maxSpeed) this.vx *= this.maxSpeed / speed, this.vy *= this.maxSpeed / speed;
    }
    draw(r){this.drawFunc.call(this,r)}
    collide(x,y){
        if(Math.sqrt((this.x - x) * (this.x - x) + (this.y - y) * (this.y - y)) <= 2 * R)
            return this.t = Number.POSITIVE_INFINITY, true;
    }
    filter(){return this.t < this.maxT}

    static drawSquareFunc(r){
        c.polygon(coord(this.x, this.y),[
            [ sin(this.t), cos(this.t)],
            [ cos(this.t),-sin(this.t)],
            [-sin(this.t),-cos(this.t)],
            [-cos(this.t), sin(this.t)],
        ].map(i=>coord(...i.map(j=>j*r))))
    }
    static drawCircleFunc(r){
        c.circle(...coord(this.x,this.y),...scale(r));
    }

    static makeSquare(){return new NPO(NPO.drawSquareFunc, 0.8, 16, .002, .0001)}
    static makeCircle(){return new NPO(NPO.drawCircleFunc, 1.5,  8, .002, .0001)}
}


class PO{
    constructor(){
        this.x = 1; this.y = .5;
        this.speed = 0.5;
        this.angle = random() * 2 * PI;

        /**@type {[number,number]}*/
        this.lastPositions = [];
        /**@type {[number,number,number][]}*/
        this.turns = [];
    }
    turn(angle){
        this.angle = angle;
        this.turns.push([this.x, this.y, 0]);
    }
    update(elapsedTime){
        this.speed *= pow(1.01, elapsedTime);

        if(this.speed < PLAYER_MIN_SPEED) return true;
        if(this.speed > PLAYER_MAX_SPEED) this.speed = PLAYER_MAX_SPEED;

        this.x += this.speed * sin(this.angle * 2 * PI) * elapsedTime;
        this.y += this.speed * cos(this.angle * 2 * PI) * elapsedTime;

        if(this.x + R > 2) this.turn(0.0 - this.angle), this.x = 2 - R;
        if(this.x < R)     this.turn(0.0 - this.angle), this.x = R;
        if(this.y + R > 1) this.turn(0.5 - this.angle), this.y = 1 - R;
        if(this.y < R)     this.turn(0.5 - this.angle), this.y = R;
        
        this.lastPositions.push([this.x,this.y]);
        while(this.lastPositions.length > 100) this.lastPositions.shift();
        this.turns = this.turns.filter(i=> ++i[2] <= 100);
    }
    draw(){
        for(let i = 0; i < 5; i++){
            c.setDrawColor("#FD0" + "F8421".charAt(i));
            c.circle(...coord(this.x, this.y), scale(R + W * i)[0]);
        }
    
        c.setDrawColor("#FD01");
        for(let [x,y] of this.lastPositions) c.circle(...coord(x, y), ...scale(R));
    }
}

var p = new PO();

/**@type {NPO[]}*/
var squares = [];
/**@type {NPO[]}*/
var circles = [];


function coord(x, y){
    return c.width > c.height ? scale(x, y) : scale(1 - y, x);
}
function scale(...a){return a.map(i=>i* min(c.width,c.height))}

{   //Controls
    let oldX, oldY;
    function mouseDownHandler(newX, newY){oldX = newX, oldY = newY}
    function mouseUpHandler(newX, newY){
        if(oldX == undefined) return;
        let angle = - atan2(newY - oldY, newX - oldX) / PI / 2;

        function correctAngle(angle){
            return c.width > c.height ? angle - .25 : angle;
        }
        p.angle = correctAngle(angle);
        oldX = oldY = undefined;
    }
    c.canvas.addEventListener("mousedown",e=>{
        if(e.buttons & 1) mouseDownHandler(e.clientX,e.clientY);
    });
    c.canvas.addEventListener("mouseup",e=>{
        mouseUpHandler(e.clientX,e.clientY);
    });
    c.canvas.addEventListener("touchstart",e=>{
        mouseDownHandler(e.touches[0].clientX,e.touches[0].clientY);
    });
    c.canvas.addEventListener("touchend",e=>{
        mouseUpHandler(e.changedTouches[0].clientX,e.changedTouches[0].clientY);
    });
    c.canvas.addEventListener("contextmenu",e=>e.preventDefault());
    c.canvas.addEventListener("scroll",e=>{e.preventDefault()});
}

var lastFrameTime = -1;

window.onkeypress=_=>{console.log(lastPositions.length)}

function update(elapsedTime){
    if(random() < .5 * -elapsedTime) squares.push(NPO.makeSquare());
    if(random() < .2 * -elapsedTime) circles.push(NPO.makeCircle());

    for(let o of [...squares,...circles]){
        o.update(elapsedTime);
        if(o.collide(p.x,p.y)) p.speed *= o.boost;
    }

    circles = circles.filter(o=>o.filter());
    squares = squares.filter(o=>o.filter());

    p.update(elapsedTime);
}

function draw(){
    c.clear("#014");
    c.setStrokeWidth(scale(W));

    c.ctx.lineCap = "square";
    for(let i = 0; i < 3; i++){
        c.setDrawColor("#F07" + "F84".charAt(i)); for(let o of squares) o.draw(R + i * W);
        c.setDrawColor("#0FA" + "F84".charAt(i)); for(let o of circles) o.draw(R + i * W);
    }

    p.draw();

    c.setDrawColor("#FFF");
    c.fillText("SPEED: " + floor(p.speed * 500) / 500, c.width / 2, ...scale(.05), ...scale(.05));
}

function gameAnimationFrame(_,elapsedTime){
    if(update(elapsedTime)) return true;
    draw();
}

Canvas.createAnimation(gameAnimationFrame).then(_=>{
    alert("You Lose!");
    c.setDrawColor("#000");
    Canvas.createAnimation(_=>{
        draw();
        c.clear("#F006");
    }).then(gameAnimationFrame);
});