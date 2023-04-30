const IMG_DIMENSIONS = 28 * 28;

// async function main() {
//   try {
//     let nn = new NeuralNetwork(IMG_DIMENSIONS, 150, 150, 10);

//     for (let i = 0; i < 59000; i++) {
//       let response = await fetch("http://localhost:3000/files/training", {
//         method: "GET",
//       });
//       let data = await response.json();
//       let inputs = data[0];
//       let desired = Array(10).fill(0);
//       desired[data[1]] = 1;
//       nn.train(inputs, desired);
//       if ((i + 1) % 100 === 0) {
//         console.log("Epoch: " + (i + 1));
//       }
//     }
//     console.clear();
//     let correct = 0;
//     for (let i = 0; i < 10000; i++) {
//       let response = await fetch("http://localhost:3000/files/test", {
//         method: "GET",
//       });
//       let data = await response.json();
//       let inputs = data[0];
//       let desired = Array(10).fill(0);
//       desired[data[1]] = 1;
//       let outputs = nn.feedforward(inputs);
//       let temp = outputs[0];
//       let guess = 0;
//       for (let j = 0; j < outputs.length; j++) {
//         if (outputs[j] > temp) {
//           temp = outputs[j];
//           guess = j;
//         }
//       }
//       let target = desired.indexOf(1);

//       if (guess === target) {
//         correct++;
//       }

//       if ((i + 1) % 50 === 0) {
//         console.log("Test: " + (i + 1));
//       }
//     }
//     let accuracy = correct / 10000;

//     console.log(`Your neural network has an accuracy of ${accuracy * 100}%`);

//     // store current weights and biases in JSON file

//     // easiest way is to copypasta from console to data.json :D
//     console.log(nn.data);
//   } catch (error) {
//     console.log(error.message);
//   }
// }

// main();

async function main() {
  try {
    let response = await fetch("http://localhost:3000/conn/data", {
      method: "GET",
    });
    let conn_data = await response.json();
    let nn = new NeuralNetwork(IMG_DIMENSIONS, 150, 150, 10, conn_data);

    response = await fetch("http://localhost:3000/files/test", {
      method: "GET",
    });
    let test = await response.json();
    let outputs = nn.feedforward(test[0]);
    console.log(outputs);
    console.log(test[1]);
  } catch (error) {
    console.error(error);
  }
}

main();
