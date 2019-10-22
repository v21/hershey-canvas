import * as hershey from "./index";

import { Vec2 } from "./utils";
import { createCanvas } from "canvas";
import * as fs from "fs";

let canvas = createCanvas(1024, 1024);
let ctx = canvas.getContext("2d");

let timesi = hershey.loadHersheyDefs("timesi");
let cursive = hershey.loadHersheyDefs("cursive");
let futural = hershey.loadHersheyDefs("futural");

ctx.strokeStyle = "black";

ctx.beginPath();
hershey.drawString(timesi, ctx, "How quickly daft jumping zebras vex.", Vec2.at(20, 50));
hershey.drawString(cursive, ctx, "The quick brown fox jumps over the lazy dog!", Vec2.at(20, 150));
hershey.drawString(
  futural,
  ctx,
  "One (1), Two {2}, Three [3], Four <4>, Five -5-\nSix *6*, Seven !7!, Eight _8_, Nine @9@, Zero 0",
  Vec2.at(20, 250)
);

ctx.stroke();

fs.writeFileSync(__dirname + "/test.png", canvas.toBuffer());
