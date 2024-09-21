
var filename = process.argv[2];

if (!filename) {
  console.error("Please provide a demo to parse");
  process.exit(1);
}

var Demo = require("./src/Demo.ts").Demo;
var fs = require("fs");

fs.readFile(filename, function (err, data) {
  if (err) throw err;
  var demo = Demo.fromNodeBuffer(data);
  var analyser = demo.getAnalyser();
  var head = analyser.getHeader();
  var match = analyser.match;
  for (const packet of analyser.getPackets()) {
    // where you can either get information directly from the packet (see ./src/Data/Packet.ts)
    // or use the `match` object which has contains an (incomplete) state of the match at the current tick
    // console.log(packet)
  }
});
