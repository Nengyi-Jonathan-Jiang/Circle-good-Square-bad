const {sin, cos} = Math;

let container = document.getElementById("container")
let c = new Canvas(0,0,container);
c.ctx.lineCap = "square";

window.onresize = (f=>(f(),f))(_=>{
    c.resize();
});

var p = {
    x:1,y:0.5,speed:0.5,angle: Math.random() * 10,
    r:.025,
    w:.00625,
    minSpeed: 0.005,
    maxSpeed: 2.5
};

var lastPositions = [];

/**
 * @typedef {{
 *     x:number, y:number,
 *     t:number,
 *     vx: number,
 *     vy: number,
 * }} square
 * 
 * @typedef {{
 *     x:number, y:number,
 *     t:number,
 *     vx: number,
 *     vy: number,
 * }} circle
 */

/**@type {square[]}*/
var squares = [];
/**@type {circle[]}*/
var circles = [];


function coord(x, y){switch(screen.orientation.type){
    case "portrait-primary":    return scale(1 - y, x    );
    case "portrait-secondary":  return scale(y,     2 - x);
    case "landscape-primary":   return scale(x,     y    );
    case "landscape-secondary": return scale(2 - x, 1 - y);
}}
function scale(...a){return a.map(i=>i* Math.min(c.width,c.height))}

{   //Controls
    let oldX, oldY;
    function mouseDownHandler(newX, newY){oldX = newX, oldY = newY}
    function mouseUpHandler(newX, newY){
        if(oldX == undefined) return;
        let angle = Math.atan2(newY - oldY, newX - oldX) / Math.PI / 2;

        function correctAngle(angle){
            switch(screen.orientation.type){
                case "portrait-primary":    return .00 - angle;
                case "portrait-secondary":  return .50 - angle;
                case "landscape-primary":   return .75 - angle;
                case "landscape-secondary": return .25 - angle;
            }
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
    if(Math.random() < .0025){
        squares.push({x:Math.random() * 2,y:Math.random(),t:0,vx:0,vy:0});
    }
    if(Math.random() < .002){
        circles.push({x:Math.random() * 2,y:Math.random(),t:0,vx:0,vy:0});
    }

    for(let s of squares){
        s.t -= elapsedTime;
        s.vx += (Math.random() - .5) * .00005;
        s.vy += (Math.random() - .5) * .00005;
        s.x += s.vx;
        s.y += s.vy;

        if(s.x + p.r > 2) s.x = 2 - p.r, s.vx *= -1;
        if(s.x < p.r)     s.x = p.r,     s.vx *= -1
        if(s.y + p.r > 1) s.y = 1 - p.r, s.vy *= -1;
        if(s.y < p.r)     s.y = p.r,     s.vy *= -1;

        let s2 = mag(s.vx, s.vy);
        const maxSpeed = .001;

        if(s2 > maxSpeed) s.vx *= maxSpeed / s2, s.vy *= maxSpeed / s2;

        if(mag(s.x - p.x, s.y - p.y) < 2 * p.r){
            s.t = Number.POSITIVE_INFINITY;
            p.speed *= 0.9;
        }
    }
    for(let c of circles){
        c.t -= elapsedTime;
        c.vx += (Math.random() - .5) * .00005;
        c.vy += (Math.random() - .5) * .00005;
        c.x += c.vx;
        c.y += c.vy;

        if(c.x + p.r > 2) c.x = 2 - p.r, c.vx *= -1;
        if(c.x < p.r)     c.x = p.r,     c.vx *= -1
        if(c.y + p.r > 1) c.y = 1 - p.r, c.vy *= -1;
        if(c.y < p.r)     c.y = p.r,     c.vy *= -1;

        let s2 = mag(c.vx, c.vy);
        const maxSpeed = .001;

        if(s2 > maxSpeed) c.vx *= maxSpeed / s2, c.vy *= maxSpeed / s2;

        if(mag(c.x - p.x, c.y - p.y) < 2 * p.r){
            c.t = Number.POSITIVE_INFINITY;
            p.speed *= 1.5;
        }
    }

    circles = circles.filter((c)=>c.t<=10);
    squares = squares.filter((s)=>s.t<=10);


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
        ].map(i=>coord(...i.map(j=>j*(p.r)))))
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
        ].map(i=>coord(...i.map(j=>j*(p.r + 2 *  p.w)))))
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

    c.setDrawColor("#FD01");
    for(let [x,y] of lastPositions) c.circle(...coord(x, y), ...scale(p.r));
}

Canvas.createAnimation((_,elapsedTime)=>{
    if(elapsedTime + p.w / p.speed < 0) for(;elapsedTime + p.w / p.speed < 0; elapsedTime += p.w / p.speed){
        if(update(-p.w / p.speed)) return true;
    }
    else if(update(elapsedTime)) return true;
    draw();
}).then(_=>{
    alert("You Lose!");
    c.setDrawColor("#000");
    Canvas.createAnimation(_=>{
        c.clear("#014");
        c.setStrokeWidth(scale(p.w));
        c.circle(...coord(p.x, p.y), ...scale(p.r));
    })
});