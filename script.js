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
function makeSquare(){return new NPO(NPO.drawSquareFunc, -1, 16, .002, .0001)}
function makeCircle(){return new NPO(NPO.drawCircleFunc,  2,  8, .002, .0001)}


var p = new PO();

/**@type {NPO[]}*/
var squares = [];
/**@type {NPO[]}*/
var squares2 = [];
/**@type {NPO[]}*/
var circles = [];

var score = 0;

function coord(x, y){return c.width > c.height ? scale(x, y) : scale(1 - y, x)}
function scale(...a){return a.map(i=>i* min(c.width,c.height))}

createDragDetector(c.canvas,(oldX,oldY,newX,newY)=>{
    p.turn(- atan2(newY - oldY, newX - oldX) / PI / 2 - (c.width > c.height) * .25);
})
var clicked = createClickDetector(c.canvas);

window.onkeypress=_=>{console.log(lastPositions.length)}

function update(elapsedTime){
    if(random() < .5 * -elapsedTime) squares.push(makeSquare());
    if(random() < .2 * -elapsedTime) circles.push(makeCircle());

    for(let o of [...squares,...circles]){
        o.update(elapsedTime);
        if(o.collide(p.x,p.y)) p.energy += o.boost;
    }

    circles = circles.filter(o=>o.filter());
    squares = squares.filter(o=>o.filter());

    if(p.update(elapsedTime)) return true;

    score -= p.energy * elapsedTime;
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
    c.fillText("ENERGY: " + ceil(p.energy) + "  |  SCORE: " + ceil(score), c.width / 2, ...scale(.05), ...scale(.05));
}


function reset(){
    score = 0;
    p.reset();
    squares = [];
    circles = [];

    for(let i = 0; i < 10;){
        squares.unshift(makeSquare());
        if(squares[0].collide(p.x,p.y)) squares.shift();
        else i++, squares[0].t = random() * PI / 2;
    }
    for(let i = 0; i <  5; i++){
        circles.unshift(makeCircle());
        if(circles[0].collide(p.x,p.y)) circles.shift();
        else i++, circles[0].t = random() * PI / 2;
    }
    
    Canvas.createAnimation((_,elapsedTime)=>{
        if(update(elapsedTime)) return true;
        draw();
    }).then(_=>{
        p.energy = 0;
        clicked.clicked();
        Canvas.createAnimation(_=>{
            draw();
            c.clear("#F006");
            c.setDrawColor("#FFF")
            c.fillText("GAME OVER",c.w/2,c.h/2 - c.w/20,c.w/20);
            c.fillText("FINAL SCORE: " + ceil(score), c.w/2,c.h/2,c.w/30);
            c.fillText("CLICK ANYWHERE TO PLAY AGAIN", c.w/2,c.h/2 + c.w/25,c.w/30);
            if(clicked.clicked()) return true;
        }).then(reset);
    });
}

reset();