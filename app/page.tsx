'use client';

import { useState } from 'react';

interface TestCase {
  input: string;
  expectedOutput: string;
}

interface TestResult {
  testCase: TestCase;
  actualOutput: string;
  passed: boolean;
  error?: string;
}

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
  const [testCases, setTestCases] = useState<TestCase[]>([
    { input: 'Hello World', expectedOutput: 'Hello World' }
  ]);
  const [results, setResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const addTestCase = () => {
    setTestCases([...testCases, { input: '', expectedOutput: '' }]);
  };

  const updateTestCase = (index: number, field: 'input' | 'expectedOutput', value: string) => {
    const newTestCases = [...testCases];
    newTestCases[index][field] = value;
    setTestCases(newTestCases);
  };

  const removeTestCase = (index: number) => {
    setTestCases(testCases.filter((_, i) => i !== index));
  };

  const runCode = () => {
    setIsRunning(true);
    const testResults: TestResult[] = [];

    testCases.forEach((testCase) => {
      try {
        // Create a simulated process.stdin and process.stdout
        let output = '';
        let inputData = testCase.input;
        let inputEnded = false;

        const mockProcess = {
          stdin: {
            resume() {},
            setEncoding(encoding: string) {},
            on(event: string, callback: Function) {
              if (event === 'data') {
                setTimeout(() => callback(inputData), 0);
              } else if (event === 'end') {
                setTimeout(() => {
                  inputEnded = true;
                  callback();
                }, 10);
              }
            }
          },
          stdout: {
            write(data: string) {
              output += data;
            }
          }
        };

        // Execute the user's code in a controlled context
        const wrappedCode = `
          (function() {
            const process = mockProcess;
            ${code}
          })();
        `;

        // Use Function constructor to execute code
        const executeCode = new Function('mockProcess', wrappedCode);
        executeCode(mockProcess);

        // Wait a bit for async operations to complete
        setTimeout(() => {
          const passed = output.trim() === testCase.expectedOutput.trim();
          testResults.push({
            testCase,
            actualOutput: output,
            passed,
          });

          if (testResults.length === testCases.length) {
            setResults(testResults);
            setIsRunning(false);
          }
        }, 50);
      } catch (error) {
        testResults.push({
          testCase,
          actualOutput: '',
          passed: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });

        if (testResults.length === testCases.length) {
          setResults(testResults);
          setIsRunning(false);
        }
      }
    });
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-gray-800">Mini Judge</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Code Editor Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-4 text-gray-700">Code Editor</h2>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full h-96 p-4 font-mono text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your JavaScript code here..."
            />
          </div>

          {/* Test Cases Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold text-gray-700">Test Cases</h2>
              <button
                onClick={addTestCase}
                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition"
              >
                Add Test Case
              </button>
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto">
              {testCases.map((testCase, index) => (
                <div key={index} className="border border-gray-200 rounded-md p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold text-gray-700">Test Case {index + 1}</h3>
                    {testCases.length > 1 && (
                      <button
                        onClick={() => removeTestCase(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <div className="space-y-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Input
                      </label>
                      <textarea
                        value={testCase.input}
                        onChange={(e) => updateTestCase(index, 'input', e.target.value)}
                        className="w-full p-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={2}
                        placeholder="Enter input..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Expected Output
                      </label>
                      <textarea
                        value={testCase.expectedOutput}
                        onChange={(e) => updateTestCase(index, 'expectedOutput', e.target.value)}
                        className="w-full p-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={2}
                        placeholder="Enter expected output..."
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Run Button */}
        <div className="mt-6 text-center">
          <button
            onClick={runCode}
            disabled={isRunning}
            className="px-8 py-3 bg-blue-500 text-white text-lg font-semibold rounded-md hover:bg-blue-600 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isRunning ? 'Running...' : 'Run Tests'}
          </button>
        </div>

        {/* Results Section */}
        {results.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-4 text-gray-700">Results</h2>
            <div className="space-y-4">
              {results.map((result, index) => (
                <div
                  key={index}
                  className={`border-l-4 p-4 rounded-md ${
                    result.passed ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-700">Test Case {index + 1}</h3>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        result.passed
                          ? 'bg-green-500 text-white'
                          : 'bg-red-500 text-white'
                      }`}
                    >
                      {result.passed ? 'PASSED' : 'FAILED'}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="font-medium text-gray-600">Input:</p>
                      <pre className="bg-white p-2 rounded border border-gray-200 mt-1 whitespace-pre-wrap">
                        {result.testCase.input || '(empty)'}
                      </pre>
                    </div>
                    <div>
                      <p className="font-medium text-gray-600">Expected:</p>
                      <pre className="bg-white p-2 rounded border border-gray-200 mt-1 whitespace-pre-wrap">
                        {result.testCase.expectedOutput || '(empty)'}
                      </pre>
                    </div>
                    <div>
                      <p className="font-medium text-gray-600">Actual:</p>
                      <pre className="bg-white p-2 rounded border border-gray-200 mt-1 whitespace-pre-wrap">
                        {result.actualOutput || '(empty)'}
                      </pre>
                    </div>
                  </div>
                  {result.error && (
                    <div className="mt-2">
                      <p className="font-medium text-red-600">Error:</p>
                      <pre className="bg-white p-2 rounded border border-red-200 mt-1 text-red-700 whitespace-pre-wrap">
                        {result.error}
                      </pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-4 p-4 bg-gray-100 rounded-md">
              <p className="text-lg font-semibold text-gray-700">
                Summary: {results.filter(r => r.passed).length} / {results.length} tests passed
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
