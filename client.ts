// https://github.com/grpc/grpc-web/blob/master/net/grpc/gateway/examples/helloworld/client.js

import { HelloRequest, RepeatHelloRequest } from "./helloworld_pb";
import { GreeterPromiseClient as GreeterClient } from "./helloworld_grpc_web_pb";

const client = new GreeterClient(
  "http://" + window.location.hostname + ":8080",
  null,
  null
);

// simple unary call
const request = new HelloRequest();
request.setName("World");

(async () => {
  const response = await client.sayHello(request, {});
  console.log(response.getMessage());
})();

// server streaming call
const streamRequest = new RepeatHelloRequest();
streamRequest.setName("World");
streamRequest.setCount(5);

(async () => {
  const stream = client.sayRepeatHello(streamRequest, {});
  stream.on("data", (response) => {
    console.log(response.getMessage());
  });
})();
