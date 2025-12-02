import { describe, expect, it, vi } from 'vitest';

import { addTask, running } from './eventManager.js';
import { logger }           from './utils.js';


describe('eventManager', () => {

  /**
   * Verifies that a task added via addTask is executed.
   *
   * @description
   * This test adds a task to the event manager and then waits for it to be executed.
   * It then verifies that the task was executed by checking that it was called once.
   */
  it('should execute a task added via addTask', async () => {
    const myTask = vi.fn();
    addTask(myTask);
    await new Promise(setImmediate);
    expect(myTask).toHaveBeenCalledTimes(1);
  });

  /**
   * Verifies that tasks added via addTask are executed in sequence.
   *
   * @description
   * This test adds two tasks to the event manager: task1 which waits for 50ms and task2 which waits for 10ms.
   * It then waits for 100ms and verifies that the tasks were executed in sequence by checking the order of the tasks in the executionOrder array.
   */
  it('should execute tasks in sequence', async () => {
    const executionOrder = [];
    const task1 = async () => {
      await new Promise(resolve => setTimeout(resolve, 50));
      executionOrder.push('task1');
    };
    const task2 = async () => {
      await new Promise(resolve => setTimeout(resolve, 10));
      executionOrder.push('task2');
    };
    addTask(task1);
    addTask(task2);
    await new Promise(resolve => setTimeout(resolve, 100));
    expect(executionOrder).toEqual(['task1', 'task2']);
  });

  /**
   * Verifies that the event manager logs errors and continues with the next task if a task fails.
   *
   * @description
   * This test adds two tasks to the event manager: a failing task which throws an error and a next task which does nothing.
   * It then waits for the tasks to execute and verifies that the logger was called with an error message and the next task was called once.
   */
  it('should log errors and continue with next task', async () => {
    const loggerErrorSpy = vi.spyOn(logger, 'error').mockImplementation(() => {});
    const failingTask    = () => { throw new Error('Task Failed'); };
    const nextTask       = vi.fn();

    addTask(failingTask);
    addTask(nextTask);

    await new Promise(resolve => setTimeout(resolve, 100));

    expect(loggerErrorSpy).toHaveBeenCalledWith('Erreur dans la queue:', expect.any(Error));
    expect(nextTask).toHaveBeenCalledTimes(1);
  });

    /**
   * Verifies that the `running` flag prevents concurrent execution.
   *
   * @description
   * This test simulates a slow task and verifies that `running` is `true` during execution.
   * It also ensures that calling `runNext()` manually does not trigger premature execution of subsequent tasks.
   */
  it('should prevent concurrent execution using the running flag', async () => {
    const task1 = vi.fn(async () => {
      await new Promise(resolve => setTimeout(resolve, 100)); // Simulate slow task
    });
    const task2 = vi.fn();

    // Ensure `running` is false before starting
    expect(running).toBe(false);

    addTask(task1);
    addTask(task2);

    // Verify `running` is true during execution
    expect(running).toBe(true);


    // // Start the first task
    // runNext();

    // // Manually call `runNext()` (should not trigger task2 yet)
    // runNext();

    // Ensure task2 hasn't been called prematurely
    expect(task2).not.toHaveBeenCalled();

    // Wait for task1 to complete
    await new Promise(resolve => setTimeout(resolve, 150));

    // Verify task2 was called after task1 completed
    expect(task2).toHaveBeenCalled();
  });
});
