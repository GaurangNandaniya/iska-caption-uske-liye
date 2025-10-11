import { getDB } from "./db";
import readline from "readline";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: "sqlite> ",
});

rl.prompt();
rl.on("line", async (line) => {
  if (line.trim().toLowerCase() === "\\q") {
    rl.close();
    return;
  }

  try {
    using db = getDB();
    const res = db.query(line).all();
    console.table(res);
  } catch (err) {
    console.error(err);
  }

  rl.prompt();
});
