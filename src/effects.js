import _ from "underscore";
import { EXCLAMATIONS } from "./config.js";

const MAX_PARTICLES = 500;
const PARTICLE_NUM_RANGE = [5, 6, 7, 8, 9, 10, 11, 12];
const PARTICLE_GRAVITY = 0.01;
const PARTICLE_SIZE = 8;
const PARTICLE_ALPHA_FADEOUT = 0.96;
const PARTICLE_VELOCITY_RANGE = {
    x: [-2.5, 2.5],
    y: [-7, -3.5],
};

const MAX_LASERS = 30;
const LASER_ANGLE_RANGE = [-90, 90]; // degrees from straight right, negative is up
const LASER_SPEED_RANGE = [18, 30]; // pixels per frame
const LASER_NUM_RANGE = [2, 3, 4]; // lasers fired per shot
const LASER_LENGTH_RANGE = [10, 22]; // number of trail points
const LASER_WIDTH_RANGE = [5, 12];
const LASER_GLOW = 25;
const LASER_CORE_WIDTH = 0.35; // white core, as a share of the laser width
// Neon colors, a random one is picked for each laser
const LASER_COLORS = [
    [255, 0, 85],
    [255, 140, 0],
    [255, 230, 0],
    [0, 255, 120],
    [0, 221, 255],
    [80, 120, 255],
    [200, 60, 255],
    [255, 60, 200],
];
const LASER_ALPHA_FADEOUT = 0.88; // applied every frame after the bounce

const PARTICLE_COLORS = {
    text: [255, 255, 255],
    "text.xml": [255, 255, 255],
    keyword: [0, 221, 255],
    variable: [0, 221, 255],
    "meta.tag.tag-name.xml": [0, 221, 255],
    "keyword.operator.attribute-equals.xml": [0, 221, 255],
    constant: [249, 255, 0],
    "constant.numeric": [249, 255, 0],
    "support.constant": [249, 255, 0],
    "string.attribute-value.xml": [249, 255, 0],
    "string.unquoted.attribute-value.html": [249, 255, 0],
    "entity.other.attribute-name.xml": [129, 148, 244],
    comment: [0, 255, 121],
    "comment.xml": [0, 255, 121],
};

const particles = [];
let particlePointer = 0;
const lasers = [];
let lastDraw = 0;

const $streakCounter = document.querySelector(".streak-container .counter");
const $streakBar = document.querySelector(".streak-container .bar");
const $exclamations = document.querySelector(".streak-container .exclamations");
const $editor = document.querySelector("#editor");

const $canvas = setupCanvas();
const canvasContext = $canvas.getContext("2d");

if (typeof window.requestAnimationFrame === "function") {
    window.requestAnimationFrame(onFrame);
}

function setupCanvas() {
    const $canvas = document.querySelector(".canvas-overlay");
    $canvas.width = window.innerWidth;
    $canvas.height = window.innerHeight;
    return $canvas;
}

function onFrame(time) {
    drawParticles(time - lastDraw);
    drawLasers();
    lastDraw = time;
    return typeof window.requestAnimationFrame === "function"
        ? window.requestAnimationFrame(onFrame)
        : undefined;
}

function renderStreak(streak) {
    $streakCounter.textContent = streak;
    $streakCounter.classList.remove("bump");

    return _.defer(() => {
        return $streakCounter.classList.add("bump");
    });
}

function refreshStreakBar(timeout) {
    $streakBar.style.transform = "scaleX(1)";
    $streakBar.style.transition = "none";

    return _.defer(() => {
        $streakBar.style.transform = "";
        return ($streakBar.style.transition = `all ${timeout}ms linear`);
    });
}

function showExclamation() {
    const $exclamation = document.createElement("span");
    $exclamation.classList.add("exclamation");
    $exclamation.textContent = _.sample(EXCLAMATIONS);

    $exclamations.prepend($exclamation);
    return setTimeout(() => $exclamation.remove(), 3000);
}

function burstParticles(x, y, type) {
    const numParticles = _(PARTICLE_NUM_RANGE).sample();
    const color = getParticleColor(type);
    return _(numParticles).times(() => {
        particles[particlePointer] = createParticle(x, y, color);
        return (particlePointer = (particlePointer + 1) % MAX_PARTICLES);
    });
}

function getParticleColor(type) {
    return PARTICLE_COLORS[type] || [255, 255, 255];
}

function createParticle(x, y, color) {
    return {
        x,
        y: y + 10,
        alpha: 1,
        color,
        velocity: {
            x:
                PARTICLE_VELOCITY_RANGE.x[0] +
                Math.random() * (PARTICLE_VELOCITY_RANGE.x[1] - PARTICLE_VELOCITY_RANGE.x[0]),
            y:
                PARTICLE_VELOCITY_RANGE.y[0] +
                Math.random() * (PARTICLE_VELOCITY_RANGE.y[1] - PARTICLE_VELOCITY_RANGE.y[0]),
        },
    };
}

function drawParticles(timeDelta) {
    canvasContext.clearRect(0, 0, $canvas.width, $canvas.height);

    return (() => {
        const result = [];
        for (let particle of Array.from(particles)) {
            if (particle.alpha <= 0.1) {
                continue;
            }

            particle.velocity.y += PARTICLE_GRAVITY;
            particle.x += particle.velocity.x;
            particle.y += particle.velocity.y;
            particle.alpha *= PARTICLE_ALPHA_FADEOUT;

            canvasContext.fillStyle = `rgba(${particle.color.join(", ")}, ${particle.alpha})`;
            result.push(
                canvasContext.fillRect(
                    Math.round(particle.x - PARTICLE_SIZE / 2),
                    Math.round(particle.y - PARTICLE_SIZE / 2),
                    PARTICLE_SIZE,
                    PARTICLE_SIZE,
                ),
            );
        }
        return result;
    })();
}

function randomInRange([min, max]) {
    return min + Math.random() * (max - min);
}

// type is the token type, not used for now since lasers pick from LASER_COLORS
function fireLaser(x, y, type) {
    _(_(LASER_NUM_RANGE).sample()).times(() => createLaser(x, y));
}

function createLaser(x, y) {
    if (lasers.length >= MAX_LASERS) {
        lasers.shift();
    }

    const angle = (randomInRange(LASER_ANGLE_RANGE) * Math.PI) / 180;
    const speed = randomInRange(LASER_SPEED_RANGE);
    const start = { x, y: y + 10 };

    lasers.push({
        head: { ...start },
        trail: [start],
        velocity: { x: Math.cos(angle) * speed, y: Math.sin(angle) * speed },
        length: Math.round(randomInRange(LASER_LENGTH_RANGE)),
        width: randomInRange(LASER_WIDTH_RANGE),
        color: _(LASER_COLORS).sample(),
        alpha: 1,
        bounced: false,
    });
}

function moveLaser(laser) {
    const { head, velocity } = laser;
    head.x += velocity.x;
    head.y += velocity.y;

    // Bounce once off the first edge hit, then start fading
    if (!laser.bounced) {
        if (head.x >= $canvas.width) {
            head.x = $canvas.width;
            velocity.x = -velocity.x;
            laser.bounced = true;
        }
        if (head.y <= 0 || head.y >= $canvas.height) {
            head.y = Math.min(Math.max(head.y, 0), $canvas.height);
            velocity.y = -velocity.y;
            laser.bounced = true;
        }
    } else {
        laser.alpha *= LASER_ALPHA_FADEOUT;
    }

    laser.trail.push({ ...head });
    if (laser.trail.length > laser.length) {
        laser.trail.shift();
    }
}

function drawLasers() {
    for (let i = lasers.length - 1; i >= 0; i--) {
        const laser = lasers[i];
        moveLaser(laser);

        if (laser.alpha <= 0.05) {
            lasers.splice(i, 1);
            continue;
        }

        const color = laser.color.join(", ");
        canvasContext.save();
        canvasContext.strokeStyle = `rgba(${color}, ${laser.alpha})`;
        canvasContext.shadowColor = `rgba(${color}, ${laser.alpha})`;
        canvasContext.shadowBlur = LASER_GLOW;
        canvasContext.lineWidth = laser.width;
        canvasContext.lineCap = "round";
        canvasContext.lineJoin = "round";
        canvasContext.beginPath();
        laser.trail.forEach((point, index) =>
            index === 0 ? canvasContext.moveTo(point.x, point.y) : canvasContext.lineTo(point.x, point.y),
        );
        canvasContext.stroke();

        // Bright white core on top of the colored beam
        canvasContext.shadowBlur = 0;
        canvasContext.strokeStyle = `rgba(255, 255, 255, ${laser.alpha})`;
        canvasContext.lineWidth = laser.width * LASER_CORE_WIDTH;
        canvasContext.stroke();
        canvasContext.restore();
    }
}

function shakeEditor(intensity) {
    const x = intensity * (Math.random() > 0.5 ? -1 : 1);
    const y = intensity * (Math.random() > 0.5 ? -1 : 1);

    $editor.style.margin = `${y}px ${x}px`;

    return setTimeout(() => {
        return ($editor.style.margin = "");
    }, 75);
}

function setPowerMode(on) {
    return document.body.classList.toggle("power-mode", on);
}

export {
    renderStreak,
    refreshStreakBar,
    showExclamation,
    burstParticles,
    fireLaser,
    shakeEditor,
    setPowerMode,
};
