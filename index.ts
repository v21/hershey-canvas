import * as fs from "fs";
import { Vec2 } from "./utils";
import * as parseCsv from "csv-parse/lib/sync";

interface MoveTo {
  kind: "moveTo";
  coords: Vec2;
}
interface LineTo {
  kind: "lineTo";
  coords: Vec2;
}

type Instruction = MoveTo | LineTo;

class HersheyDef {
  id: number;
  left: number;
  right: number;
  instructions: Instruction[];

  constructor(id: number, left: number, right: number, instructions: Instruction[]) {
    this.id = id;
    this.left = left;
    this.right = right;
    this.instructions = instructions;
  }

  draw(ctx: CanvasRenderingContext2D, pos: Vec2, scale = Vec2.one) {
    ctx.save();
    ctx.translate(pos.x, pos.y);
    ctx.scale(scale.x, scale.y);
    for (const instr of this.instructions) {
      if (instr.kind == "moveTo") {
        ctx.moveTo(instr.coords.x, instr.coords.y);
      } else if (instr.kind == "lineTo") {
        ctx.lineTo(instr.coords.x, instr.coords.y);
      }
    }
    ctx.restore();
  }
}

export function loadHersheyDefs(fontName: string): HersheyDef[] {
  let defs: HersheyDef[] = [];

  let hfile = fs.readFileSync(__dirname + `/hershey-fonts/${fontName}.jhf`);
  let lines = hfile.toString().split("\n");

  for (let line of lines) {
    let id = parseInt(line.substr(0, 5));

    let instructionLength = parseInt(line.substr(6, 3));

    let left = ASCIItoCoord(line.substr(8, 1));
    let right = ASCIItoCoord(line.substr(9, 1));

    let moveFlag = true;

    let instructions: Instruction[] = [];

    for (let i = 1; i < instructionLength; i++) {
      let l = line.substr(8 + i * 2, 1);
      let r = line.substr(8 + i * 2 + 1, 1);

      if (l === " " && r === "R") {
        moveFlag = true;
      } else {
        let instr: Instruction = {
          kind: moveFlag ? "moveTo" : "lineTo",
          coords: new Vec2(ASCIItoCoord(l), ASCIItoCoord(r))
        };

        instructions.push(instr);
        moveFlag = false;
      }
    }

    let def: HersheyDef = new HersheyDef(id, left, right, instructions);
    defs.push(def);
  }

  return defs;
}

function ASCIItoCoord(char: string): number {
  return char.charCodeAt(0) - "R".charCodeAt(0);
}

interface Row {
  hid: number;
  unicode: number;
}

class Mapping {
  static rows: Row[] | undefined;

  static getRows() {
    if (this.rows === undefined) {
      this.rows = loadMap();
    }
    return this.rows;
  }
}

export function loadMap(): Row[] {
  let csv = fs.readFileSync(__dirname + `/hershey-fonts/unicode_map.csv`);
  let rows: Row[] = parseCsv(csv, { cast: true, columns: true });
  return rows;
}

export function unicodeToDef(defs: HersheyDef[], char: String): HersheyDef | undefined {
  let charCode = char.charCodeAt(0);
  let rows = Mapping.getRows().filter((r: Row) => r.unicode === charCode);

  let def = defs.find(d => rows.some(r => r.hid === d.id));
  if (def !== undefined) {
    return def;
  } else {
    //console.log(`can't find def for character ${char} (${charCode}). possible hids: ${JSON.stringify(rows)}`);

    let offsetAscii = charCode - 32;
    if (offsetAscii >= 0 && offsetAscii < defs.length) {
      return defs[offsetAscii];
    }
    return undefined;
  }
}

export function drawString(
  defs: HersheyDef[],
  ctx: CanvasRenderingContext2D,
  message: string,
  pos: Vec2 = Vec2.zero,
  scale: Vec2 = Vec2.one,
  lineHeight: number = 50
) {
  let currentPos = Vec2.zero;
  for (const char of message) {
    let def = unicodeToDef(defs, char);
    if (def !== undefined) {
      currentPos = currentPos.add(-def.left, 0);
      def.draw(ctx, pos.add(currentPos.mul(scale)), scale);
      currentPos = currentPos.add(def.right, 0);
    } else {
      if (char === "\n") {
        currentPos = Vec2.at(0, currentPos.y + lineHeight);
      } else {
        console.log(`couldn't find def for character ${char} (${char.charCodeAt(0)})`);
      }
    }
  }
}
