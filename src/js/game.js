'use strict';

function Cell() {
  let alive = Math.random() > 0.75;
  let visited = alive;
  let neighbors = 0;

  function addNeighbor(x) {
    neighbors += x;
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

  return {
    alive,
    visited,
    neighbors: _ => neighbors,
    addNeighbor,
    resetNeighbors,
    isUnderPopulated,
    isOverPopulated,
    isResurrected
  }
}

function Game(size) {
  const width = 600;
  const height = 400;
  const cols = Math.floor(width / size);
  const rows = Math.floor(height / size);
  const colorBg = '#c5cae9';
  const colorAlive = '#03a9f4';
  const colorVisited = '#b3e5fc';
  let isPaused = false;
  let speed = 35;
  let grid = generateGrid();

  function generateGrid() {
    let grid = [];
    for (let i = 0; i < rows; i++) {
      let row = [];
      for (let j = 0; j < cols; j++) {
        row.push(Cell());
      }
      grid.push(row);
    }
    return grid;
  }

  function draw() {
    const canvas = document.getElementById('game');
    const ctx = canvas.getContext('2d');
    // background
    ctx.canvas.width = width;
    ctx.canvas.height = height;
    ctx.fillStyle = colorBg;
    ctx.rect(0, 0, width, height);
    ctx.fill();

    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        let cell = grid[i][j];
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 0.25;
        if (cell.alive) {
          ctx.fillStyle = colorAlive;
        }
        else if (cell.visited) {
          ctx.fillStyle = colorVisited;
        }
        else {
          ctx.fillStyle = '#fff';
        }
        ctx.fillRect(j * size, i * size, size, size);
        ctx.strokeRect(j * size, i * size, size, size);
      }
    }
  }

  function updateNeighborsForCell(i, j) {
    let cell = grid[i][j];
    const indices = [[i - 1, j - 1], [i, j - 1], [i + 1, j - 1], [i + 1, j], [i + 1, j + 1], [i, j + 1], [i - 1, j + 1], [i - 1, j]];
    cell.resetNeighbors();
    if (cell.alive) {
      cell.visited = 1;
    }
    for (let i = 0; i < indices.length; i++) {
      let x = indices[i][0];
      let y = indices[i][1];
      if (x >= 0 && x < rows && y >= 0 && y < cols) {
        if (grid[x][y].alive) {
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

  function updateStateForCell(i, j) {
    let cell = grid[i][j];
    if (cell.isOverPopulated() || cell.isUnderPopulated()) {
      cell.alive = 0;
    }
    else if (cell.isResurrected()) {
      cell.alive = 1;
    }
  }

  function updateStates() {
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        updateStateForCell(i, j);
      }
    }
  }
  return {
    draw,
    updateNeighbors,
    updateStates,
    speed
  }
}

document.addEventListener('DOMContentLoaded', function(e) {
  const game = Game(10);
  game.draw();

  let interval = setInterval(function() {
    game.draw();
    game.updateNeighbors();
    game.updateStates();
  }, game.speed);
});
