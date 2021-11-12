
function createDragDetector(el,func){
    let oldX, oldY;
    function mouseDownHandler(newX, newY){oldX = newX, oldY = newY}
    function mouseUpHandler(newX, newY){
        if(oldX == undefined) return;
        func(oldX, oldY, newX, newY);
        oldX = oldY = undefined;
    }
    el.addEventListener("mousedown",e=>{
        if(e.buttons & 1) mouseDownHandler(e.clientX,e.clientY);
    });
    window.addEventListener("mouseup",e=>{
        mouseUpHandler(e.clientX,e.clientY);
    });
    el.addEventListener("touchstart",e=>{
        mouseDownHandler(e.touches[0].clientX,e.touches[0].clientY);
    });
    window.addEventListener("touchend",e=>{
        mouseUpHandler(e.changedTouches[0].clientX,e.changedTouches[0].clientY);
    });
}