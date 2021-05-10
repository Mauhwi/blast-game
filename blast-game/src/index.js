import Blue from './blue.png';
import Green from './green.png';
import Purple from './purple.png';
import Red from './red.png';
import Yellow from './yellow.png';


let canvas = document.getElementById("canvas");
let context = canvas.getContext("2d");

let playFieldWidth = 400;
let playFieldHeight = 400;
canvas.width = playFieldWidth;
canvas.height = playFieldHeight;

let cols = 5;
let rows = 5;
let k = 2;
let c = 4;

let itemSize = playFieldHeight / rows;

//условия
let movesToWin = 10;
let itemsToDestroy = 30;

//цвета
let blue = new Image();
blue.src = Blue;
let green = new Image();
green.src = Green
let purple = new Image();
purple.src = Purple
let red = new Image();
red.src = Red
let yellow = new Image();
yellow.src = Yellow;
let fillColors = [blue, green, purple, red, yellow];

//с = необходимое количество цветов (4)
fillColors = fillColors.slice(0, c);

var rects = [];

let pointsField = document.querySelector(".points-counter");
let movesField = document.querySelector(".moves-counter");
pointsField.innerHTML = itemsToDestroy;
movesField.innerHTML = movesToWin;

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
    context.drawImage(
      fillColors[this.fillColor],
      this.x,
      this.y,
      this.height,
      this.width
    );
  }

  delete() {
    this.fillColor = null;
    context.clearRect(this.x, this.y, this.width, this.height);
  }

  getRow() {
    return this.row;
  }

  moveDown() {
    this.row = this.row + 1;
    this.y = this.y + itemSize;
    this.update();
  }

  moveUp() {
    this.row = this.row - 1;
    this.y = this.y - itemSize;
    context.clearRect(this.x, this.y, this.width, this.height);
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
  console.log(rects);
}

yellow.onload = initPlayField;
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

//проверка на "висящие" элементы
function floatingItemsCheck() {
  let floatingItems = [];
  for (let floatingItem = 0; floatingItem < rects.length - 1; floatingItem++) {
    if (
      rects[floatingItem].getColor() != null &&
      rects[floatingItem + 1].getColor() == null &&
      rects[floatingItem + 1].getCol() == rects[floatingItem].getCol() &&
      floatingItem + 1 <= rects.length - 1
    ) {
      floatingItems.push(rects[floatingItem]);
    }
  }
  return floatingItems;
}

//перемещение элементов после удаления
function itemFall() {
  let floatingItems = floatingItemsCheck();
  while (floatingItems.length > 0) {
    for (let t = 0; t < rects.length - 1; t++) {
      if (
        rects[t].getColor() != null &&
        rects[t + 1].getColor() == null &&
        rects[t + 1].getCol() == rects[t].getCol() &&
        t + 1 <= rects.length - 1
      ) {
        let x = 1;
        floatingItems.pop();
        //помашоговое перемещение элемента на одну позицию вниз если она пустая
        while (
          t + x <= rects.length - 1 &&
          rects[t + x].getColor() == null &&
          rects[t + x].getCol() == rects[t].getCol()
        ) {
          rects[t].moveDown();
          rects[t + x].moveUp();
          x += 1;
        }
        //сортировка обработанных элементов в массиве по строке
        let tempArray = rects.slice(t, t + x).sort((a, b) => {
          return a.getRow() - b.getRow();
        });
        rects.splice(t, x, ...tempArray);
      }
    }
    floatingItems = floatingItemsCheck();
  }
}

//репопуляция поля
function populateEmptyItems() {
  for (let emptyItem of rects) {
    if (emptyItem.getColor() == null) {
      setTimeout(
        emptyItem.setColor.bind(emptyItem),
        600,
        getRndInteger(0, fillColors.length - 1)
      );
    }
  }
}

//обновление поля info
function infoUpdate(sameColorItems) {
  itemsToDestroy = itemsToDestroy - sameColorItems.length;
  movesToWin--;
  if (itemsToDestroy < 0) {
    pointsField.innerHTML = 0;
  } else {
    pointsField.innerHTML = itemsToDestroy;
  }
  movesField.innerHTML = movesToWin;
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
          //удалить с canvas
          i.delete();
        }
        //обновление поля info
        infoUpdate(sameColorItems);
      }

      //перемещение элементов после удаления
      itemFall();

      //репопуляция поля
      populateEmptyItems();
    }
  }
});
