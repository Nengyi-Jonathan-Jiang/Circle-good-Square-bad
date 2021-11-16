let c = new Canvas(0,0,document.body);
window.onresize = _=>{
    c.resizeToWindow();
    c.clearTransform();
    c.scale(c.height / 2,0,0);
    c.translate(c.w/c.h, 1);
    c.setStrokeWidth(2/c.height);
}
window.onresize();

Canvas.createAnimation(_=>{
    c.clear("#014");
    
    c.setDrawColor("#F07");

})