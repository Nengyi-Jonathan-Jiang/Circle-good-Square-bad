const {sin, cos, sqrt, floor, min, max} = Math;

let container = document.getElementById("container")
let c = new Canvas(0,0,container);
c.ctx.lineCap = "square";
c.setFont("monospace");

window.onresize = (f=>(f(),f))(_=>c.resize());

var p = {
    x:1,y:0.5,speed:0.5,angle: Math.random() * 10,
    r:.025,
    w:.003125,
    minSpeed: 0.05,
    maxSpeed: 1
};

var lastPositions = [];

/**
 * @typedef {{
 *     x:number, y:number, t:number,
 *     vx: number, vy: number,
 * }} obj
 */

/**@type {obj[]}*/
var squares = [];
/**@type {obj[]}*/
var circles = [];


function coord(x, y){
    return c.width > c.height ? scale(x, y) : scale(1 - y, x);
}
function scale(...a){return a.map(i=>i* Math.min(c.width,c.height))}

{   //Controls
    let oldX, oldY;
    function mouseDownHandler(newX, newY){oldX = newX, oldY = newY}
    function mouseUpHandler(newX, newY){
        if(oldX == undefined) return;
        let angle = - Math.atan2(newY - oldY, newX - oldX) / Math.PI / 2;

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

function mag(x,y){return Math.sqrt(x * x + y * y)}

function update(elapsedTime){
    if(Math.random() < .5 * -elapsedTime){
        squares.push({x:Math.random() * 2,y:Math.random(),t:0,vx:0,vy:0});
    }
    if(Math.random() < .2 * -elapsedTime){
        circles.push({x:Math.random() * 2,y:Math.random(),t:0,vx:0,vy:0});
    }

    for(let s of squares){
        s.t -= elapsedTime;
        s.vx += (Math.random() - .5) * .01 * elapsedTime;
        s.vy += (Math.random() - .5) * .01 * elapsedTime;
        s.x += s.vx;
        s.y += s.vy;

        if(s.x + p.r > 2) s.x = 2 - p.r, s.vx *= -1;
        if(s.x < p.r)     s.x = p.r,     s.vx *= -1
        if(s.y + p.r > 1) s.y = 1 - p.r, s.vy *= -1;
        if(s.y < p.r)     s.y = p.r,     s.vy *= -1;

        let s2 = mag(s.vx, s.vy);
        const maxSpeed = .002;

        if(s2 > maxSpeed) s.vx *= maxSpeed / s2, s.vy *= maxSpeed / s2;

        if(mag(s.x - p.x, s.y - p.y) < 2 * p.r){
            s.t = Number.POSITIVE_INFINITY;
            p.speed *= 0.8;
        }
    }
    for(let c of circles){
        c.t -= elapsedTime;
        c.vx += (Math.random() - .5) * .01 * elapsedTime;
        c.vy += (Math.random() - .5) * .01 * elapsedTime;
        c.x += c.vx;
        c.y += c.vy;

        if(c.x + p.r > 2) c.x = 2 - p.r, c.vx *= -1;
        if(c.x < p.r)     c.x = p.r,     c.vx *= -1
        if(c.y + p.r > 1) c.y = 1 - p.r, c.vy *= -1;
        if(c.y < p.r)     c.y = p.r,     c.vy *= -1;

        let s2 = mag(c.vx, c.vy);
        const maxSpeed = .002;

        if(s2 > maxSpeed) c.vx *= maxSpeed / s2, c.vy *= maxSpeed / s2;

        if(mag(c.x - p.x, c.y - p.y) < 2 * p.r){
            c.t = Number.POSITIVE_INFINITY;
            p.speed *= 1.5;
        }
    }

    circles = circles.filter((c)=>c.t<=8);
    squares = squares.filter((s)=>s.t<=15);


    p.speed *= Math.pow(1.01, elapsedTime);
    if(p.speed < p.minSpeed) return true;
    if(p.speed > p.maxSpeed) p.speed = p.maxSpeed;

    p.x += p.speed * sin(p.angle * 2 * Math.PI) * elapsedTime;
    p.y += p.speed * cos(p.angle * 2 * Math.PI) * elapsedTime;

    if(p.x + p.r > 2) p.x = 2 - p.r, p.angle = - p.angle;
    if(p.x < p.r)     p.x = p.r,     p.angle = - p.angle;
    if(p.y + p.r > 1) p.y = 1 - p.r, p.angle = .5 - p.angle;
    if(p.y < p.r)     p.y = p.r,     p.angle = .5 - p.angle;
    
    lastPositions.push([p.x,p.y]);
    while(lastPositions.length > Math.min(100, p.speed / p.w)) lastPositions.shift();
}

const square = (a)=>[[sin(a),cos(a)],[cos(a),-sin(a)],[-sin(a),-cos(a)],[-cos(a),sin(a)]];

function draw(){
    c.clear("#014");
    c.setStrokeWidth(scale(p.w));

    c.setDrawColor("#F07");
    c.ctx.lineCap = "square";
    for(let square of squares){
        c.polygon(coord(square.x, square.y),[
            [ sin(square.t), cos(square.t)],
            [ cos(square.t),-sin(square.t)],
            [-sin(square.t),-cos(square.t)],
            [-cos(square.t), sin(square.t)],
        ].map(i=>coord(...i.map(j=>j*p.r))))
    }
    c.setDrawColor("#F078");
    for(let square of squares){
        c.polygon(coord(square.x, square.y),[
            [ sin(square.t), cos(square.t)],
            [ cos(square.t),-sin(square.t)],
            [-sin(square.t),-cos(square.t)],
            [-cos(square.t), sin(square.t)],
        ].map(i=>coord(...i.map(j=>j*(p.r + 1 * p.w)))))
    }
    c.setDrawColor("#F074");
    for(let square of squares){
        c.polygon(coord(square.x, square.y),[
            [ sin(square.t), cos(square.t)],
            [ cos(square.t),-sin(square.t)],
            [-sin(square.t),-cos(square.t)],
            [-cos(square.t), sin(square.t)],
        ].map(i=>coord(...i.map(j=>j*(p.r + 2 * p.w)))))
    }

    c.setDrawColor("#0FA");
    for(let circle of circles){
        c.circle(...coord(circle.x,circle.y),...scale(p.r));
    }
    c.setDrawColor("#0FA8");
    for(let circle of circles){
        c.circle(...coord(circle.x,circle.y),...scale(p.r + p.w));
    }
    c.setDrawColor("#0FA4");
    for(let circle of circles){
        c.circle(...coord(circle.x,circle.y),...scale(p.r + 2 * p.w));
    }

    c.setDrawColor("#FD0");
    c.circle(...coord(p.x, p.y), ...scale(p.r));
    c.setDrawColor("#FD08");
    c.circle(...coord(p.x, p.y), ...scale(p.r + p.w * 1));
    c.setDrawColor("#FD04");
    c.circle(...coord(p.x, p.y), ...scale(p.r + p.w * 2));
    c.setDrawColor("#FD02");
    c.circle(...coord(p.x, p.y), ...scale(p.r + p.w * 3));
    c.setDrawColor("#FD01");
    c.circle(...coord(p.x, p.y), ...scale(p.r + p.w * 4));

    c.setDrawColor("#FD01");
    for(let [x,y] of lastPositions) c.circle(...coord(x, y), ...scale(p.r));

    c.setDrawColor("#FFF");
    c.fillText("SPEED: " + Math.floor(p.speed * 500) / 500, c.width / 2, ...scale(.05), ...scale(.05));
}

Canvas.createAnimation((_,elapsedTime)=>{
    if(update(elapsedTime)) return true;
    draw();
}).then(_=>{
    alert("You Lose!");
    c.setDrawColor("#000");
    Canvas.createAnimation(_=>{
        draw();
    })
});