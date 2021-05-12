import Blue from "./blue.png";
import Green from "./green.png";
import Purple from "./purple.png";
import Red from "./red.png";
import Yellow from "./yellow.png";

let canvas = document.getElementById("canvas");
let context = canvas.getContext("2d");

let playFieldWidth = 500;
let playFieldHeight = 500;
canvas.width = playFieldWidth;
canvas.height = playFieldHeight;

let cols = 8;
let rows = 8;
let k = 2;
let c = 4;

let itemSize = playFieldHeight / rows;

//условия
let movesToWin = 16;
let itemsToDestroy = 50;
let itemsToWin = 50;
let points = 0;

//цвета
let blue = new Image();
blue.src = Blue;
let green = new Image();
green.src = Green;
let purple = new Image();
purple.src = Purple;
let red = new Image();
red.src = Red;
let yellow = new Image();
yellow.src = Yellow;
let fillColors = [blue, green, purple, red, yellow];

//с = необходимое количество цветов (4)
fillColors = fillColors.slice(0, c);

var rects = [];

let playfield = document.querySelector('.playField')
let pointsField = document.querySelector('.points-counter')
let movesField = document.querySelector('.moves-counter')
let progressBar = document.querySelector('.progress-bar')
pointsField.innerHTML = points;
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
    this.pY = this.y
    this.pX = this.x
    this.animationStep = (this.y-this.pY)/10;
  }

  draw() {
    context.drawImage(fillColors[this.fillColor], this.x, this.y, this.height, this.width);
  };

  delete() {
    this.fillColor = null
    this.width = itemSize
    this.height = itemSize
    this.pX = this.x
    this.pY = this.y
    context.clearRect(this.x, this.y, this.width, this.height);
  }

  compress() {
    if (this.height>0+1) {
      context.clearRect(this.x, this.y, itemSize, itemSize);
      this.height -= itemSize/10
      this.width -= itemSize/10
      this.pX += (itemSize/2)/10
      this.pY += (itemSize/2)/10
      context.drawImage(fillColors[this.fillColor], this.pX, this.pY, this.height, this.width);
    } else {
      // this.height = itemSize
      // this.width = itemSize
      context.clearRect(this.x, this.y, this.width, this.height);
    }
  }

  getPosition() {
    return [this.pY, this.y]
  }

  getRow() {
    return this.row
  }

  moveDown() {
    this.row = this.row+1
    this.y = this.y + itemSize
    this.animationStep = (this.y-this.pY)/10;
  }

  moveUp() {
    this.row = this.row-1
    this.y = this.y - itemSize
    this.pY = this.y
    context.clearRect(this.x, this.y, this.width, this.height);
  }

  getCol() {
    return this.col
  }

  getColor() {
    return this.fillColor
  }

  itemClick(eventX, eventY) {
      return (eventX > this.x && eventX < this.x+itemSize && eventY > this.y && eventY < this.y+itemSize)
  }

  setColor(color) {
    this.fillColor = color;
    this.draw();
  }
  
  update() {
    if (this.pY>=this.y+1) {
      context.clearRect(this.x, this.y, this.width, this.height);
      context.drawImage(fillColors[this.fillColor], this.x, this.y, this.height, this.width);
    } else {
      context.clearRect(this.x, this.pY, this.width, this.height);
      this.pY += this.animationStep
      context.drawImage(fillColors[this.fillColor], this.x, this.pY, this.height, this.width);
    }
    
  }
}

function initPlayField() {
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      let rect = new fieldItem(i * itemSize, j * itemSize, itemSize, itemSize, getRndInteger(0, fillColors.length - 1), j, i);
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
    console.log('restructure')
  } 
  console.log(rects) 
}

yellow.onload = initPlayField
function checkArray(rects) {
  for (let r of rects) {
    if (checkItem(r).length>=k) {
      return true
    }
  }
  return false
}

//рандом для выбора цвета
function getRndInteger(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

//проверка поля на наличие комбинаций относительно элемента
function checkItem(r) {
  let visited = []
  let sameColorItems = []
  let queue = []
  
  queue.push(r);
  visited.push(r);
  sameColorItems.push(r);

  while(queue.length > 0) {
    //проверяем первый элемент в очереди
    let v = queue.shift()
    //находим соседние для него не посещенные элементы
    for (let item of rects) {
      if (!visited.includes(item)) {
        if ( Math.abs(item.getCol()-v.getCol()) == 1 && item.getRow() == v.getRow() 
        || ( Math.abs(item.getRow()-v.getRow()) == 1 && item.getCol() == v.getCol() )) {
          //добавляем их в список посещенных
          visited.push(item)
          //находим среди них элементы такого же цвета добавляем их в соответствующий список и в очередь для обработки 
          if (item.getColor()==v.getColor()) {
            sameColorItems.push(item)
            queue.push(item)                  
          } 
        } 
      }
    }         
  }
  return sameColorItems;
}

//проверка на "висящие" элементы
function floatingItemsCheck() {
  let floatingItems = []
  for (let floatingItem=0; floatingItem<rects.length-1; floatingItem++) {
    if (rects[floatingItem].getColor() != null && rects[floatingItem+1].getColor() == null 
    && rects[floatingItem+1].getCol() == rects[floatingItem].getCol() && (floatingItem+1)<=(rects.length-1)) {
      floatingItems.push(rects[floatingItem])
    }
  }
  return floatingItems;
}

let frame = 0;
function animateItemsFall() {
  for (let itemFalling=rects.length-1; itemFalling>=0; itemFalling--) {
    let position = rects[itemFalling].getPosition()
    if (position[0]<position[1]) {
      rects[itemFalling].update()              
    }            
  }
  frame++
  if (frame<=10) {
    requestAnimationFrame(animateItemsFall)
  } else {
    frame=0;
    //репопуляция поля
    populateEmptyItems(); 
    playfield.classList.toggle('disabled')
  }          
}

let sameColorItems = []
function animateDeletion() {
  for (let itemDeleted=sameColorItems.length-1; itemDeleted>=0; itemDeleted--) {
    let color = sameColorItems[itemDeleted].getColor()
    if (color!=undefined) {
      sameColorItems[itemDeleted].compress()              
    }            
  }
  frame++
  if (frame<=10) {
    requestAnimationFrame(animateDeletion)
  } else {
    frame=0;
    for (let itemDeleted=sameColorItems.length-1; itemDeleted>=0; itemDeleted--) {
      sameColorItems[itemDeleted].delete()                               
    }
    sameColorItems = []
  } 
          
}

//перемещение элементов после удаления
function itemFall() {
  let floatingItems = floatingItemsCheck()
  while (floatingItems.length>0) {
    for (let t=0; t<rects.length-1; t++) {
      if (rects[t].getColor() != null && rects[t+1].getColor() == null && rects[t+1].getCol() == rects[t].getCol() && (t+1)<=(rects.length-1)) {
        let x = 1;
        floatingItems.pop()
        //помашоговое перемещение элемента на одну позицию вниз если она пустая
        while ((t+x)<=(rects.length-1) && rects[t+x].getColor() == null && rects[t+x].getCol() == rects[t].getCol()) {
          rects[t].moveDown()
          rects[t+x].moveUp()
          x+=1
        }
        //сортировка обработанных элементов в массиве по строке
        let tempArray = rects.slice(t, t+x)
        .sort((a, b) => {return a.getRow() - b.getRow();})           
        rects.splice(t, x, ...tempArray)            
      }
    }
    floatingItems = floatingItemsCheck()
  }
  // console.log(rects)
  playfield.classList.toggle('disabled');
  requestAnimationFrame(animateItemsFall)
}

//репопуляция поля
function populateEmptyItems() {
  for (let emptyItem of rects) {
    if (emptyItem.getColor() == null) {
      setTimeout(emptyItem.setColor.bind(emptyItem), 300, (getRndInteger(0, fillColors.length - 1)))  
    }
  }
}

//бонусные очки за разрушение больше k элементов и за элементы разрушенные после достижения цели
function pointsCalc(sameColorItems) {
  let points = 0;
  if (itemsToDestroy <=0) {
    points += (sameColorItems-k)*30;
  } else {
    points = k * 10;
    if (sameColorItems > k) {
      points += (sameColorItems-k)*20;
    }
  }
  return points;
}

//обновление информации об игре
function infoUpdate() {
  itemsToDestroy=itemsToDestroy-sameColorItems.length
  movesToWin--;
  points+=pointsCalc(sameColorItems.length)  
  let progress = ((itemsToWin - itemsToDestroy)*100)/itemsToWin

  if (itemsToDestroy<=0) {
    pointsField.innerHTML = 0;
    pointsField.innerHTML = points 
    progressBar.style.width = 100 + "%"; 
  } else {
    pointsField.innerHTML = points
    progressBar.style.width = 100 + "%"; 
    progressBar.style.width = progress + "%";
  }  
  movesField.innerHTML = movesToWin;
}

//функция для вычесления координатов клика относительно canvas
function relMouseCoords(event){
  var totalOffsetX = 0;
  var totalOffsetY = 0;
  var canvasX = 0;
  var canvasY = 0;
  var currentElement = canvas;

  do{
      totalOffsetX += currentElement.offsetLeft - currentElement.scrollLeft;
      totalOffsetY += currentElement.offsetTop - currentElement.scrollTop;
  }
  while(currentElement = currentElement.offsetParent)

  canvasX = event.pageX - totalOffsetX;
  canvasY = event.pageY - totalOffsetY;

  return [canvasX, canvasY]
}

//обработка клика на элемент
canvas.addEventListener("click", (event) => {
  let coordinates = relMouseCoords(event)
  const x = coordinates[0];
  const y =coordinates[1];
  for (let r of rects) {
    let state = r.itemClick(x,y);
    if (state) {           
      sameColorItems = checkItem(r);
      if (sameColorItems.length >= k) {
        for (let i of sameColorItems) {
        }
        requestAnimationFrame(animateDeletion)
        //обновление поля info
        infoUpdate()
      }
      // //перемещение элементов после удаления
      setTimeout(itemFall, 800)
      // itemFall();            
    }
  }
  if (movesToWin==0) {
    playfield.classList.add('disabled')
  }     
});