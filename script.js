let container = document.getElementById("container")
let c = new Canvas(0,0,container);

container.onresize = (f=>(f(),f))(_=>{
    c.resizeToParent();
});

var player = {
    x:1,y:0.5,speed:.1,angle: .625
};

Canvas.createAnimation((currTime,elapsedTime)=>{
    c.clear("#014");

    player.x += player.speed * Math.sin(player.angle * 2 * Math.PI) * elapsedTime;
    player.y += player.speed * Math.cos(player.angle * 2 * Math.PI) * elapsedTime;

    if(player.x > 2) player.x = 2;
    if(player.y > 1) player.y = 1;

    
    c.setDrawColor("#FD0");
    c.fillCircle(player.x * c.height, player.y * c.height, c.width * .025);
});