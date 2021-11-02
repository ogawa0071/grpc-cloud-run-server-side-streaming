// https://github.com/grpc/grpc-web/blob/master/net/grpc/gateway/examples/helloworld/node-client.js

const PROTO_PATH = __dirname + "/helloworld.proto";

const async = require("async");
const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const protoDescriptor = grpc.loadPackageDefinition(packageDefinition);
const helloworld = protoDescriptor.helloworld;
const client = new helloworld.Greeter(
  "localhost:9090",
  grpc.credentials.createInsecure()
);

/**
 * @param {function():?} callback
 */
function runSayHello(callback) {
  client.sayHello({ name: "John" }, {}, (err, response) => {
    console.log(response.message);
    callback();
  });
}

/**
 * @param {function():?} callback
 */
function runSayRepeatHello(callback) {
  const stream = client.sayRepeatHello({ name: "John", count: 5 }, {});
  stream.on("data", (response) => {
    console.log(response.message);
  });
  stream.on("end", () => {
    callback();
  });
}

/**
 * @param {function():?} callback
 */
function runSayHelloAfterDelay(callback) {
  const deadline = new Date();
  deadline.setSeconds(deadline.getSeconds() + 1);

  client.sayHelloAfterDelay(
    { name: "John" },
    { deadline: deadline.getTime() },
    (err, response) => {
      console.log(
        "Got error, code = " + err.code + ", message = " + err.message
      );
      callback();
    }
  );
}

/**
 * Run all of the demos in order
 */
function main() {
  async.series([runSayHello, runSayRepeatHello, runSayHelloAfterDelay]);
}

if (require.main === module) {
  main();
}
