let c = new Canvas(0,0,container);
c.ctx.lineCap = "square";
c.setFont("monospace");
c.canvas.addEventListener("contextmenu",e=>e.preventDefault());

window.onresize = (f=>(f(),f))(_=>c.resize());

const R = .025,
      W = .003125,
      PLAYER_MIN_SPEED = 0.05,
      PLAYER_MAX_SPEED = 2;

const {NPO,PO} = initGameObjectsClasses(c);

var p = new PO();

/**@type {NPO[]}*/
var squares = [];
/**@type {NPO[]}*/
var circles = [];

function coord(x, y){return c.width > c.height ? scale(x, y) : scale(1 - y, x)}
function scale(...a){return a.map(i=>i* min(c.width,c.height))}

createDragDetector(c.canvas,(oldX,oldY,newX,newY)=>{
    p.turn(- atan2(newY - oldY, newX - oldX) / PI / 2 - (c.width > c.height) * .25);
})

var lastFrameTime = -1;

window.onkeypress=_=>{console.log(lastPositions.length)}

function update(elapsedTime){
    if(random() < .5 * -elapsedTime) squares.push(NPO.makeSquare());
    if(random() < .2 * -elapsedTime) circles.push(NPO.makeCircle());

    for(let o of [...squares,...circles]){
        o.update(elapsedTime);
        if(o.collide(p.x,p.y)) p.speed += o.boost;
    }

    circles = circles.filter(o=>o.filter());
    squares = squares.filter(o=>o.filter());

    if(p.update(elapsedTime)) return true;
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
    c.fillText("SPEED: " + ceil(p.speed), c.width / 2, ...scale(.05), ...scale(.05));
}

function gameAnimationFrame(_,elapsedTime){
    if(update(elapsedTime)) return true;
    draw();
}

for(let i = 0; i < 10; i++) squares.push(NPO.makeSquare());
for(let i = 0; i < 5; i++) circles.push(NPO.makeCircle());

Canvas.createAnimation(gameAnimationFrame).then(_=>{
    alert("You Lose!");
    c.setDrawColor("#000");
    Canvas.createAnimation(_=>{
        draw();
        c.clear("#F006");
    }).then(gameAnimationFrame);
});