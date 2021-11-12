function initGameObjectsClasses(c){
    class NPO{
        /** @param {(r:number)=>any} drawFunc @param {number} boost @param {number} maxT @param {number} maxSpeed @param {number} jitter */
        constructor(drawFunc, boost, maxT, maxSpeed = .1, jitter = .01){
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
        }
        /** @param {number} elapsedTime */
        update(elapsedTime){
            this.t += elapsedTime;

            this.vx += (random() - .5) * this.jitter * elapsedTime;
            this.vy += (random() - .5) * this.jitter * elapsedTime;
            this.x += this.vx;
            this.y += this.vy;

            if(this.x + R > 2) this.x = 2 - R, this.vx *= -1;
            if(this.x < R)     this.x = R,     this.vx *= -1
            if(this.y + R > 1) this.y = 1 - R, this.vy *= -1;
            if(this.y < R)     this.y = R,     this.vy *= -1;

            let energy = sqrt(this.vx * this.vx + this.vy * this.vy);
            if(energy > this.maxSpeed) this.vx *= this.maxSpeed / energy, this.vy *= this.maxSpeed / energy;
        }
        draw(r){this.drawFunc.call(this,r)}
        collide(x,y){
            if(Math.sqrt((this.x - x) * (this.x - x) + (this.y - y) * (this.y - y)) <= 2 * R)
                return this.t = Number.POSITIVE_INFINITY, true;
        }
        filter(){return this.t < this.maxT}

        static drawSquareFunc(r){
            c.polygon(coord(this.x, this.y),[
                [ sin(this.t), cos(this.t)],
                [ cos(this.t),-sin(this.t)],
                [-sin(this.t),-cos(this.t)],
                [-cos(this.t), sin(this.t)],
            ].map(i=>coord(...i.map(j=>j*r))))
        }
        static drawCircleFunc(r){
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
            this.energy = 3;
            this.angle = random() * 2 * PI;

            /**@type {[number,number][]}*/
            this.lastPositions = [[this.x, this.y]];
            /**@type {[number,number,number][]}*/
            this.turns = [];
        }
        turn(angle){
            this.angle = angle;
            this.turns.push([this.x, this.y, 0]);
        }
        update(elapsedTime){
            this.energy += .1 * elapsedTime;

            if(this.energy <= 0) return true;

            let ds = elapsedTime * PLAYER_MAX_SPEED * (Math.pow(1.1 , -this.energy) - 1);

            let maxTailLength = min(128, 10 * sqrt(this.energy));

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
            for(let i = 0; i < 5; i++){
                c.setDrawColor("#FD0" + "F8421".charAt(i));
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
    return {NPO:NPO, PO:PO};
}