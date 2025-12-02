import { logger } from "./utils";

type AsyncFunction = () => Promise<void>;

const queue: (AsyncFunction | Function)[] = [];

/**
 * exported only for testing
 */
export let running = false;

/**
 * Runs the next action in the queue.
 * If the queue is empty, it will exit.
 * If an action throws an error, it will log the error and exit the process.
 */
export async function runNext() {
  if (running || queue.length === 0) return;
  
  running = true;
  const action = queue.shift();
  
  if (!action) {
    running = false;
    return;
  }
  
  try {
    const result = action();
    if (result && typeof result.then === 'function') {
      await result;
    }
  } catch (error) {
    logger.error('Erreur dans la queue:', error as any);
  } finally {
    running = false;
    runNext();
  }
}

/**
 * Adds a function to the event queue.
 * The function will be executed when all preceding functions have finished.
 * If the function returns a Promise, the event queue will wait for the Promise to resolve before executing the next function.
 * If the function throws an error, the error will be logged and the process will exit with a status code of 0.
 * @param {Function|AsyncFunction} action - The function to add to the event queue.
 */
export function addTask(action: Function | AsyncFunction): void {
  queue.push(action);
  runNext();
}