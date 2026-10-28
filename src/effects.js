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
let lastDraw = 0;

const $streakCounter = document.querySelector(".streak-container .counter");
const $streakBar = document.querySelector(".streak-container .bar");
const $exclamations = document.querySelector(".streak-container .exclamations");
const $editor = document.querySelector("#editor");

const canvas = setupCanvas();
const canvasContext = canvas.getContext("2d");

if (typeof window.requestAnimationFrame === "function") {
    window.requestAnimationFrame(onFrame);
}

function setupCanvas() {
    const canvas = document.querySelector(".canvas-overlay");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    return canvas;
}

function onFrame(time) {
    drawParticles(time - lastDraw);
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
    canvasContext.clearRect(0, 0, canvas.width, canvas.height);

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
    shakeEditor,
    setPowerMode,
};
