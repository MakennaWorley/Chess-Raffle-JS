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

    this.update = function () {
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        c.fillStyle = this.color;
        c.fill();
    };

    this.checkBoundaryCollision = function () {
        var distFromCenter = Math.sqrt(
            (this.x - circleCenterX) ** 2 + (this.y - circleCenterY) ** 2
        );

        if (distFromCenter + this.radius > circleRadius) {
            var overlap = distFromCenter + this.radius - circleRadius;

            var normalX = (this.x - circleCenterX) / distFromCenter;
            var normalY = (this.y - circleCenterY) / distFromCenter;

            this.x -= normalX * overlap;
            this.y -= normalY * overlap;

            var dotProduct = this.dx * normalX + this.dy * normalY;
            this.dx -= 2 * dotProduct * normalX;
            this.dy -= 2 * dotProduct * normalY;

            this.dx *= damping;
            this.dy *= damping;
        }
    };

    this.applyGravity = function () {
        this.dy += gravity;
        this.dx *= friction;
    };

    this.checkBallCollision = function (other) {
        var distX = other.x - this.x;
        var distY = other.y - this.y;
        var distance = Math.sqrt(distX ** 2 + distY ** 2);

        if (distance < this.radius + other.radius) {
            var overlap = (this.radius + other.radius - distance) / 2;
            var angle = Math.atan2(distY, distX);

            this.x -= overlap * Math.cos(angle);
            this.y -= overlap * Math.sin(angle);

            other.x += overlap * Math.cos(angle);
            other.y += overlap * Math.sin(angle);

            var normalX = distX / distance;
            var normalY = distY / distance;

            var relativeVelocityX = this.dx - other.dx;
            var relativeVelocityY = this.dy - other.dy;

            var dotProduct = relativeVelocityX * normalX + relativeVelocityY * normalY;

            this.dx -= dotProduct * normalX;
            this.dy -= dotProduct * normalY;

            other.dx += dotProduct * normalX;
            other.dy += dotProduct * normalY;

            this.dx *= damping;
            this.dy *= damping;
            other.dx *= damping;
            other.dy *= damping;
        }
    };
}

// Fetch the count of remaining entries from the server
async function getEntryCount() {
    try {
        const response = await fetch("http://localhost:5555/api/entryCount");
        if (response.ok) {
            const data = await response.json();
            return data.remainingEntries;
        } else {
            console.error("Failed to fetch entry count.");
            return 0;
        }
    } catch (error) {
        console.error("Error fetching entry count:", error);
        return 0;
    }
}

// Fetch a random entry from the server
async function getRandomEntry() {
    try {
        const response = await fetch("http://localhost:5555/api/spin");
        if (response.ok) {
            return await response.json();
        } else {
            console.log("No more entries left.");
            return null;
        }
    } catch (error) {
        console.error("Error fetching entry:", error);
        return null;
    }
}

// Spawn a gumball with server-provided entry data
async function spawnGumballFromServer() {
    const entry = await getRandomEntry();
    if (entry) {
        const ball = new gumball();
        ball.color = colorGenerator();
        ball.data = entry.data;
        return ball;
    }
    return null;
}

// Spawn gumballs based on entry count
async function spawnInitialGumballs() {
    const entryCount = await getEntryCount();
    console.log(`Spawning ${entryCount} gumballs based on entries.`);
    for (let i = 0; i < entryCount; i++) {
        const newBall = await spawnGumballFromServer();
        if (newBall) {
            bal.push(newBall);
        }
    }
}

// Animation loop
var bal = [];
function animate() {
    requestAnimationFrame(animate);
    c.clearRect(0, 0, canvas.width, canvas.height);

    c.beginPath();
    c.arc(circleCenterX, circleCenterY, circleRadius, 0, 2 * Math.PI);
    c.strokeStyle = "#000";
    c.lineWidth = 2;
    c.stroke();

    for (var i = 0; i < bal.length; i++) {
        bal[i].applyGravity();
        bal[i].checkBoundaryCollision();

        for (var j = i + 1; j < bal.length; j++) {
            bal[i].checkBallCollision(bal[j]);
        }

        bal[i].x += bal[i].dx;
        bal[i].y += bal[i].dy;

        bal[i].update();
    }
}

// Initialize the canvas with gumballs
(async function initializeGumballs() {
    await spawnInitialGumballs();
    animate();
})();
