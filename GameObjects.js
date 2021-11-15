
class NPO{
    /** @param {(r:number)=>any} drawFunc @param {number} boost @param {number} maxT @param {number} maxSpeed @param {number} jitter */
    constructor(drawFunc, boost, maxT, maxSpeed = .1, jitter = .01, homing = false){
        this.drawFunc = drawFunc;
        this.boost = boost;
        this.maxT = maxT;
        this.maxSpeed = maxSpeed;
        this.jitter = jitter;

        this.t = 0;
        this.x = random() * 2;
        this.y = random();
        
        let angle = random() * 2 * PI, energy = random() * maxSpeed;
        this.vx = energy * sin(angle);
        this.vy = energy * cos(angle);

        this.flicker = false;
        this.homing = homing;
    }
    /** @param {number} elapsedTime */
    update(elapsedTime){
        this.t += elapsedTime;
        if(this.homing){
            this.vx += (random() - .5) * this.jitter * elapsedTime;
            this.vy += (random() - .5) * this.jitter * elapsedTime;
            this.vx += elapsedTime * (p.x - this.x) * .1;
            this.vy += elapsedTime * (p.y - this.y) * .1;
        }
        
        let speed = sqrt(this.vx * this.vx + this.vy * this.vy);

        if(speed > this.maxSpeed) this.vx *= this.maxSpeed / speed, this.vy *= this.maxSpeed / speed;

        this.x += this.vx;
        this.y += this.vy;

        if(this.x + R > 2) this.x = 2 - R, this.vx *= -1;
        if(this.x < R)     this.x = R,     this.vx *= -1
        if(this.y + R > 1) this.y = 1 - R, this.vy *= -1;
        if(this.y < R)     this.y = R,     this.vy *= -1;

        this.flicker = this.homing || (f=>f < this.t && f < this.maxT - this.t)(random());
    }
    draw(r){
        if(this.flicker) this.drawFunc.call(this,r)
    }
    collide(x,y){
        return this.flicker && this.hardCollide(x,y) && (this.t = Number.POSITIVE_INFINITY, true);
    }
    hardCollide(x,y,r = 2*R){
        return Math.sqrt((this.x - x) * (this.x - x) + (this.y - y) * (this.y - y)) <= r;
    }
    filter(){return this.t < this.maxT}

    static drawSquareFunc(r){
        if(Math.random() > this.maxT - this.t) return;
        c.polygon(coord(this.x, this.y),[
            [ sin(this.t), cos(this.t)],
            [ cos(this.t),-sin(this.t)],
            [-sin(this.t),-cos(this.t)],
            [-cos(this.t), sin(this.t)],
        ].map(i=>coord(...i.map(j=>j*r))))
    }
    static drawCircleFunc(r){
        if(Math.random() > this.maxT - this.t) return;
        c.circle(...coord(this.x,this.y),...scale(r));
    }
}


class PO{
    constructor(){
        this.x = this.y = this.energy = this.angle = this.lastPositions = this.turns = undefined;
        this.reset();
    }
    reset(){
        this.x = 1; this.y = .5;
        this.energy = 10;
        this.angle = random() * 2 * PI;

        /**@type {[number,number][]}*/
        this.lastPositions = [];
        /**@type {[number,number,number][]}*/
        this.turns = [];
    }
    turn(angle){
        this.angle = angle;
        this.turns.push([this.x, this.y, 0]);
    }
    update(elapsedTime){
        this.energy -= .1 * elapsedTime;

        if(this.energy <= 0) return true;

        let ds = elapsedTime * PLAYER_MAX_SPEED * (1 - Math.pow(1.05 , -this.energy));

        let maxTailLength = min(128, 8 * sqrt(this.energy));

        for(;ds > 0; ds -= W){
            let _ds = min(ds,W);
            this.x -= _ds * sin(this.angle * 2 * PI);
            this.y -= _ds * cos(this.angle * 2 * PI);

            if(this.x + R > 2) this.turn(0.0 - this.angle), this.x = 2 - R;
            if(this.x < R)     this.turn(0.0 - this.angle), this.x = R;
            if(this.y + R > 1) this.turn(0.5 - this.angle), this.y = 1 - R;
            if(this.y < R)     this.turn(0.5 - this.angle), this.y = R;
            
            this.lastPositions.push([this.x,this.y]);
            while(this.lastPositions.length > maxTailLength) this.lastPositions.shift();
            this.turns = this.turns.filter(i => (++i[2]) <= maxTailLength);
        }
    }
    draw(){
        for(let i = 0; i < 8; i++){
            c.setDrawColor("#FD0" + "FC864321".charAt(i));
            c.circle(...coord(this.x, this.y), scale(R + W * i)[0]);
        }
    
        c.setDrawColor("#FD01");
        if(this.lastPositions.length){
        let positions = [this.lastPositions[0],...this.turns,[this.x,this.y]];
            for(let i = 0; i + 1 < positions.length;){
                let [prev,next] = [positions[i],positions[++i]];
                let length = sqrt((prev[0] - next[0]) * (prev[0] - next[0]) + (prev[1] - next[1]) * (prev[1] - next[1]));
                let _length = 1 / length;
                for(let j = 0; j < length; j += W){
                    c.circle(...coord(
                        prev[0] + (next[0] - prev[0]) * j * _length,
                        prev[1] + (next[1] - prev[1]) * j * _length,
                    ), scale(R)[0]);
                }
            }
        }
    }
}