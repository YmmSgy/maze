"use strict";

// performs in-place shuffle of array arr
function shuffle(arr) {
  // Fisher-Yates shuffle

  // Initially, the pool is the entire array. On each iteration, a random
  // element in the pool is swapped with the last element of the pool, and the
  // last element is removed from the pool. This continues until the pool is
  // left with only the first element.

  // iterate from back to front
  for (let i = arr.length - 1; i > 0; --i) {
    // generate random index within the pool (0 to i inclusive)
    const r = Math.floor(Math.random() * (i + 1));

    // swap items at r and i
    const tmp = arr[r];
    arr[r] = arr[i];
    arr[i] = tmp;
  }
}

class Vec2 {
  x;
  y;

  static zero = new Vec2(0, 0);
  static north = new Vec2(0, -1);
  static south = new Vec2(0, 1);
  static east = new Vec2(1, 0);
  static west = new Vec2(-1, 0);

  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
  static equals(a, b) {
    return a.x === b.x && a.y === b.y;
  }
  static add(a, b) {
    return new Vec2(a.x + b.x, a.y + b.y);
  }
}

class Maze {
  width;
  height;
  tiles;
  visitedTiles;

  constructor(w, h) {
    this.width = w;
    this.height = h;

    // initialise tiles with top and left walls
    this.tiles = [];
    for (let y = 0; y < this.width; ++y) {
      this.tiles.push([]);
      for (let x = 0; x < this.height; ++x) {
        this.tiles[y][x] = { topWall: true, leftWall: true };
      }
    }

    // set starting tile for maze generation
    this.visitedTiles = [new Vec2(0, 0)];
  }

  // creates a new maze
  generate() {
    // copy the starting tile from visited tiles
    const activeTiles = this.visitedTiles.slice();

    // repeat while there are still more paths to explore
    while (activeTiles.length > 0) {
      // set current tile as the latest active tile
      const curTile = activeTiles.at(-1);

      // shuffle directions
      const dirs = [Vec2.north, Vec2.south, Vec2.west, Vec2.east];
      shuffle(dirs);

      // find a valid direction from current tile
      const foundDir = dirs.find((dir) => this.isValid(Vec2.add(curTile, dir)));

      // if valid direction was found
      if (foundDir != null) {
        // link the tiles in that direction
        this.removeWall(curTile, foundDir);

        // record the new tile for backtracking and path exclusion
        const nextTile = Vec2.add(curTile, foundDir);
        activeTiles.push(nextTile);
        this.visitedTiles.push(nextTile);
      } else {
        // backtrack if valid direction was not found
        activeTiles.pop();
      }
    }
  }

  removeWall(curTile, dir) {
    // remove the respective wall from current tile
    if (Vec2.equals(dir, Vec2.north)) {
      this.tiles[curTile.y][curTile.x].topWall = false;
    } else if (Vec2.equals(dir, Vec2.south)) {
      this.tiles[curTile.y + 1][curTile.x].topWall = false;
    } else if (Vec2.equals(dir, Vec2.west)) {
      this.tiles[curTile.y][curTile.x].leftWall = false;
    } else if (Vec2.equals(dir, Vec2.east)) {
      this.tiles[curTile.y][curTile.x + 1].leftWall = false;
    }
  }

  // check if the given tile can be linked to
  isValid(tile) {
    // to be valid, tile must not equal any of the visited tiles
    const isVisited = this.visitedTiles.some((visitedTile) =>
      Vec2.equals(tile, visitedTile)
    );

    // to be valid, tile must be within range
    const withinRangeX = 0 <= tile.x && tile.x < this.width;
    const withinRangeY = 0 <= tile.y && tile.y < this.height;

    return !isVisited && withinRangeX && withinRangeY;
  }

  // draw the maze on the given canvas
  draw(ctx, strokeStyle, lineWidth) {
    const tileW = ctx.canvas.width / this.width;
    const tileH = ctx.canvas.height / this.height;
    ctx.strokeStyle = strokeStyle;
    ctx.fillStyle = strokeStyle;
    ctx.lineWidth = lineWidth;

    // for every tile
    for (let y = 0; y < this.height; ++y) {
      for (let x = 0; x < this.width; ++x) {
        // fill in the top left corner
        ctx.fillRect(
          x * tileW - lineWidth / 2,
          y * tileH - lineWidth / 2,
          lineWidth,
          lineWidth
        );

        // draw the top wall or the left wall, or both
        const tile = this.tiles[y][x];
        if (tile.topWall) {
          ctx.beginPath();
          ctx.moveTo(x * tileW, y * tileH);
          ctx.lineTo((x + 1) * tileW, y * tileH);
          ctx.stroke();
        }
        if (tile.leftWall) {
          ctx.beginPath();
          ctx.moveTo(x * tileW, y * tileH);
          ctx.lineTo(x * tileW, (y + 1) * tileH);
          ctx.stroke();
        }
      }
    }

    // draw a border around the maze
    ctx.lineWidth = lineWidth * 2;
    ctx.strokeRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  }
}

const ctx = document.getElementsByTagName("canvas")[0].getContext("2d");
const maze = new Maze(16, 16);

const t0 = Date.now();

maze.generate();
maze.draw(ctx, "black", 2);

const t1 = Date.now();
console.log(`maze generated in ${t1 - t0}ms`);
