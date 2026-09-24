import { createDebug } from './debug.js'
import { Signal } from './getAbortController.js'
import { createTaskError } from './getSpawnedTask.js'

const debugLog = createDebug('lint-staged:getFunctionTasks')

/**
 * @typedef {{ title: string; task: Function }} FunctionTask
 * @type {(commands: FunctionTask|Array<string|Function>|string|Function) => boolean}
 * @returns `true` if command is a function task
 */
export const isFunctionTask = (commands) => typeof commands === 'object' && !Array.isArray(commands)

/**
 * Handles function configuration and pushes the tasks into the task array
 *
 * @param {object} options
 * @param {AbortController} options.abortController
 * @param {FunctionTask} options.command
 * @param {boolean} options.continueOnError
 * @param {import('./getStagedFiles.js').StagedFile[]} options.files
 * @throws {Error} If the function configuration is not valid
 */
export const getFunctionTask = async ({ abortController, command, continueOnError, files }) => {
  debugLog('Creating task for function %o', command)

  const task = async (ctx) => {
    try {
      await command.task(files.map((file) => file.filepath))
    } catch (e) {
      if (continueOnError !== true) {
        /** Other tasks should be killed */
        abortController.abort(Signal.SIGKILL)
      }

      throw createTaskError(command.title, e, ctx)
    }
  }

  return [
    {
      title: command.title,
      task,
    },
  ]
}
