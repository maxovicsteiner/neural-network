class Matrix {
  /**
   *
   * @param {Number} rows
   * @param {Number} cols
   */
  constructor(rows, cols, data = []) {
    this.rows = rows;
    this.cols = cols;
    this.data = data;

    if (this.data.length === 0) {
      for (let i = 0; i < rows; i++) {
        this.data.push([]);
        for (let j = 0; j < cols; j++) {
          this.data[i][j] = 0;
        }
      }
    }
  }

  /**
   *
   * @param {Matrix} m1
   * @param {Matrix} m2
   */
  static add(m1, m2) {
    if (m1.cols !== m2.cols || m1.rows !== m2.rows) {
      console.error("Cannot add matrices with different dimensions.");
      return undefined;
    }
    let result = new Matrix(m1.rows, m1.cols);

    for (let i = 0; i < result.rows; i++) {
      for (let j = 0; j < result.cols; j++) {
        result.data[i][j] = m1.data[i][j] + m2.data[i][j];
      }
    }
    return result;
  }

  /**
   *
   * @param {Matrix} m1
   * @param {Matrix} m2
   */
  static subtract(m1, m2) {
    if (m1.cols !== m2.cols || m1.rows !== m2.rows) {
      console.error("Cannot subtract two matrices with different dimensions.");
      return undefined;
    }

    let result = new Matrix(m1.rows, m1.cols);

    for (let i = 0; i < result.rows; i++) {
      for (let j = 0; j < result.cols; j++) {
        result.data[i][j] = m1.data[i][j] - m2.data[i][j];
      }
    }
    return result;
  }

  /**
   *
   * @param {Matrix} m1
   * @param {Matrix} m2
   * @returns Matrix | undefined
   */
  static multiply(m1, m2) {
    if (m1.cols !== m2.rows) {
      console.error("Dimensions aren't compatible.");
      return undefined;
    }

    let result = new Matrix(m1.rows, m2.cols);
    for (let i = 0; i < result.rows; i++) {
      result[i] = [];
      for (let j = 0; j < result.cols; j++) {
        let sum = 0;
        for (let k = 0; k < m2.rows; k++) {
          sum += m1.data[i][k] * m2.data[k][j];
        }
        result.data[i][j] = sum;
      }
    }
    return result;
  }

  /**
   *
   * @param {Matrix} m
   * @returns Matrix
   */
  static transpose(m) {
    let result = new Matrix(m.cols, m.rows);
    for (let i = 0; i < result.rows; i++) {
      for (let j = 0; j < result.cols; j++) {
        result.data[i][j] = m.data[j][i];
      }
    }
    return result;
  }

  static el_multiply(m1, m2) {
    if (m1.cols !== m2.cols || m1.rows !== m2.rows) {
      console.error("Dimensions aren't compatible.");
      return undefined;
    }

    let result = new Matrix(m1.rows, m1.cols);
    for (let i = 0; i < result.rows; i++) {
      for (let j = 0; j < result.cols; j++) {
        result.data[i][j] = m1.data[i][j] * m2.data[i][j];
      }
    }
    return result;
  }

  /**
   *
   * @param {Array} array
   * @returns Matrix
   */
  static fromArray(array) {
    if (!array) {
      console.log(array);
    }
    let result = new Matrix(array.flat().length, 1);
    for (let i = 0; i < array.flat().length; i++) {
      result.data[i][0] = array.flat()[i];
    }
    return result;
  }

  /**
   *
   * @param {Matrix} m
   * @returns Number[][]
   */
  static toArray(m) {
    let result = m.data.flat();
    return result;
  }

  /**
   *
   * @param {Function} func
   * @returns undefined
   */
  map(func) {
    if (!(func instanceof Function)) {
      console.error(
        "The map method expects a function, it has been given a " + typeof func
      );
      return undefined;
    }
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        let val = this.data[i][j];
        this.data[i][j] = func(val);
      }
    }
  }

  /**
   *
   * @param {Number} num
   */
  scale(num) {
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        this.data[i][j] *= num;
      }
    }
  }

  /**
   *
   * @param {Number} num
   */
  add(num) {
    if (!(num instanceof Number)) {
      console.error(
        "The add() method expects a number, recieved " + typeof num
      );
      return undefined;
    }
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        m1.data[i][j] += num;
      }
    }
  }

  reset() {
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        this.data[i][j] = 0;
      }
    }
  }

  randomize() {
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        this.data[i][j] = Math.random() * 2 - 1;
      }
    }
  }

  print() {
    console.table(this.data);
  }
}
