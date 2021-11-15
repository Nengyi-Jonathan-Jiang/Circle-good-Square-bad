let c = new Canvas(0,0,container);
c.ctx.lineCap = "square";
c.setFont("monospace");
c.canvas.addEventListener("contextmenu",e=>e.preventDefault());

window.onresize = (f=>(f(),f))(_=>c.resize());

const R = .025,
      W = .003125,
      PLAYER_MIN_SPEED = 0.05,
      PLAYER_MAX_SPEED = 2;

var p = new PO();

/**@type {NPO[]}*/
var squares = [];
/**@type {NPO[]}*/
var squares2 = [];
/**@type {NPO[]}*/
var circles = [];

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
        create: _=>{return new NPO(NPO.drawSquareFunc, -2, 16, .002, .0001)},
        color:"#F07",
        spawnChance: .6,
        min: 8,
        cap: 24
    }],
    ["squares2",{
        list:[],
        create: _=>{return new NPO(NPO.drawSquareFunc, -4, 10, .02, .1)},
        color:"#F0F",
        spawnChance: .1,
        min: 0,
        cap: 3,
    }],
    ["squares3",{
        list:[],
        create: _=>{return new NPO(NPO.drawSquareFunc, -3, 8, .005,  .1, true)},
        color:"#F66",
        spawnChance: .2,
        min: 0,
        cap: 6,
    }],
    ["circles",{
        list:[],
        create: _=>{return new NPO(NPO.drawCircleFunc,  2,  8, .002, .0001)},
        color:"#0FF",
        spawnChance: .3,
        min: 2,
        cap: 6,
    }],
    ["circles2",{
        list:[],
        create: _=>{return new NPO(NPO.drawCircleFunc,  6,  5, .02, .1)},
        color:"#0F4",
        spawnChance: .1,
        min: 0,
        cap: 3,
    }],
])

var score = 0;

function coord(x, y){return c.width > c.height ? scale(x, y) : scale(1 - y, x)}
function scale(...a){return a.map(i=>i* min(c.width,c.height))}

createDragDetector(c.canvas,(oldX,oldY,newX,newY)=>{
    p.turn(- atan2(newY - oldY, newX - oldX) / PI / 2 - (c.width > c.height) * .25);
})
var clicked = createClickDetector(c.canvas);

window.onkeypress=_=>{console.log(lastPositions.length)}

function update(elapsedTime){
    for(let t of obstacles.values()){
        let shouldSpawn = t.list.length < t.min && random() < elapsedTime
            || t.list.length < t.cap && random() < t.spawnChance * elapsedTime;
        if(shouldSpawn){
            while(true){
                t.list.unshift(t.create());
                if(t.list[0].hardCollide(p.x, p.y, 1.5 * R + 25 * t.list[0].maxSpeed * R)) t.list.shift();
                else break;
            }
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
    for(let i = 0; i < 3; i++){
        let opacity = "F84".charAt(i)
        for(let t of obstacles.values()){
            c.setDrawColor(t.color + opacity);
            for(let o of t.list) o.draw(R + i * W);
        }
    }

    p.draw();

    c.setDrawColor("#FFF");
    c.fillText("ENERGY: " + ceil(p.energy) + "  |  SCORE: " + ceil(score), c.width / 2, ...scale(.05), ...scale(.05));
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
    Canvas.createAnimation(_=>{
        draw();
        c.clear("#F006");
        c.setDrawColor("#FFF")
        c.fillText("GAME OVER",c.w/2,c.h/2 - c.w/20,c.w/20);
        c.fillText("FINAL SCORE: " + ceil(score), c.w/2,c.h/2,c.w/30);
        c.fillText("CLICK ANYWHERE TO PLAY AGAIN", c.w/2,c.h/2 + c.w/25,c.w/30);
        if(clicked.clicked()) return true;
    }).then(reset)});
})