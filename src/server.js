const http = require("http");
const fs = require("fs");

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
 * @param {string} num
 * @returns number
 */
function hexToDecimal(num) {
  return parseInt(num, 16);
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

/**
 *
 * @param {fs.PathOrFileDescriptor} path
 * @returns Promise<string>
 */
function readFile(path) {
  return new Promise(function (resolve, reject) {
    fs.readFile(path, { encoding: "utf-8" }, (err, data) => {
      if (err) reject(err);
      else resolve(data);
    });
  });
}

let fetched_images = undefined;
let fetched_labels = undefined;
let test_images = undefined;
let test_labels = undefined;
let index = 0;
let t_index = 0;
(async () => {
  try {
    let images_path = "./samples/json/training-images.json";
    let labels_path = "./samples/json/training-labels.json";
    let test_images_path = "./samples/json/test-images.json";
    let test_labels_path = "./samples/json/test-labels.json";

    // TODO: replace with Promise.all();
    fetched_images = await readFile(images_path);
    fetched_labels = await readFile(labels_path);
    test_images = await readFile(test_images_path);
    test_labels = await readFile(test_labels_path);
    fetched_images = JSON.parse(fetched_images);
    fetched_labels = JSON.parse(fetched_labels);
    test_images = JSON.parse(test_images);
    test_labels = JSON.parse(test_labels);

    const server = http.createServer(async (req, res) => {
      try {
        // if (req.url === "/files" && req.method === "POST") {
        //   let path = "./samples/train-images.idx3-ubyte";

        //   const data = await readIdxFile(path);
        //   const output = [];
        //   let header_l = 16;
        //   let temp_row = [];
        //   let temp_col = [];
        //   for (let i = 0; i + header_l < data.length; i++) {
        //     temp_row.push(data[i + header_l]);
        //     if (temp_row.length === 28) {
        //       temp_col.push(temp_row);
        //       temp_row = [];
        //     }
        //     if (temp_col.length === 28) {
        //       output.push(temp_col);
        //       temp_col = [];
        //     }
        //   }
        //   await inputIntoJson(
        //     "./samples/json/training-images.json",
        //     JSON.stringify(output)
        //   );
        //   res.statusCode = 200;
        //   res.setHeader("Content-Type", "text/plain");
        //   res.end("Process finished.");
        // }
        if (req.method === "GET") {
          res.setHeader("Content-Type", "application/json");
          res.setHeader("Access-Control-Allow-Origin", "*");
          res.setHeader("Access-Control-Allow-Methods", "GET");
          res.setHeader("Access-Control-Max-Age", "2592000");
          switch (req.url) {
            case "/reset":
              index = 0;
              t_index = 0;
              res.end("Resetted counter");
              break;
            case "/files/training":
              // let random_index =
              //   Math.floor(Math.random() * 100000) % images_output.length;
              res.statusCode = 200;
              res.end(
                JSON.stringify([fetched_images[index], fetched_labels[index]])
              );
              index++;
              break;
            case "/files/test":
              res.statusCode = 200;
              res.end(
                JSON.stringify([test_images[t_index], test_labels[t_index]])
              );
              t_index++;
              break;
            case "/conn/data":
              let data = await readFile("./data.json");
              res.statusCode = 200;
              res.end(data);
              break;
            default:
              res.statusCode = 404;
              res.end();
              break;
          }
        }
      } catch (error) {
        res.statusCode = 500;
        console.log(error.message);
        res.end();
      }
    });

    server.listen(3000, () => {
      console.log("Server up and running on port 3000");
    });
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
})();
