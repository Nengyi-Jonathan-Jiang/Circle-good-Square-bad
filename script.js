let container = document.getElementById("container")
let c = new Canvas(0,0,container);

window.onresize = (f=>(f(),f))(_=>{
    c.resize();
});

var p = {
    x:1,y:0.5,speed:.1,angle: Math.random() * 10,
    r:.025
};

var lastPositions = [{x:p.x,y:p.y,angle:p.angle}];

screen.orientation.angle;

function coord(x, y){
    switch(screen.orientation.type){
        case "portrait-primary":    return scale(1 - y, x    );
        case "portrait-secondary":  return scale(y,     2 - x);
        case "landscape-primary":   return scale(x,     y    );
        case "landscape-secondary": return scale(2 - x, 1 - y);
    }
}
function scale(...a){return a.map(i=>i* Math.min(c.width,c.height))}

{
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

Canvas.createAnimation((_,et)=>{

    function f(elapsedTime, draw){
        p.speed *= Math.pow(1.1, elapsedTime);
        if(p.speed < 0.01) return false;

        p.x += p.speed * Math.sin(p.angle * 2 * Math.PI) * elapsedTime;
        p.y += p.speed * Math.cos(p.angle * 2 * Math.PI) * elapsedTime;

        if(p.x + p.r > 2) p.x = 2 - p.r, p.angle = - p.angle;
        if(p.x < p.r)     p.x = p.r,     p.angle = - p.angle;
        if(p.y + p.r > 1) p.y = 1 - p.r, p.angle = .5 - p.angle;
        if(p.y < p.r)     p.y = p.r,     p.angle = .5 - p.angle;

        if(draw){
            c.clear("#014");
            c.setStrokeWidth(scale(p.r * .25));
            c.setDrawColor("#FD0");
            c.circle(...coord(p.x, p.y), ...scale(p.r));

            c.setDrawColor("#FD04");
            c.beginPath();
            for(let q of lastPositions){
                c.lineTo(...coord(q.x + p.r * Math.cos(q.angle * 2 * Math.PI), q.y - p.r * Math.sin(q.angle * 2 * Math.PI)));
            }
            for(let q of [...lastPositions].reverse()){
                c.lineTo(...coord(q.x - p.r * Math.cos(q.angle * 2 * Math.PI), q.y + p.r * Math.sin(q.angle * 2 * Math.PI)));
            }
            c.closePath();
            c.ctx.fill("nonzero");
        }
        
        lastPositions.push({
            x:p.x,
            y:p.y,
            angle:p.angle
        });
        if(lastPositions.length > 100) lastPositions.shift();
    }
    
    let maxStep = .01;

    while(-et > maxStep/p.speed) f(-maxStep/p.speed), et+= maxStep/p.speed;
    f(et,true);
}).then();