import _ from "lodash";

let canvas = document.getElementById("canvas");
let context = canvas.getContext("2d");

let playFieldWidth = 600;
let playFieldHeight = 600;
let cols = 4;
let rows = 4;
let k = 2;
let c = 4;

let itemSize = 100;

//цвета
let green = "rgb(0,153,76)";
let red = "rgb(153,0,0)";
let blue = "rgb(0,102,204)";
let pink = "rgb(153,0,76)";
let grey = "rgb(60,70,76)";
let fillColors = [green, red, blue, pink, grey];

//с = необходимое количество цветов (4)
fillColors = fillColors.slice(0, c);

var rects = [];

class fieldItem {
  constructor(x, y, width, height, fillColor, row, col) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.fillColor = fillColor;
    this.row = row;
    this.col = col;
  }

  draw() {
    context.strokeStyle = "rgba(255, 255, 255, 0.5)";
    context.fillStyle = fillColors[this.fillColor];
    context.fillRect(this.x, this.y, this.width, this.height);
  }

  delete() {
    context.strokeStyle = "rgba(255, 255, 255, 0.5)";
    context.fillStyle = "rgba(255, 255, 255)";
    context.fillRect(this.x, this.y, this.width, this.height);
  }

  getRow() {
    return this.row;
  }

  getCol() {
    return this.col;
  }

  getColor() {
    return this.fillColor;
  }

  itemClick(eventX, eventY) {
    return (
      eventX > this.x &&
      eventX < this.x + itemSize &&
      eventY > this.y &&
      eventY < this.y + itemSize
    );
  }

  setColor(color) {
    this.fillColor = color;
    this.update();
  }

  update() {
    this.draw();
  }
}

function initPlayField() {
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      let rect = new fieldItem(
        i * itemSize,
        j * itemSize,
        itemSize,
        itemSize,
        getRndInteger(0, fillColors.length - 1),
        j,
        i
      );
      rects.push(rect);
      // rect.draw();
    }
  }
  if (checkArray(rects)) {
    for (let r of rects) {
      r.draw();
    }
  } else {
    rects = [];
    initPlayField();
    console.log("restructure");
  }
}

window.onload = initPlayField();

function checkArray(rects) {
  for (let r of rects) {
    if (checkItem(r).length >= k) {
      return true;
    }
  }
  return false;
}

//рандом для выбора цвета
function getRndInteger(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

//проверка поля на наличие комбинаций относительно элемента
function checkItem(r) {
  let visited = [];
  let sameColorItems = [];
  let queue = [];

  queue.push(r);
  visited.push(r);
  sameColorItems.push(r);

  while (queue.length > 0) {
    //проверяем первый элемент в очереди
    let v = queue.shift();
    //находим соседние для него не посещенные элементы
    for (let item of rects) {
      if (!visited.includes(item)) {
        if (
          (Math.abs(item.getCol() - v.getCol()) == 1 &&
            item.getRow() == v.getRow()) ||
          (Math.abs(item.getRow() - v.getRow()) == 1 &&
            item.getCol() == v.getCol())
        ) {
          //добавляем их в список посещенных
          visited.push(item);
          //находим среди них элементы такого же цвета добавляем их в соответствующий список и в очередь для обработки
          if (item.getColor() == v.getColor()) {
            sameColorItems.push(item);
            queue.push(item);
          }
        }
      }
    }
  }
  return sameColorItems;
}

//обработка клика на элемент
canvas.addEventListener("click", (event) => {
  const x = event.clientX;
  const y = event.clientY;
  for (let r of rects) {
    let state = r.itemClick(x, y);
    if (state) {
      let sameColorItems = checkItem(r);
      if (sameColorItems.length >= k) {
        for (let i of sameColorItems) {
          i.delete();
          setTimeout(
            i.setColor.bind(i),
            600,
            getRndInteger(0, fillColors.length - 1)
          );
        }
      }
    }
  }
});
