"use client";

import { useState } from "react";

const DEFAULT_CODE = `process.stdin.resume();
process.stdin.setEncoding("utf-8");
var stdin_input = "";
process.stdin.on("data", function (input) {
    stdin_input += input;  // get the input
});
process.stdin.on("end", function () {
   main(stdin_input);
});
function main(input) {
    process.stdout.write(input); // echo
}`;

export default function Home() {
  const [code, setCode] = useState(DEFAULT_CODE);
  const [stdin, setStdin] = useState("");
  const [stdout, setStdout] = useState("");
  const [error, setError] = useState("");

  const executeCode = () => {
    setStdout("");
    setError("");

    try {
      // Create a mock process object to simulate Node.js environment
      const mockProcess = {
        stdin: {
          listeners: {} as Record<string, Function[]>,
          resume() {},
          setEncoding(_encoding: string) {},
          on(event: string, callback: Function) {
            if (!this.listeners[event]) {
              this.listeners[event] = [];
            }
            this.listeners[event].push(callback);
          },
          emit(event: string, data?: any) {
            if (this.listeners[event]) {
              this.listeners[event].forEach((cb) => cb(data));
            }
          },
        },
        stdout: {
          output: "",
          write(text: string) {
            this.output += text;
          },
        },
      };

      // Execute the user code in a safe context
      const executeUserCode = new Function("process", code);
      executeUserCode(mockProcess);

      // Simulate stdin data
      if (stdin) {
        mockProcess.stdin.emit("data", stdin);
      }
      mockProcess.stdin.emit("end");

      // Get the output
      setStdout(mockProcess.stdout.output);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">
          Mini Judge - JavaScript Code Evaluator
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Code Editor */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Code Editor
            </label>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full h-96 p-4 font-mono text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              spellCheck={false}
            />
          </div>

          {/* Input/Output Panel */}
          <div className="space-y-6">
            {/* Standard Input */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Standard Input (stdin)
              </label>
              <textarea
                value={stdin}
                onChange={(e) => setStdin(e.target.value)}
                className="w-full h-32 p-4 font-mono text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter input data here..."
                spellCheck={false}
              />
            </div>

            {/* Standard Output */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Standard Output (stdout)
              </label>
              <div className="w-full h-32 p-4 font-mono text-sm border border-gray-300 rounded-md bg-gray-50 overflow-auto whitespace-pre-wrap">
                {stdout || <span className="text-gray-400">Output will appear here...</span>}
              </div>
            </div>

            {/* Error Output */}
            {error && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <label className="block text-sm font-medium text-red-700 mb-2">
                  Error
                </label>
                <div className="w-full p-4 font-mono text-sm border border-red-300 rounded-md bg-red-50 text-red-700 overflow-auto whitespace-pre-wrap">
                  {error}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Execute Button */}
        <div className="mt-6 text-center">
          <button
            onClick={executeCode}
            className="px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            Проверить
          </button>
        </div>
      </div>
    </div>
  );
}
