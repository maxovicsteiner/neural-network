# Get started

## Requirements

- Node (v18.16.0)

## 1. Clone the repository

```
git clone https://github.com/dmtry-krachkovi/neural-network
```

Keep in mind, you don't have to install any dependecies at all!

## 2. Data collection

As you know, the first step of training a neural network is data collection.
Our neural network is trained and tested using the data provided by the free [MNIST dataset](http://yann.lecun.com/exdb/mnist/).

### 2.1. Download all 4 files

On the [MNIST dataset website](http://yann.lecun.com/exdb/mnist/), download all 4 of these files...
![Screenshot of required files](./docs/Screen%20Shot%202023-05-01%20at%201.37.37%20AM.png)

### 2.2. Unzip the files

Either using the native tool provided by your operating system, or any third-party unzipping tool, unzip the 4 files mentioned above into a new folder named `samples` located in the root of the project

### 2.3. Process the data

As you might have noticed, even the unzipped versions of the files are unpractical, since they are provided in the [idx format](https://www.fon.hum.uva.nl/praat/manual/IDX_file_format.html#:~:text=The%20IDX%20file%20format%20is,matrices%20of%20various%20numerical%20types.&text=The%20magic%20number%20is%20four,2%20bytes%20are%20always%200.&text=The%20fouth%20byte%20codes%20the,2%20for%20matrices....).
Feel free to go ahead and read the documentation located in the website linked above.
Anyhow, you will find in `./src/server.js` a commented block of code:

```javascript
if (req.url === "/files" && req.method === "PATCH") {
  let path = "./samples/t10k-labels-idx1-ubyte";

  const data = await readIdxFile(path);
  const output = [];
  let header_l = 8;

  for (let i = 0; i + header_l < data.length; i++) {
    output.push(data[i + header_l]);
  }
  await inputIntoJson(
    "./samples/json/test-labels.json",
    JSON.stringify(output)
  );
  res.statusCode = 200;
  res.setHeader("Content-Type", "text/plain");
  res.end("Process finished.");
}
```

This block of code is responsible for the parsing of both the labels' files from the idx format to json. Notice that this process requires a `path` variable. Since there exists two labels' files, we must run the process twice: once setting the `path` variable to `./samples/train-labels-idx1-ubyte`, and once seting it to `./samples/t10k-labels-idx1-ubyte`.

> **WARNING**
> Do not forget to update the first parameter of the `inputIntoJson` function when changing the `path` variable

To parse the images, a bit more logic is involved. Here is the desired format for our images: Our images will be of size 28x28 pixels, meaning we will need a 28x28 matrix representing the grayscale of every pixel (from 0 to 255).

To process the images, run this block of code twice, again altering the `path` variable:

```javascript
if (req.url === "/files" && req.method === "PATCH") {
  let path = "./samples/t10k-images-idx3-ubyte";

  const data = await readIdxFile(path);
  const output = [];
  let header_l = 16;
  let temp_row = [];
  let temp_col = [];
  for (let i = 0; i + header_l < data.length; i++) {
    temp_row.push(data[i + header_l]);
    if (temp_row.length === 28) {
      temp_col.push(temp_row);
      temp_row = [];
    }
    if (temp_col.length === 28) {
      output.push(temp_col);
      temp_col = [];
    }
  }
  await inputIntoJson(
    "./samples/json/test-images.json",
    JSON.stringify(output)
  );
  res.statusCode = 200;
  res.setHeader("Content-Type", "text/plain");
  res.end("Process finished.");
}
```

Note: Here are the two helper functions involved in the process

```javascript
/**
 *
 * @param {fs.PathOrFileDescriptor} path
 * @returns Promise<any>
 */
function readIdxFile(path) {
  return new Promise(function (resolve, reject) {
    fs.readFile(path, (err, data) => {
      if (err) reject(err);
      else resolve(data);
    });
  });
}

/**
 *
 * @param {fs.PathOrFileDescriptor} path
 * @param {string} data
 * @returns Promise<any>
 */
function inputIntoJson(path, data) {
  return new Promise(function (resolve, reject) {
    fs.writeFile(path, data, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}
```

After finishing the parsing process, you should end up with the following file structure:

```
root
│   ...
│
└───samples
│   │   t10k-images-idx3-ubyte
│   │   t10k-labels-idx1-ubyte
│   │   train-images-idx3-ubyte
│   │   train-labels-idx1-ubyte
│   │
│   └───json
│       │   test-images.json
│       │   test-labels.json
│       │   training-images.json
│       │   training-labels.json
│
└───src
│   │   ...
└───docs
    │  ...
```

## 3. The training process

The next step after data collection is training. In the `src` folder located in the root of the project, you will find both `NeuralNetwork.js` and `Matrix.js`.

### 3.1. The Matrix class

> The `Matrix` class and its methods are responsible for all the magic (maths) that happens inside of the neural network

The `Matrix.js` file consists of a single class, `Matrix`, containing the following static methods...

- `add(m1, m2)` **Resulting matrix from the element wise addition between m1 and m2**
- `subtract(m1, m2)` **Resulting matrix from element wise subtraction of m2 from m1**
- `multiply(m1, m2)` **Resulting matrix from the dot product between m1 and m2**
- `transpose(m)` **Resulting matrix from the transposition of matrix m**
- `el_multiply(m1, m2)` **Resulting matrix from the element wise mutltiplication of m1 and m2**
- `fromArray(arr)` **Get a (arr.length x 1) matrix from a given arr**
- `toArray(m)` **Get a flattened array from the matrix' elements**

...and the following instance methods:

- `map(func)` **Executes a given function for every element in the matrix**
- `scale(num)` **Scales all the elements of the matrix by the given scalor**
- `add(num)` **Adds a number to every element in the matrix**
- `reset()` **Makes all the elements of the matrix 0**
- `randomize()` **Randomizes all the elements of the matrix**
- `print()` **Formats the matrix to display in console**

> If your goal is to understand all the underlying maths, I recommend that you watch the 3Blue1Brown series on neural networks, on YouTube. I will not be explaining it though, given that I am in no way a certified maths wizard.

### 3.2. The NeuralNetwork class

The `NeuralNetwork` class contains the following instance methods...

- `feedforward(inputs_array)` **Get the array of outputs, given an array of inputs**
- `train(inputs_array, desired_array)` **Tune weights and biases to minimize difference between the output of the neural network -given the inputs_array- and the desired_array**

... and the getter:

- `data()` **Returns the current weights and biases in a multidimensional array**

### 3.3. The training process

You will find in the `src` folder two other files named `server.js` and `train.js`.

The `server.js` is a node.js server built with the native `http` library. It has 4 routes, excluding the already mentioned parsing routes.

- `GET /reset` **Resets both counters, n and m**
- `GET /files/training` **Returns the nth image with its label, from the training json files**
- `GET /files/test` **Returns the mth image with its label, from the test json files**
- `GET /conn/data` **Returns the content of data.json (We will talk about this file later)**

The `train.js` file has one `main` function. The function firsts creates a new neural network with 2 layers of 150 neurons each...

```javascript
let nn = new NeuralNetwork(IMG_DIMENSIONS, 150, 150, 10);
```

... it then resets the counter in the server ...

```javascript
await fetch("http://localhost:3000/reset", { method: "GET" });
```

... and then loops through all 60,000 training sets, running the `train()` method on each one of them ...

```javascript
for (let i = 0; i < 60000; i++) {
  let response = await fetch("http://localhost:3000/files/training", {
    method: "GET",
  });
  let data = await response.json();
  let inputs = data[0];
  let desired = Array(10).fill(0);
  desired[data[1]] = 1;
  nn.train(inputs, desired);
  if ((i + 1) % 100 === 0) {
    console.log("Epoch: " + (i + 1));
  }
}
```

... then runs another loop for all 10,000 testing sets, running the `feedforward()` method on each one of them and comparing the outputs to get the accuracy ...

```javascript
console.clear();
let correct = 0;
for (let i = 0; i < 10000; i++) {
  let response = await fetch("http://localhost:3000/files/test", {
    method: "GET",
  });
  let data = await response.json();
  let inputs = data[0];
  let desired = Array(10).fill(0);
  desired[data[1]] = 1;
  let outputs = nn.feedforward(inputs);
  let temp = outputs[0];
  let guess = 0;
  for (let j = 0; j < outputs.length; j++) {
    if (outputs[j] > temp) {
      temp = outputs[j];
      guess = j;
    }
  }
  let target = desired.indexOf(1);

  if (guess === target) {
    correct++;
  }

  if ((i + 1) % 50 === 0) {
    console.log("Test: " + (i + 1));
  }
}
let accuracy = correct / 10000;

console.log(`Your neural network has an accuracy of ${accuracy * 100}%`);
```

... and finally, stores the current weights and biases in `data.json` file, to spare us from running the training process over and over again (especially since we will be using our neural network for a single given purpose)

```javascript
// store current weights and biases in JSON file

// easiest way is to copypasta from console to data.json :D
console.log(nn.data);
```

> **Warning**: `data.json` should be located in the root of the project

> **Note**: To trigger the training process, just go ahead and uncomment the script file from `index.html`, and check the DevTools! Do NOT forget to copy and paste the final log of the training process, the multidimensional array, into `data.json`

## 4. Having fun!

Here we finally are! We have stored all the optimal weights and biases in a json file; let's use them to create something fun!

### 4.1. The idea

I had the not so crazy idea of letting the user provide the digit image, or even better, drawing it!
You will find in `index.html` and `script.js` the code to this fun project. I will not be going over it since it is quite straightforward. But here is a screenshot of its usage:

![](./docs/Screen%20Shot%202023-05-01%20at%203.39.17%20PM.png)
![](./docs/Screen%20Shot%202023-05-01%20at%203.39.34%20PM.png)
![](./docs/Screen%20Shot%202023-05-01%20at%203.40.33%20PM.png)

And there you have it! A fully functional neural network, from scratch, in JavaScript
