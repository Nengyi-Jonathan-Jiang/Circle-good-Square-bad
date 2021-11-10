let container = document.getElementById("container")
let c = new Canvas(0,0,container);

window.onresize = (f=>(f(),f))(_=>{
    c.resize();
});

var p = {
    x:1,y:0.5,speed:5,angle: Math.random() * 10,
    r:.025,
    w:.00625
};

var lastPositions = [];

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

var lastFrameTime = -1;


function update(elapsedTime){
    p.speed *= Math.pow(1.1, elapsedTime);
    if(p.speed < p.w) return true;

    p.x += p.speed * Math.sin(p.angle * 2 * Math.PI) * elapsedTime;
    p.y += p.speed * Math.cos(p.angle * 2 * Math.PI) * elapsedTime;

    if(p.x + p.r > 2) p.x = 2 - p.r, p.angle = - p.angle;
    if(p.x < p.r)     p.x = p.r,     p.angle = - p.angle;
    if(p.y + p.r > 1) p.y = 1 - p.r, p.angle = .5 - p.angle;
    if(p.y < p.r)     p.y = p.r,     p.angle = .5 - p.angle;
    
    lastPositions.push([p.x,p.y]);
    while(lastPositions.length > Math.sqrt(20 * p.speed / p.w)) lastPositions.shift();
}
function draw(){
    c.clear("#014");
    c.setStrokeWidth(scale(p.w));
    c.setDrawColor("#FD0");
    c.circle(...coord(p.x, p.y), ...scale(p.r));

    c.setDrawColor("#FD01");
    for(let [x,y] of lastPositions) c.circle(...coord(x, y), ...scale(p.r));
}

Canvas.createAnimation((currTime)=>{
    if(!lastFrameTime) lastFrameTime = currTime;
    
    let maxStep = p.w / 2;
    for(;currTime - lastFrameTime > maxStep / p.speed; lastFrameTime += maxStep/p.speed){
        if(update(-maxStep/p.speed)) return true;
    }
    draw();

}).then(_=>{
    alert("You Lose!");
    c.setDrawColor("#F00");
    Canvas.createAnimation(_=>{
        c.clear("#014");
        c.circle(...coord(p.x, p.y), ...scale(p.r));
    })
});