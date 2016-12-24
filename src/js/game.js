'use strict';

function Game(size) {
  const colorBg = '#b2dfdb';
  const width = 600;
  const height = 400;
  const cols = Math.floor(width / size);
  const rows = Math.floor(height / size);
  const dom = {};
  let generations = 0;
  let frameRate = 30;
  let interval = Math.floor(1000 / frameRate);
  let intervalId = 0;
  let cells = [];
  let running = false;
  let canvas;
  let ctx;

  function init() {
    cacheDom();
    generateGrid();
    bindEvents();
    canvas = dom.game;
    ctx = canvas.getContext('2d');
  }

  function cacheDom() {
    dom.game = document.getElementById('game');
    dom.start = document.getElementById('start');
    dom.clear = document.getElementById('clear');
    dom.generations = document.getElementById('generations');
  }

  function bindEvents() {
    dom.start.addEventListener('click', toggleGeneration);
    dom.clear.addEventListener('click', clear);
    dom.game.addEventListener('click', updateCell);
  }

  function generateGrid() {
    for (let i = 0; i < rows; i++) {
      let row = [];
      for (let j = 0; j < cols; j++) {
        row.push(Cell(j*size, i*size, size));
      }
      cells.push(row);
    }
  }

  function draw() {
    renderBackground(ctx);
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        cells[i][j].render(ctx);
      }
    }
    updateGenerations();
  }

  function renderBackground(ctx) {
    ctx.canvas.width = width;
    ctx.canvas.height = height;
    ctx.fillStyle = colorBg;
    ctx.rect(0, 0, width, height);
    ctx.fill();
  }

  function toggleGeneration() {
    clearInterval(intervalId);
    running = !running;
    toggleButton();
    if (!running) {
      return;
    }
    intervalId = setInterval(update, interval);
  }

  function toggleButton() {
    if (dom.start.innerText === 'Start') {
      dom.start.classList.add('stop');
      dom.start.innerText = 'Stop';
    }
    else {
      dom.start.classList.remove('stop');
      dom.start.innerText = 'Start';
    }
  }

  function clear() {
    cells = [];
    generations = 0;
    generateGrid();
    draw();
  }

  function update() {
    updateNeighbors();
    updateStates();
    draw();
  }

  function updateCell(event) {
    let pos = getCursorPosition(event);
    let i = Math.floor(pos.x / size);
    let j = Math.floor(pos.y / size);
    cells[j][i].toggleAlive();
    cells[j][i].render(ctx);
  }

  function getCursorPosition(event) {
    let x = event.pageX - game.offsetLeft;
    let y = event.pageY - game.offsetTop;
    return {x, y};
  }

  function updateNeighborsForCell(i, j) {
    let cell = cells[i][j];
    const indices = [[i - 1, j - 1], [i, j - 1], [i + 1, j - 1], [i + 1, j], [i + 1, j + 1], [i, j + 1], [i - 1, j + 1], [i - 1, j]];
    cell.resetNeighbors();
    for (let i = 0; i < indices.length; i++) {
      let x = indices[i][0];
      let y = indices[i][1];
      if (x >= 0 && x < rows && y >= 0 && y < cols) {
        if (cells[x][y].isAlive()) {
          cell.addNeighbor(1);
        }
      }
    }
  }

  function updateNeighbors() {
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        updateNeighborsForCell(i, j);
      }
    }
  }

  function updateStates() {
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        let cell = cells[i][j];
        cell.updateState();
      }
    }
  }

  function updateGenerations() {
    generations += 1;
    dom.generations.innerText = generations;
  }

  init();

  return {
    draw
  }
}

function Cell(x, y, size) {
  const colorAlive = '#ff4436';
  const colorVisited = 'rgba(0, 0, 0, 0.1)';
  let alive = Math.random() > 0.75;
  let visited = alive;
  let neighbors = 0;

  function addNeighbor(num) {
    neighbors += num;
  }

  function resetNeighbors() {
    neighbors = 0;
  }

  function isUnderPopulated() {
    return neighbors < 2;
  }

  function isOverPopulated() {
    return neighbors > 3;
  }

  function isResurrected() {
    return neighbors === 3;
  }

  function updateState() {
    if (isOverPopulated() || isUnderPopulated()) {
      alive = false;
    }
    else if (isResurrected()) {
      alive = true;
    }
  }

  function render(ctx) {
    ctx.clearRect(x, y, size, size);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 0.25;
    if (alive) {
      visited = true;
      ctx.fillStyle = colorAlive;
    }
    else if (visited) {
      ctx.fillStyle = colorVisited;
    }
    else {
      ctx.fillStyle = 'transparent';
    }
    ctx.fillRect(x, y, size, size);
    ctx.strokeRect(x, y, size, size);
  }

  return {
    isAlive: _ => alive,
    toggleAlive: _ => alive = !alive,
    addNeighbor,
    resetNeighbors,
    updateState,
    render
  }
}

document.addEventListener('DOMContentLoaded', function(e) {
  // size should be number of rows/cols, not the size of the cell
  const game = Game(15);
  game.draw();
});
