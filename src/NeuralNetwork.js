function sigmoid(x) {
  return 1 / (1 + Math.exp(-x));
}

function dsigmoid(y) {
  // return sigmoid(x) * (1 - sigmoid(x));
  return y * (1 - y);
}

function normalize(x) {
  return x / 255;
}

class NeuralNetwork {
  constructor(input_length, h1_length, h2_length, output_length, data = null) {
    this.input_length = input_length;
    this.h1_length = h1_length;
    this.h2_length = h2_length;
    this.output_length = output_length;

    // weights
    this.weights_ih1 = new Matrix(h1_length, input_length, data[0][0]);
    this.weights_h1h2 = new Matrix(h2_length, h1_length, data[0][1]);
    this.weights_h2o = new Matrix(output_length, h2_length, data[0][2]);

    // biases
    this.bias_h1 = new Matrix(h1_length, 1, data[1][0]);
    this.bias_h2 = new Matrix(h2_length, 1, data[1][1]);
    this.bias_o = new Matrix(output_length, 1, data[1][2]);

    if (data === null) {
      this.weights_ih1.randomize();
      this.weights_h1h2.randomize();
      this.weights_h2o.randomize();
      this.bias_h1.randomize();
      this.bias_h2.randomize();
      this.bias_o.randomize();
    }

    // learning rate
    this.lr = 0.01;
  }

  /**
   *
   * @param {Array} inputs_array
   */
  feedforward(inputs_array) {
    // The input is the average rgb value of every pixel

    // Convert the inputs array to a matrix for easier manipulation
    let inputs = Matrix.fromArray(inputs_array);
    // Get the grayscale value of every pixel
    //inputs.map(normalize);

    // Feed forward
    // I -> H1
    let hidden_1 = Matrix.multiply(this.weights_ih1, inputs);
    hidden_1 = Matrix.add(hidden_1, this.bias_h1);
    // Apply the sigmoid function to every neuron in hidden_1
    hidden_1.map(sigmoid);

    // Feed forward
    // H1 -> H2
    let hidden_2 = Matrix.multiply(this.weights_h1h2, hidden_1);
    hidden_2 = Matrix.add(hidden_2, this.bias_h2);
    hidden_2.map(sigmoid);

    // Feed forward
    // H2 -> O
    let outputs = Matrix.multiply(this.weights_h2o, hidden_2);
    outputs = Matrix.add(outputs, this.bias_o);
    outputs.map(sigmoid);

    // Convert ouputs matrix to array
    let outputs_array = Matrix.toArray(outputs);

    return outputs_array;
  }

  /**
   *
   * @param {Array} inputs_array
   * @param {Array} desired_array
   */
  train(inputs_array, desired_array) {
    ////// FEED FORWARD ALGORITHM

    let inputs = Matrix.fromArray(inputs_array);
    inputs.map(normalize);

    let hidden_1 = Matrix.multiply(this.weights_ih1, inputs);
    hidden_1 = Matrix.add(hidden_1, this.bias_h1);
    hidden_1.map(sigmoid);

    let hidden_2 = Matrix.multiply(this.weights_h1h2, hidden_1);
    hidden_2 = Matrix.add(hidden_2, this.bias_h2);
    hidden_2.map(sigmoid);

    let outputs = Matrix.multiply(this.weights_h2o, hidden_2);
    outputs = Matrix.add(outputs, this.bias_o);
    outputs.map(sigmoid);

    ////// END FEED FORWARD ALGORITHM

    ////// BACKPROPAGATION ALGORITHM

    // Calculate the error (ERROR = DESIRED - OUTPUT)
    let desired = Matrix.fromArray(desired_array);
    let output_errors = Matrix.subtract(desired, outputs);

    let weights_h2o_T = Matrix.transpose(this.weights_h2o);
    let hidden_2_errors = Matrix.multiply(weights_h2o_T, output_errors);

    let weights_h1h2_T = Matrix.transpose(this.weights_h1h2);
    let hidden_1_errors = Matrix.multiply(weights_h1h2_T, hidden_2_errors);
    ////// END BACKPROPAGATION ALGORITHM

    ////// GRADIENT DESCENT
    outputs.map(dsigmoid);
    let weights_h2o_gradient = Matrix.el_multiply(output_errors, outputs);
    weights_h2o_gradient.scale(this.lr);
    this.bias_o = Matrix.add(this.bias_o, weights_h2o_gradient);
    let hidden_2_T = Matrix.transpose(hidden_2);
    let weights_h2o_deltas = Matrix.multiply(weights_h2o_gradient, hidden_2_T);
    this.weights_h2o = Matrix.add(this.weights_h2o, weights_h2o_deltas);

    hidden_2.map(dsigmoid);
    let weights_h1h2_gradient = Matrix.el_multiply(hidden_2_errors, hidden_2);
    weights_h1h2_gradient.scale(this.lr);
    this.bias_h2 = Matrix.add(this.bias_h2, weights_h1h2_gradient);
    let hidden_1_T = Matrix.transpose(hidden_1);
    let weights_h1h2_deltas = Matrix.multiply(
      weights_h1h2_gradient,
      hidden_1_T
    );
    this.weights_h1h2 = Matrix.add(this.weights_h1h2, weights_h1h2_deltas);

    hidden_1.map(dsigmoid);
    let weights_ih1_gradient = Matrix.el_multiply(hidden_1_errors, hidden_1);
    weights_ih1_gradient.scale(this.lr);
    this.bias_h1 = Matrix.add(this.bias_h1, weights_ih1_gradient);
    let inputs_T = Matrix.transpose(inputs);
    let weights_ih1_deltas = Matrix.multiply(weights_ih1_gradient, inputs_T);
    this.weights_ih1 = Matrix.add(this.weights_ih1, weights_ih1_deltas);
  }

  get data() {
    let weights = [];
    weights.push(
      this.weights_ih1.data,
      this.weights_h1h2.data,
      this.weights_h2o.data
    );
    let biases = [];
    biases.push(this.bias_h1.data, this.bias_h2.data, this.bias_o.data);

    let data = [];
    data.push(weights, biases);

    return JSON.stringify(data);
  }
}
