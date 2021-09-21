
function Vector2(x, y) {
  this.x = (x === undefined) ? 0 : x;
  this.y = (y === undefined) ? 0 : y;
}

Vector2.prototype = {
  set: function(x, y) {
    this.x = x || 0;
    this.y = y || 0;
  },

  clone: function() {
    return new Vector2(this.x, this.y)
  },

  add: function(vector) {
    return new Vector2(this.x + vector.x, this.y + vector.y);
  },

  subtract: function(vector) {
    return new Vector2(this.x - vector.x, this.y - vector.y);
  },

  scale: function(scalar) {
    return new Vector2(this.x * scalar, this.y * scalar);
  },

  dot: function(vector) {
    return (this.x * vector.x + this.y + vector.y);
  },

  moveTowards: function(vector, t) {
    // Linearly interpolates between vectors A and B by t.
    // t = 0 returns A, t = 1 returns B
    t = Math.min(t, 1); // still allow negative t
    var diff = vector.subtract(this);
    return this.add(diff.scale(t));
  },

  magnitude: function() {
    return Math.sqrt(this.magnitudeSqr());
  },

  magnitudeSqr: function() {
    return (this.x * this.x + this.y * this.y);
  },

  distance: function (vector) {
    return Math.sqrt(this.distanceSqr(vector));
  },

  distanceSqr: function (vector) {
    var deltaX = this.x - vector.x;
    var deltaY = this.y - vector.y;
    return (deltaX * deltaX + deltaY * deltaY);
  },

  normalize: function() {
    var mag = this.magnitude();
    var vector = this.clone();
    if(Math.abs(mag) < 1e-9) {
      vector.x = 0;
      vector.y = 0;
    } else {
      vector.x /= mag;
      vector.y /= mag;
    }
    return vector;
  },

  angle: function() {
    return Math.atan2(this.y, this.x);
  },

  rotate: function(alpha) {
    var cos = Math.cos(alpha);
    var sin = Math.sin(alpha);
    var vector = new Vector2();
    vector.x = this.x * cos - this.y * sin;
    vector.y = this.x * sin + this.y * cos;
    return vector;
  },

  toPrecision: function(precision) {
    var vector = this.clone();
    vector.x = vector.x.toFixed(precision);
    vector.y = vector.y.toFixed(precision);
    return vector;
  },

  toString: function () {
    var vector = this.toPrecision(1);
    return ("[" + vector.x + "; " + vector.y + "]");
  }
};






// =============================================================




let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");
let gravity = 0.001;
let gravityOn = false;
let lastFrameTime;

class Point {
  constructor(x, y, color = 'Black', locked = false) {
    this.pos = new Vector2(x, y);
    this.prevPos = this.pos.clone();
    this.locked = locked;
    this.color = color;
    this.speedX = 0;
    this.speedY = 0;
  }

  refreshPosition() {
    if (!this.locked && gravityOn){

      let deltaTime = Date.now() - lastFrameTime;
      let posBeforeUpdate = this.pos.clone();
      this.pos = this.pos.add(this.pos.subtract(this.prevPos));
      this.pos = this.pos.add(new Vector2(0, 1).scale(gravity * deltaTime * deltaTime));
      this.prevPos = posBeforeUpdate.clone();
    }
  }

  lock() {
    if (this.locked){
      this.locked = !this.locked;
      this.color = 'Black';
    } else {
      this.locked = !this.locked;
      this.color = 'Red';
      this.speedX = 0;
      this.speedY = 0;
    }
  }
}

class Stick {
  constructor(firstPointIndex, secondPointIndex) {
    this.firstPointIndex = firstPointIndex;
    this.secondPointIndex = secondPointIndex;
    this.pointA = points[this.firstPointIndex];
    this.pointB = points[this.secondPointIndex];
    let pos1 = points[this.firstPointIndex].pos;
    let pos2 = points[this.secondPointIndex].pos;
    this.lenght = Math.sqrt((pos2.x - pos1.x)*(pos2.x - pos1.x) + (pos2.y - pos1.y)*(pos2.y - pos1.y));

  }
  refreshPosition() {
    let pointA = this.pointA;
    let pointB = this.pointB;
    let stickCenter = pointA.pos.add(pointB.pos).scale(0.5);
    let stickDir = pointA.pos.subtract(pointB.pos).normalize();
    if(!pointA.locked && gravityOn) {
      pointA.pos = stickCenter.add(stickDir.scale(this.lenght / 2));
    }
    if(!pointB.locked && gravityOn) {
      pointB.pos = stickCenter.subtract(stickDir.scale(this.lenght / 2));
    }
  }

  getFirstPos() {
    return points[this.firstPointIndex].pos;
  }

  getSecondPos() {
    return points[this.secondPointIndex].pos;
  }
}


const posCompare = (pos1, pos2) => {
  if (Math.abs(pos1.x - pos2.x) < 10 && Math.abs(pos1.y - pos2.y) < 10) {
    return true;
  }
}

const isPointClicked = (clickPos) => {
  return points.findIndex(point => posCompare(point.pos, clickPos));
}

const drawCircle = (x, y, color = "Black") => {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, 10, 0, 2 * Math.PI);
  ctx.fill();
}

const drawLine = (pos1, pos2) => {
  ctx.fillStyle = 'Black';
  ctx.beginPath();
  ctx.moveTo(pos1.x, pos1.y);
  ctx.lineTo(pos2.x, pos2.y);
  ctx.lineWidth = 5;
  ctx.stroke();
}

const refresh = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  sticks.forEach(stick => {
    stick.refreshPosition();
    drawLine(stick.getFirstPos(), stick.getSecondPos());
  });
  points.forEach(point => {
    point.refreshPosition();
    drawCircle(point.pos.x, point.pos.y, point.color);
  });


  lastFrameTime = Date.now();
}

let points = [];
let sticks = [];

for (let y = 1; y <= 8; ++y){
  for(let x = 1; x <= 10; ++x){
    points.push(new Point(x * 100, y * 100));
  }
}

for (let x = 0; x < 7; ++x) {
  for (let y = 0; y < 9; ++y) {
    sticks.push(new Stick(x*10+y, x*10+y+1));
    sticks.push(new Stick(x*10+y, (x+1)*10+y));
  }
}

for(let i = 0; i < 7; ++i){
  sticks.push(new Stick(i*10+9, (i+1)*10+9));
  sticks.push(new Stick(70 + i, 71 + i))
}


canvas.onmousedown = (ev) => {
  let downPos = {'x': ev.pageX, 'y': ev.pageY}
  let firstPointIndex = isPointClicked(downPos);
  if (firstPointIndex !== -1) { // paint used circle in Grey
    points[firstPointIndex].color = "Grey";
  } else {
    canvas.onmousemove = (ev) => {
      sticks.forEach((stick, index) => {
        let AB = stick.pointA.pos.distance(stick.pointB.pos);
        let AC = stick.pointA.pos.distance({'x': ev.pageX, 'y':ev.pageY});
        let CB = stick.pointB.pos.distance({'x': ev.pageX, 'y':ev.pageY});
        if (AC+CB-1 <= AB) {
          sticks.splice(index, 1);
        }

      });
    }
  }


  canvas.onmouseup = (ev) => {
    let upPos = {'x': ev.pageX, 'y': ev.pageY}
    let secondPointIndex = isPointClicked(upPos);
    if (firstPointIndex !== -1 && firstPointIndex === secondPointIndex ) { // lock the circle
      points[firstPointIndex].lock();
    } else if (firstPointIndex !== -1 && secondPointIndex !== -1) { // create stick between circles
      let firstPoint = points[firstPointIndex];
      let secondPoint = points[secondPointIndex];
      sticks.push(new Stick(firstPointIndex, secondPointIndex));
    } else if (secondPointIndex === -1 && posCompare(downPos, upPos)) { // create circle on empty space
      points.push(new Point(ev.pageX, ev.pageY));
    }

    if (firstPointIndex !== -1 && points[firstPointIndex].color === "Grey") {
      points[firstPointIndex].color = "Black"; // change active circle color to black
    }

    // Turn off onmousemove when mouse is up
    canvas.onmousemove = null;
  }
}

window.onkeypress = (ev) => {
  if(ev.key === 'f'){
    lastFrameTime = Date.now();
    gravityOn = !gravityOn;
    document.getElementById("gravity").innerHTML = gravityOn;
  }
}

setInterval(refresh, 1000 / 200);

