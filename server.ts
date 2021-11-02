// https://github.com/grpc/grpc-web/blob/master/net/grpc/gateway/examples/helloworld/server.js

const PROTO_PATH = __dirname + "/helloworld.proto";

const assert = require("assert");
const async = require("async");
const _ = require("lodash");
// const grpc = require("@grpc/grpc-js");
import grpc from "@grpc/grpc-js";
// const protoLoader = require("@grpc/proto-loader");
import protoLoader from "@grpc/proto-loader";
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

import { HelloRequest, RepeatHelloRequest } from "./helloworld_pb";
import { GreeterPromiseClient as GreeterClient } from "./helloworld_grpc_web_pb";

const protoDescriptor = grpc.loadPackageDefinition(packageDefinition);
const helloworld = protoDescriptor.helloworld;

function doSayHello(call, callback) {
  callback(null, { message: "Hello! " + call.request.name });
}

function doSayRepeatHello(call) {
  const senders = [];
  function sender(name) {
    return (callback) => {
      call.write({
        message: "Hey! " + name,
      });
      _.delay(callback, 500); // in ms
    };
  }
  for (let i = 0; i < call.request.count; i++) {
    senders[i] = sender(call.request.name + i);
  }
  async.series(senders, () => {
    call.end();
  });
}

function getServer() {
  const server = new grpc.Server();
  server.addService(helloworld.Greeter.service, {
    sayHello: doSayHello,
    sayRepeatHello: doSayRepeatHello,
  });
  return server;
}

if (require.main === module) {
  const server = getServer();
  server.bindAsync(
    "0.0.0.0:9090",
    grpc.ServerCredentials.createInsecure(),
    (err, port) => {
      assert.ifError(err);
      server.start();
    }
  );
}

exports.getServer = getServer;
