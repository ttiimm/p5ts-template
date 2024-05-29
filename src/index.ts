import * as p5 from 'p5';

export const sketch = (p: p5) => {
    let flock: Flock;

    p.setup = () => {
        p.createCanvas(640, 360);
        flock = new Flock();
          // Add an initial set of boids into the system
        for (let i = 0; i < 100; i++) {
            let b = new Boid(p.width / 2, p.height / 2);
            flock.addBoid(b);
        }
    }

    p.draw = () => {
        p.background(51);
        flock.run();
    }

    class Flock {
        boids: Boid[];

        constructor() {
            this.boids = [];
        }

        run() {
            for (let boid of this.boids) {
                boid.run(this.boids);
            }
        }

        addBoid(b: Boid) {
            this.boids.push(b);
        }
    }

    // The Nature of Code
    // Daniel Shiffman
    // http://natureofcode.com

    // Boid class
    // Methods for Separation, Cohesion, Alignment added
    class Boid {
        acceleration: p5.Vector;
        velocity: p5.Vector;
        position: p5.Vector;
        r: number;
        maxspeed: number;
        maxforce: number;
        
        constructor(x: number, y: number) {
            this.acceleration = p.createVector(0, 0);
            this.velocity = p.createVector(p.random(-1, 1), p.random(-1, 1));
            this.position = p.createVector(x, y);
            this.r = 3.0;
            this.maxspeed = 3;
            this.maxforce = 0.05;
        }

        run(boids: Boid[]) {
            this.flock(boids);
            this.update();
            this.borders();
            this.render();
        }

        flock(boids: Boid[]) {
            let sep = this.separate(boids);   // Separation
            let ali = this.align(boids);      // Alignment
            let coh = this.cohesion(boids);   // Cohesion

            sep.mult(1.5);
            ali.mult(1.0);
            coh.mult(1.0);

            this.acceleration.add(sep);
            this.acceleration.add(ali);
            this.acceleration.add(coh);
        }

        update() {
            this.velocity.add(this.acceleration);
            this.velocity.limit(this.maxspeed);
            this.position.add(this.velocity);
            this.acceleration.mult(0);
        }

        seek(target: p5.Vector) {
            let desired = p5.Vector.sub(target, this.position);
            desired.normalize();
            desired.mult(this.maxspeed);
            let steer = p5.Vector.sub(desired, this.velocity);
            steer.limit(this.maxforce);
            return steer;
        }

        render() {
            let theta = this.velocity.heading() + p.radians(90);
            p.fill(127);
            p.stroke(200);
            p.push();
            p.translate(this.position.x, this.position.y);
            p.rotate(theta);
            p.beginShape();
            p.vertex(0, -this.r * 2);
            p.vertex(-this.r, this.r * 2);
            p.vertex(this.r, this.r * 2);
            p.endShape(p.CLOSE);
            p.pop();
        }

        borders() {
            if (this.position.x < -this.r) this.position.x = p.width + this.r;
            if (this.position.y < -this.r) this.position.y = p.height + this.r;
            if (this.position.x > p.width + this.r) this.position.x = -this.r;
            if (this.position.y > p.height + this.r) this.position.y = -this.r;
        }

        separate(boids: Boid[]) {
            let desiredseparation = 25.0;
            let steer = p.createVector(0, 0);
            let count = 0;
            for (let other of boids) {
                let d = p5.Vector.dist(this.position, other.position);
                if ((d > 0) && (d < desiredseparation)) {
                    let diff = p5.Vector.sub(this.position, other.position);
                    diff.normalize();
                    diff.div(d);
                    steer.add(diff);
                    count++;
                }
            }
            if (count > 0) {
                steer.div(count);
            }

            if (steer.mag() > 0) {
                steer.normalize();
                steer.mult(this.maxspeed);
                steer.sub(this.velocity);
                steer.limit(this.maxforce);
            }
            return steer;
        }

        align(boids: Boid[]) {
            let neighbordist = 50;
            let sum = p.createVector(0, 0);
            let count = 0;
            for (let other of boids) {
                let d = p5.Vector.dist(this.position, other.position);
                if ((d > 0) && (d < neighbordist)) {
                    sum.add(other.velocity);
                    count++;
                }
            }
            if (count > 0) {
                sum.div(count);
                sum.normalize();
                sum.mult(this.maxspeed);
                let steer = p5.Vector.sub(sum, this.velocity);
                steer.limit(this.maxforce);
                return steer;
            } else {
                return p.createVector(0, 0);
            }
        }

        cohesion(boids: Boid[]) {
            let neighbordist = 50;
            let sum = p.createVector(0, 0);
            let count = 0;
            for (let other of boids) {
                let d = p5.Vector.dist(this.position, other.position);
                if ((d > 0) && (d < neighbordist)) {
                    sum.add(other.position);
                    count++;
                }
            }
            if (count > 0) {
                sum.div(count);
                return this.seek(sum);
            } else {
                return p.createVector(0, 0);
            }
        }
    }

}

export const myp5 = new p5(sketch, document.body);