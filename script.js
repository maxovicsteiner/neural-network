// DRAWING LOGIC
let conn_data = null;
async function setup() {
  try {
    const response = await fetch("http://localhost:3000/conn/data", {
      method: "GET",
    });
    conn_data = await response.json();
  } catch (error) {
    console.error(error.message);
  }
}
setup();
const canvas = document.getElementById("canvas");
const width = 28 * 10;
const height = 28 * 10;

// context of the canvas
const context = canvas.getContext("2d");
canvas.willReadFrequently = true;
context.imageSmoothingEnabled = true;
context.imageSmoothingQuality = "high";

// resize canvas (CSS does scale it up or down)
canvas.height = height;
canvas.width = width;

context.strokeStyle = "white";
// context.shadowColor = "grey";
// context.shadowBlur = 1;
context.lineWidth = 15;

function getMousePos(canvas, evt) {
  var rect = canvas.getBoundingClientRect(),
    scaleX = canvas.width / rect.width,
    scaleY = canvas.height / rect.height;

  return {
    x: (evt.clientX - rect.left) * scaleX,
    y: (evt.clientY - rect.top) * scaleY,
  };
}

let drawing = false;

function startDraw(e) {
  drawing = true;
  context.beginPath();
  draw(e);
}

function endDraw(e) {
  drawing = false;
}

function draw(e) {
  if (!drawing) return;

  let { x, y } = getMousePos(canvas, e);
  context.lineCap = "round";
  context.lineTo(x, y);
  context.stroke();

  // for smoother drawing
  //   context.beginPath();
  //   context.moveTo(x, y);
}

const p = document.getElementById("answer");
// Scale 140x140 to 28x28
const s_canvas = document.getElementById("scaled_canvas");
s_canvas.width = 28;
s_canvas.height = 28;
const sctx = s_canvas.getContext("2d");

function scale() {
  sctx.drawImage(canvas, 0, 0, canvas.width, canvas.height, 0, 0, 28, 28);
}

window.addEventListener("mousedown", (e) => {
  startDraw(e);
  scale();
});
window.addEventListener("mouseup", (e) => {
  endDraw(e);
  scale();
});
window.addEventListener("mousemove", (e) => {
  draw(e);
  scale();
});

// Get 28x28 image data
function getData() {
  let data = sctx.getImageData(0, 0, s_canvas.width, s_canvas.height);
  return data;
}

const submit = document.getElementById("submit");
submit.addEventListener("click", () => {
  main();
});

const reset = document.getElementById("reset");
reset.addEventListener("click", () => {
  reset_canvas();
});

function getAverage(r, g, b, _a) {
  return (r + g + b) / 3;
}

function main() {
  let { data } = getData();
  let image = [];
  for (let i = 0; i < data.length; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];
    image.push(getAverage(r, g, b));
  }

  let temp_row = [];
  let inputs = [];
  for (let i = 0; i < image.length; i++) {
    temp_row.push(image[i]);
    if (temp_row.length === 28) {
      inputs.push(temp_row);
      temp_row = [];
    }
  }
  // feed forward
  if (conn_data === null) {
    return;
  }
  let nn = new NeuralNetwork(784, 150, 150, 10, conn_data);
  let outputs = nn.feedforward(inputs);

  let temp = outputs[0];
  let guess = 0;

  for (let i = 0; i < outputs.length; i++) {
    if (outputs[i] > temp) {
      guess = i;
      temp = outputs[i];
    }
  }

  p.innerText = `We are ${Math.floor(
    outputs[guess] * 100
  )}% sure you wrote a ${guess}`;
}

function reset_canvas() {
  location.reload();
}
