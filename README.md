# Mini Judge

A simple code evaluation platform built with Next.js that allows you to write JavaScript code and test it against multiple test cases with stdin/stdout simulation.

## Features

- **Code Editor**: Write JavaScript code with a clean, monospace text editor
- **Test Case Management**: Add, edit, and remove multiple test cases
- **Code Execution**: Run your code against test cases with simulated stdin/stdout
- **Visual Results**: See clear pass/fail indicators with detailed input/output comparison
- **Responsive Design**: Clean, modern UI built with Tailwind CSS

## Getting Started

### Prerequisites

- Node.js 18+ installed on your system
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone https://github.com/cyprus7/mini-judge.git
cd mini-judge
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Building for Production

```bash
npm run build
npm start
```

## Usage

1. **Write Code**: Enter your JavaScript code in the Code Editor panel. The default template shows how to read from stdin and write to stdout.

2. **Add Test Cases**: 
   - Use the "Add Test Case" button to create new test cases
   - Enter the input data and expected output for each test case
   - Remove unwanted test cases using the "Remove" button

3. **Run Tests**: Click the "Run Tests" button to execute your code against all test cases

4. **View Results**: 
   - Each test case shows PASSED (green) or FAILED (red)
   - See the actual output compared to expected output
   - View the summary of total passed tests

## Example

The default code template demonstrates a simple echo program:

```javascript
process.stdin.resume();
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
}
```

## Screenshots

### Initial State
![Mini Judge Initial](https://github.com/user-attachments/assets/5e71d658-4d42-489b-a466-022036f1d4d3)

### Passing Test
![Passing Test](https://github.com/user-attachments/assets/7637d4e7-3b16-4652-b5d0-0ea385e8baf3)

### Mixed Results
![Mixed Results](https://github.com/user-attachments/assets/e2726fc4-3204-4ee2-99fb-db9ded9ea6af)

## Technology Stack

- **Next.js 16** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **React 19** - UI library

## License

ISC