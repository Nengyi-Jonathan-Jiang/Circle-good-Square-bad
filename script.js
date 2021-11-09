let container = document.getElementById("container")
let c = new Canvas(0,0,container);

window.onresize = (f=>(f(),f))(_=>{
    c.resize();
});

var p = {
    x:.25,y:0,speed:0,angle: Math.random() * 10,
    r:.025
};

screen.orientation.angle;

function coord(x, y){
    let d = c.width > c.height;
    switch(screen.orientation.type){
        case "portrait-primary":    return d ? scale(x,     1 - y) : scale(y,     2 - x);
        case "portrait-secondary":  return d ? scale(2 - x,     y) : scale(1 - y,     x);
        case "landscape-primary":   return d ? scale(x,         y) : scale(y,         x);
        case "landscape-secondary": return d ? scale(2 - x, 1 - y) : scale(1 - y, 2 - x);
    }
}

function scale(...a){return a.map(i=>i* Math.min(c.width,c.height))}

{
    let oldX, oldY;
    function mouseDownHandler(newX, newY){
        oldX = newX; oldY = newY;
    }
    function mouseMoveHandler(newX, newY){
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
    })
    c.canvas.addEventListener("mousemove",e=>{
        if(e.buttons & 1) mouseMoveHandler(e.clientX,e.clientY);
    })
    c.canvas.addEventListener("touchstart",e=>{
        mouseDownHandler(e.touches[0].clientX,e.touches[0].clientY);
    })
    c.canvas.addEventListener("touchmove",e=>{
        mouseMoveHandler(e.touches[0].clientX,e.touches[0].clientY);
    });
}

Canvas.createAnimation((_,elapsedTime)=>{
    c.clear("#014");

    p.x += p.speed * Math.sin(p.angle * 2 * Math.PI) * elapsedTime;
    p.y += p.speed * Math.cos(p.angle * 2 * Math.PI) * elapsedTime;

    if(p.x + p.r > 2) p.x = 2 - p.r, p.angle = - p.angle;
    if(p.x < p.r)     p.x = p.r,     p.angle = - p.angle;
    if(p.y + p.r > 1) p.y = 1 - p.r, p.angle = .5 - p.angle;
    if(p.y < p.r)     p.y = p.r,     p.angle = .5 - p.angle;

    
    c.setDrawColor("#FD0");
    c.fillCircle(...coord(p.x, p.y), ...scale(p.r));
});