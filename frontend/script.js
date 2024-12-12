// init + set variables
var canvas = document.getElementById("canvas");
var c = canvas.getContext("2d"); // draw on canvas
canvas.width = 500;
canvas.height = 500;
var gravity = 0.1; // Gravity pulls balls downward
var damping = 0.9; // Reduces velocity after collisions
var friction = 0.98; // Reduces horizontal velocity to simulate ground friction

// Circle properties
var circleCenterX = canvas.width / 2;
var circleCenterY = canvas.height / 2;
var circleRadius = canvas.width / 2;

// return color of gumball
function colorGenerator() {
  var pastelcolors = ["#ffb3ba", "#ffdfba", "#ffffba", "#baffc9", "#bae1ff", "#ffd1dc"];
  return pastelcolors[Math.floor(Math.random() * pastelcolors.length)];
}

// Gumball class
function gumball() {
  this.color = colorGenerator();
  this.radius = 10;
  this.x = circleCenterX; // Spawn at center
  this.y = circleCenterY;
  this.dy = Math.random() * 2 - 1; // Small random velocity
  this.dx = Math.random() * 2 - 1;

  this.update = function() {
    c.beginPath();
    c.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
    c.fillStyle = this.color;
    c.fill();
  };

  this.checkBoundaryCollision = function() {
    // Distance from the center of the canvas
    var distFromCenter = Math.sqrt(
      (this.x - circleCenterX) ** 2 + (this.y - circleCenterY) ** 2
    );

    // Check if the ball is outside the circle
    if (distFromCenter + this.radius > circleRadius) {
      // Calculate overlap distance
      var overlap = distFromCenter + this.radius - circleRadius;

      // Push the ball back inside the circle
      var normalX = (this.x - circleCenterX) / distFromCenter;
      var normalY = (this.y - circleCenterY) / distFromCenter;

      this.x -= normalX * overlap;
      this.y -= normalY * overlap;

      // Reflect velocity based on the normal vector
      var dotProduct = this.dx * normalX + this.dy * normalY;
      this.dx -= 2 * dotProduct * normalX;
      this.dy -= 2 * dotProduct * normalY;

      // Reduce velocity slightly to simulate energy loss
      this.dx *= damping;
      this.dy *= damping;
    }
  };

  this.applyGravity = function() {
    // Apply gravity
    this.dy += gravity;

    // Friction reduces horizontal velocity
    this.dx *= friction;
  };

  this.checkBallCollision = function(other) {
    // Calculate the distance between two balls
    var distX = other.x - this.x;
    var distY = other.y - this.y;
    var distance = Math.sqrt(distX ** 2 + distY ** 2);

    // Check if the balls overlap
    if (distance < this.radius + other.radius) {
      // Resolve overlap by moving the balls apart
      var overlap = (this.radius + other.radius - distance) / 2;
      var angle = Math.atan2(distY, distX);

      this.x -= overlap * Math.cos(angle);
      this.y -= overlap * Math.sin(angle);

      other.x += overlap * Math.cos(angle);
      other.y += overlap * Math.sin(angle);

      // Reflect velocities
      var normalX = distX / distance;
      var normalY = distY / distance;

      var relativeVelocityX = this.dx - other.dx;
      var relativeVelocityY = this.dy - other.dy;

      var dotProduct = relativeVelocityX * normalX + relativeVelocityY * normalY;

      this.dx -= dotProduct * normalX;
      this.dy -= dotProduct * normalY;

      other.dx += dotProduct * normalX;
      other.dy += dotProduct * normalY;

      // Apply damping to reduce velocity
      this.dx *= damping;
      this.dy *= damping;
      other.dx *= damping;
      other.dy *= damping;
    }
  };
}

// Spawn gumballs
function spawnGumball() {
  return new gumball();
}

var bal = [];
for (var i = 0; i < 50; i++) {
  bal.push(spawnGumball());
}

function animate() {
  requestAnimationFrame(animate);
  c.clearRect(0, 0, canvas.width, canvas.height);

  // Draw the circular boundary
  c.beginPath();
  c.arc(circleCenterX, circleCenterY, circleRadius, 0, 2 * Math.PI);
  c.strokeStyle = "#000";
  c.lineWidth = 2;
  c.stroke();

  for (var i = 0; i < bal.length; i++) {
    bal[i].applyGravity();
    bal[i].checkBoundaryCollision();

    // Check collisions with other balls
    for (var j = i + 1; j < bal.length; j++) {
      bal[i].checkBallCollision(bal[j]);
    }

    bal[i].x += bal[i].dx;
    bal[i].y += bal[i].dy;

    bal[i].update();
  }
}

animate();

// Add new gumballs periodically
setInterval(function() {
  bal.push(spawnGumball());
  bal.splice(0, 1); // Remove the oldest gumball to maintain constant number
}, 400);
