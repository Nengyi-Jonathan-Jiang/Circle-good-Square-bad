let container = document.getElementById("container")
let c = new Canvas(0,0,container);

window.onresize = (f=>(f(),f))(_=>{
    c.resize();
});

var p = {
    x:1,y:0.5,speed:.5,angle: .7,
    r:.025
};

function isPortrait(){
    return window.innerHeight > window.innerWidth;
}

function coord(x, y){
    return isPortrait() ? [y * c.width, (2 - x) * c.width] : [x * c.height, y * c.height];
}
function scale(a){return isPortrait() ? a * c.width : a * c.height}


{
    let oldX, oldY;
    function mouseDownHandler(newX, newY){
        oldX = newX; oldY = newY;
    }
    function mouseMoveHandler(newX, newY){
        if(oldX == undefined) return;

        console.log(newX - oldX, newY - oldY);
        oldX = oldY = undefined;
    }

    window.addEventListener("mousemove",e=>{
        if(e.buttons & 1){
            console.log("drag");
        }
    })
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
    c.fillCircle(...coord(p.x, p.y), scale(p.r));
});