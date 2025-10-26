# Mini Judge

A simple Next.js application for evaluating JavaScript code in the browser with stdin/stdout simulation.

## Features

- Code editor for writing JavaScript code
- Input field for providing stdin data
- Output field displaying stdout results
- Browser-based code execution
- Default code template with Node.js-style stdin/stdout handling

## Getting Started

First, install dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Build

To build the application for production:

```bash
npm run build
```

To start the production server:

```bash
npm start
```

## How It Works

The application simulates Node.js `process.stdin` and `process.stdout` in the browser environment. You can write code that uses stdin/stdout patterns and test it with different inputs directly in the browser.

The default code template demonstrates a simple echo program that reads from stdin and writes to stdout.
