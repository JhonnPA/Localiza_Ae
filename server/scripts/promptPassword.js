import { createInterface } from "node:readline";

const ENTER_KEYS = ["\r", "\n"];
const BACKSPACE_KEYS = ["\u007f", "\b"];
const CTRL_C = "\u0003";

// Terminal de verdade: lê tecla por tecla sem mostrar nada na tela
function askHidden(question) {
  const { stdin, stdout } = process;
  let password = "";

  return new Promise((resolve, reject) => {
    const finish = (settle) => {
      stdin.off("data", onKey);
      stdin.setRawMode(false);
      stdin.pause();
      stdout.write("\n");
      settle();
    };

    const onKey = (chunk) => {
      // colar a senha chega tudo num pedaço só, por isso o for
      for (const char of chunk) {
        if (ENTER_KEYS.includes(char)) return finish(() => resolve(password));
        if (char === CTRL_C) return finish(() => reject(new Error("Cancelado.")));
        password = BACKSPACE_KEYS.includes(char) ? password.slice(0, -1) : password + char;
      }
    };

    stdout.write(question);
    stdin.setRawMode(true);
    stdin.setEncoding("utf8");
    stdin.resume();
    stdin.on("data", onKey);
  });
}

// Sem terminal (senha vindo de um pipe, por ex.): lê uma linha por pergunta
function linePrompt() {
  const reader = createInterface({ input: process.stdin });
  const lines = reader[Symbol.asyncIterator]();
  return {
    async ask(question) {
      process.stdout.write(`${question}\n`);
      const { value } = await lines.next();
      return value ?? "";
    },
    close: () => reader.close(),
  };
}

export function createPasswordPrompt() {
  if (process.stdin.isTTY) {
    return { ask: askHidden, close: () => {} };
  }
  return linePrompt();
}
