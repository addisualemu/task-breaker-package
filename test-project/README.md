# Task Breaker Test Project

This is a test/demo project for the `task-breaker` package. It showcases how to use the task-breaker library to break down tasks into subtasks with configurable detail levels.

## Features Demonstrated

- **Default Behavior**: Using the built-in heuristic provider with default settings
- **Temperature Levels**: Testing different detail levels (1-5)
- **Custom Providers**: Implementing a custom provider function
- **Error Handling**: Catching and handling validation errors

## Setup

```bash
npm install
```

## Running Examples

### Development (with ts-node)
```bash
npm run dev
```

### Build
```bash
npm run build
```

### Run compiled JavaScript
```bash
npm start
```

## Project Structure

```
src/
  index.ts         - Main example file with 4 different use cases
```

## Examples Included

1. **Example 1**: Default behavior with a simple task
2. **Example 2**: Testing different temperature levels (1, 3, 5) to see how detail changes
3. **Example 3**: Using a custom provider function with specific logic
4. **Example 4**: Error handling for invalid inputs

## Dependencies

- `task-breaker`: The main package being tested (local reference)
- `typescript`: For type checking and compilation
- `ts-node`: For running TypeScript directly during development
- `@types/node`: TypeScript types for Node.js
