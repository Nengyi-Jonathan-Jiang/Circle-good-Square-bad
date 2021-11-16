class Canvas {
    //#region

    /**
     * @param width
     * Width of canvas in pixels. Defaults to window width.
     * @param height
     * Height of canvas in pixels. Defaults to window height.
     * @param parent
     * If parent is an HTML element,(like div or body),the created HTMLCanvasElement will be appended to it.
     * @param transparent
     * If true (default),the created canvas will be able to draw transparent/translucent colors or images.
     */
    constructor(width, height, parent, transparent = true) {
        this.canvas = document.createElement('canvas');
        this.w = this.canvas.width = width || window.innerWidth;
        this.h = this.canvas.height = height || window.innerHeight;
        if (parent) parent.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d', {
            alpha: transparent
        });
        this.ctx.textAlign = "center";
        this.parent = parent;
        this.textOptions = {
            "font-style": "normal",
            "font-variant": "normal",
            "font-weight": "normal",
            "font-size": "12em",
            "line-height": "1",
            "font-family": "system-ui"
        };
    }
    set width(width) {
        this.resize(width, this.h);
    }
    get width() {
        return this.w;
    }
    set height(height) {
        this.resize(this.w, height);
    }
    get height() {
        return this.h;
    }
    /**
     * Resizes the canvas to the provided dimensions,or the size provided by the CSS attributes.
     * @param width
     * Width in pixels. If not truthy,will be the window width.
     * @param height
     * Height in pixels. If not truthy,will be the window height.
     */
    resize(width, height) {
        this.canvas.width = this.w = width || this.canvas.clientWidth;
        this.canvas.height = this.h = height || this.canvas.clientHeight;
    }
    /**
     * Resizes the canvas to the dimensions of the parent element (Will probably throw error if the parent provided in the constructor was not a HTMLElement)
     */
    resizeToParent() {
        if (!this.parent)
            return;
        this.resize(this.parent.clientWidth, this.parent.clientHeight);
    }
    /**
     * resizes the canvas to the dimensions of the window
     */
    resizeToWindow() {
        this.resize(window.innerWidth, window.innerHeight);
    }
    /**
     * Sets the stroke and fill color of subsequent operations
     * @param color
     * Hex value of the color (like #d4c00b)
     */
    setDrawColor(color) {
        this.ctx.strokeStyle = this.ctx.fillStyle = color;
    }
    /**
     * Sets the stroke color of subsequent operations
     * @param color
     * Hex value of the color (like #d4c00b)
     */
    setStrokeColor(color) {
        this.ctx.strokeStyle = color;
    }
    /**
     * Sets the fill color of subsequent operations
     * @param {string} color
     * Hex value of the color (like #d4c00b)
     */
    setFillColor(color) {
        this.ctx.fillStyle = color;
    }
    /**
     * Sets the line cap of subsequent operations
     * @param {"butt"|"square"|"round"} 
     */
    setLineCap(cap){
        this.ctx.lineCap = cap;
    }
    /**
     * Sets the stroke width of subsequent operations
     * @param {number} width
     * Stroke width in pixels
     */
    setStrokeWidth(width) {
        this.ctx.lineWidth = width;
    }

    /**
     * Wrapper for CanvasRenderingContext2D.save()
     * Saves the current state to a stack
     */
     pushState() {
        this.ctx.save();
    }
    /**
     * Wrapper for CanvasRenderingContext2D.restore()
     * Restores the last state on the stack and pops it from the stack
     */
    restoreState() {
        this.ctx.restore();
    }
    /**
     * rotate context by angle around (x,y) or (0,0) if not present
     * @param angle
     * angle in radians
     * @param clockwise
     * whether to rotate clockwise
     */
    rotate(angle, clockwise = true, x = 0, y = 0) {
        this.ctx.translate(-x, -y);
        this.ctx.rotate(clockwise ? angle : -angle);
        this.ctx.translate(x, y);
    }
    /**
     * translates context x units left and y units down
     */
    translate(x, y) {
        this.ctx.translate(x, y);
    }
    /**
     * scales context by a factor of a around (x,y) or (0,0) if not present
     */
    scale(a, x = 0, y = 0) {
        this.ctx.translate(-x, -y);
        this.ctx.scale(a, a);
        this.ctx.translate(x, y);
    }
    /**
     * Wrapper for ctx.setTransform
     */
    setTransform(a,b,c,d,e,f){
        this.ctx.setTransform(a,b,c,d,e,f);
    }
    /**
     * Clears all transformations
     */
    clearTransform(){
        this.ctx.setTransform(1,0,0,1,0,0);
    }

    /**
     * Sets font style
     */
        setFont(family, italic, bold, line_height, small_caps) {
        if (family !== undefined)
            this.textOptions["font-family"] = family;
        if (italic !== undefined)
            this.textOptions["font-style"] = italic ? "italic" : "normal";
        if (bold !== undefined)
            this.textOptions["font-weight"] = bold ? "bold" : "normal";
        if (line_height !== undefined)
            this.textOptions["line-height"] = line_height.toString();
        if (small_caps !== undefined)
            this.textOptions["font-variant"] = small_caps ? "small_caps" : "normal";
    }

    //#endregion

    /**
     * Wrapper for ctx.beginPath.
     */
    begin() {
        this.ctx.beginPath();
    }
    /**
     * Wrapper for ctx.moveTo.
     * Moves to (x,y). This starts a new line/fill
     */
    moveTo(x, y) {
        this.ctx.moveTo(x, y);
    }
    /**
     * Wrapper for ctx.lineTo
     * Makes a line to (x,y)
     */
    lineTo(x, y) {
        this.ctx.lineTo(x, y);
    }
    /**
     * Wrapper for ctx.arc
     * Draws an arc centered at (x,y) from a1 to a2 full turns clockwise with radius
     * r. If counterclockwise=true,the arc will be inverted (not mirrored)
     */
    arc(x, y, r, a1, a2, counterclockwise = false) {
        this.ctx.arc(x, y, r, a1 * 2 * Math.PI, a2 * 2 * Math.PI, counterclockwise);
    }
    /**
     * Wrapper for ctx.stroke
     * Draws the path onto the canvas
     */
    stroke() {
        this.ctx.stroke();
        this.ctx.closePath();
    }
    /** @param {CanvasFillRule} fillRule */
    fill(fillRule="evenodd") {
        this.ctx.fill(fillRule);
        this.ctx.closePath();
    }
    end() {
        this.ctx.closePath();
    }

    /**
     * Clears canvas. If color is provided,fill canvas with color
     * @param color
     * Hex value of the color (like #d4c00b). If not provided,the resulting canvas is transparent if transparency is enabled or white otherwise.
     */
    clear(color){
        this.ctx.save();
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        if (color)
            this.setFillColor(color), this.ctx.fillRect(0, 0, this.w, this.h);
        else
            this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        this.ctx.restore();
    }
    /**
     * Draws a line from x1 to y1.
     */
    line(x1, y1, x2, y2) {
        this.ctx.moveTo(x1, y1);
        this.ctx.lineTo(x2, y2);
    }
    rect(x1, y1, x2, y2) {
        this.ctx.rect(x1, y1, x2 - x1, y2 - y1);
    }
    square(x, y, width) {
        this.ctx.rect(x, y, width, width);
    }
    circle(x, y, r) {
        this.ctx.moveTo();
        this.ctx.arc(x, y, r, 0, 2 * Math.PI);
    }
    
    arc(x, y, r, a1, a2, counterclockwise = false) {
        this.moveTo(x, y);
        this.ctx.arc(x, y, r, a1 * 2 * Math.PI, a2 * 2 * Math.PI, counterclockwise);
    }


    /**
     * Fill text with top left corner at (x,y)
     * @param txt
     * The text to display
     * @param size
     * The font size in pixels
     * @param  font
     * A string parsed like a CSS font property (like "italic bold 16px Times";)
     */
    text(txt, x, y, size) {
        this.ctx.beginPath();
        this.ctx.font = [this.textOptions["font-variant"], this.textOptions["font-weight"], size + "px", this.textOptions["font-family"]].join(" ");
        this.ctx.textAlign = "center";
        this.ctx.fillText(txt, x, y);
        this.ctx.closePath();
    }
    polygon(center, points) {
        this.ctx.moveTo(points[points.length - 1][0] + center[0], points[points.length - 1][1] + center[1]);
        let t = this;
        points.forEach(s => t.ctx.lineTo(s[0] + center[0], s[1] + center[1]));
    }
    squircle(x, y, width, r = 5) {
        this.ctx.arc(x + width / 2 - r, y - width / 2 + r, r, 3 * Math.PI / 2, 0 * Math.PI / 2);
        this.ctx.arc(x + width / 2 - r, y + width / 2 - r, r, 0 * Math.PI / 2, 1 * Math.PI / 2);
        this.ctx.arc(x - width / 2 + r, y + width / 2 - r, r, 1 * Math.PI / 2, 2 * Math.PI / 2);
        this.ctx.arc(x - width / 2 + r, y - width / 2 + r, r, 2 * Math.PI / 2, 3 * Math.PI / 2);
        this.ctx.lineTo(x + width / 2 - r, y - width / 2);
    }
    /**
     * Attempts to call f(current time,elapsed time in milliseconds) at the computer's base framerate
     * @param {Function} f - the function to be called
     * @returns {Promise<any>} will be resolved when f returns true and the animation is stopped
     */
    static createAnimation(f) {
        return new Promise(resolve=>requestAnimationFrame(t=>{
            let then = t;
            (f2=>f2(t))(function f2(t){
                if (f(0.001 * t, 0.001 * (t - then))) return resolve();
                then = t;
                requestAnimationFrame(f2);
            })
        }))       
    }
}