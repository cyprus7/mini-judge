"use client";
import { useState } from "react";

// Simple in-browser judge for JS tasks using Node-like stdin/stdout shims.
// Drop this file into a Next.js App Router project as app/page.tsx
// Tailwind optional but used for styling.

export default function Page() {
  const [code, setCode] = useState(`process.stdin.resume();
process.stdin.setEncoding("utf-8");
var stdin_input = "";
process.stdin.on("data", function (input) {
    stdin_input += input;  // get the input
});
process.stdin.on("end", function () {
   main(stdin_input);
});
function main(input) {
    // TODO: write your solution here
    process.stdout.write(input); // echo
}`.trim());

  type Case = { id: string; input: string; expected: string };

  const [cases, setCases] = useState<Case[]>([
    {
      id: crypto.randomUUID(),
      // Task A sample
      input: `100\n1\n2025\n`,
      expected: `20`,
    },
    {
      id: crypto.randomUUID(),
      // Task B: cannot be split into 11-digit numbers starting with 79 → 0
      input: `4\n2025\n`,
      expected: `0`,
    },
    {
      id: crypto.randomUUID(),
      // Task C: a=b=c=1 -> S^2 = 3 (min=max)
      input: `1\n1\n1\n`,
      expected: `3 3`,
    },
  ]);

  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<Record<string, { ok: boolean; got: string; err?: string }>>({});

  function normalize(s: string) {
    return s.replace(/\r/g, "").trim();
  }

  function createProcessShim(capture: { out: string; err: string }) {
    type Handler = (chunk?: any) => void;
    const stdinHandlers: Record<string, Handler[]> = { data: [], end: [] };

    const stdin = {
      _encoding: "utf-8",
      resume() {},
      setEncoding(enc: string) { (stdin as any)._encoding = enc; },
      on(ev: "data" | "end", cb: Handler) {
        if (stdinHandlers[ev]) stdinHandlers[ev].push(cb);
      },
      _emit(ev: "data" | "end", payload?: any) {
        for (const cb of stdinHandlers[ev] || []) cb(payload);
      },
    } as const;

    const stdout = {
      write(chunk: any) { capture.out += String(chunk); },
    } as const;

    const stderr = {
      write(chunk: any) { capture.err += String(chunk); },
    } as const;

    return { stdin, stdout, stderr } as const;
  }

  function runOne(codeText: string, input: string) {
    const cap = { out: "", err: "" };
    const proc = createProcessShim(cap);

    // Proxy console to stdout for convenience
    const consoleProxy = {
      log: (...args: any[]) => { cap.out += args.map(String).join(" ") + "\n"; },
      error: (...args: any[]) => { cap.err += args.map(String).join(" ") + "\n"; },
    };

    // Execute user code in a restricted-ish sandbox. This is NOT secure; it's for local testing only.
    const wrapped = `"use strict";\nconst process = arguments[0];\nconst console = arguments[1];\ntry {\n${codeText}\n} catch(e) { throw e; }\n// After code defines handlers, feed input and close stdin\nprocess.stdin._emit("data", arguments[2]);\nprocess.stdin._emit("end");`;

    try {
      // eslint-disable-next-line no-new-func
      const fn = new Function(wrapped);
      fn(proc as any, consoleProxy as any, input);
    } catch (e: any) {
      cap.err += (e?.stack || String(e));
    }

    return { out: cap.out, err: cap.err };
  }

  async function runAll() {
    setRunning(true);
    const next: Record<string, { ok: boolean; got: string; err?: string }> = {};

    for (const c of cases) {
      const { out, err } = runOne(code, c.input);
      const ok = normalize(out) === normalize(c.expected) && !err;
      next[c.id] = { ok, got: out.trim(), err: err || undefined };
    }

    setResults(next);
    setRunning(false);
  }

  function addCase() {
    setCases((prev) => [
      ...prev,
      { id: crypto.randomUUID(), input: "", expected: "" },
    ]);
  }

  function removeCase(id: string) {
    setCases((prev) => prev.filter((x) => x.id !== id));
  }

  const passed = Object.values(results).filter((r) => r.ok).length;
  const total = cases.length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">🧪 Мини‑джадж для задач (JS)</h1>
          <button
            onClick={runAll}
            disabled={running}
            className="btn-primary"
          >
            {running ? "Проверяю…" : "Проверить все"}
          </button>
        </header>

        <section className="grid grid-cols-1 gap-4">
          <div className="card">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-semibold">Ваш код (Node.js stdin/stdout)</h2>
              <button
                className="text-sm underline"
                onClick={() => setCode(`process.stdin.resume();\nprocess.stdin.setEncoding("utf-8");\nvar stdin_input = "";\nprocess.stdin.on("data", function (input) {\n    stdin_input += input;\n});\nprocess.stdin.on("end", function () {\n   main(stdin_input);\n});\nfunction main(input) {\n    // пример: задача A\n    const [a,b,x] = input.trim().split(/\\s+/).map(Number);\n    const ans = Math.floor(x/a)*b;\n    process.stdout.write(String(ans));\n}`)}
              >Вставить шаблон A</button>
            </div>
            <textarea
              className="area area-lg"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              spellCheck={false}
            />
            <p className="muted mt-2">⚠️ Код выполняется в браузере с псевдо‑process. Не безопасно — используйте только для локальных тестов.</p>
          </div>
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Тест‑кейсы ({cases.length})</h2>
            <div className="flex items-center gap-3">
              <span className="text-sm">Пройдено: <b>{passed}</b> / {total}</span>
              <button onClick={addCase} className="px-3 py-1 rounded-xl bg-white shadow">+ Добавить</button>
            </div>
          </div>

          {cases.map((c, idx) => (
            <div key={c.id} className="card space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Кейс #{idx + 1}</h3>
                <button onClick={() => removeCase(c.id)} className="text-sm text-red-600">Удалить</button>
              </div>
              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-gray-600">Ввод (stdin)</label>
                  <textarea
                    className="area area-sm"
                    value={c.input}
                    onChange={(e) => setCases(prev => prev.map(x => x.id===c.id ? { ...x, input: e.target.value } : x))}
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600">Ожидаемый вывод (stdout)</label>
                  <textarea
                    className="area area-sm"
                    value={c.expected}
                    onChange={(e) => setCases(prev => prev.map(x => x.id===c.id ? { ...x, expected: e.target.value } : x))}
                  />
                </div>
              </div>

              {results[c.id] && (
                <div className={`rounded-xl p-3 ${results[c.id].ok ? "bg-green-50" : "bg-red-50"}`}>
                  <div className="text-sm">
                    <div className="flex items-center gap-2">
                      <span className={results[c.id].ok ? "pill-ok" : "pill-fail"}>
                        {results[c.id].ok ? "OK" : "FAIL"}
                      </span>
                      <span className="text-gray-700">Фактический вывод:</span>
                    </div>
                    <pre className="whitespace-pre-wrap break-words mt-1 p-2 rounded bg-white border text-xs">{results[c.id].got || "(пусто)"}</pre>
                    {results[c.id].err && (
                      <>
                        <div className="text-gray-700 mt-2">Ошибки:</div>
                        <pre className="whitespace-pre-wrap break-words mt-1 p-2 rounded bg-white border text-xs text-red-700">{results[c.id].err}</pre>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </section>

        <footer className="text-xs text-gray-500 py-6">
          Подсказка: сравнение идёт после trim() и без \r. Если нужны точные переводы строк, добавляйте их в ожидаемый вывод.
        </footer>
      </div>
    </div>
  );
}
