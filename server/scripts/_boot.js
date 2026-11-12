import { loadConfig } from "../config.js";
import { createDb } from "../db/index.js";
import { migrate, seedMilestones } from "../db/migrate.js";

/** Shared start-up for the command-line tools: connect, bring the schema up to date, return the handles. */
export async function openDatabase({ quiet = false } = {}) {
  const config = loadConfig();
  const log = quiet ? { info() {}, warn() {}, error: console.error } : console;
  let db;
  try {
    db = await createDb(config, log);
    await migrate(db);
    await seedMilestones(db);
  } catch (error) {
    console.error(`\n${error.message}\n`);
    await db?.close().catch(() => {});
    process.exit(1);
  }
  return { config, db };
}

export const flag = (name, argv = process.argv.slice(2)) => {
  const i = argv.indexOf(`--${name}`);
  return i === -1 ? undefined : argv[i + 1]?.startsWith("--") || argv[i + 1] === undefined ? true : argv[i + 1];
};

/** Ask for a secret without echoing it (falls back to a visible prompt when there is no TTY). */
export function askHidden(prompt) {
  return new Promise((resolve, reject) => {
    const { stdin, stdout } = process;
    stdout.write(prompt);
    if (!stdin.isTTY) {
      let data = "";
      stdin.setEncoding("utf8");
      stdin.on("data", (chunk) => (data += chunk));
      stdin.on("end", () => resolve(data.split(/\r?\n/)[0]));
      stdin.on("error", reject);
      return;
    }
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding("utf8");
    let value = "";
    const onData = (char) => {
      for (const c of char) {
        if (c === "\u0003") {
          stdin.setRawMode(false);
          stdout.write("\n");
          process.exit(130);
        } else if (c === "\r" || c === "\n") {
          stdin.setRawMode(false);
          stdin.pause();
          stdin.off("data", onData);
          stdout.write("\n");
          resolve(value);
          return;
        } else if (c === "\u007f" || c === "\b") {
          value = value.slice(0, -1);
        } else {
          value += c;
        }
      }
    };
    stdin.on("data", onData);
  });
}
