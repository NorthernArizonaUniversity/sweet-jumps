/*
  Copyright 2013-2014 Northern Arizona University

  This file is part of Sweet Jumps.

  Sweet Jumps is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

  Sweet Jumps is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

  You should have received a copy of the GNU General Public License along with Sweet Jumps. If not, see <http://www.gnu.org/licenses/>.
*/

module.exports = function (sj) {
  var tasks = {}

  /**
   * Prints usage information or help for the specified task and exits
   */
  tasks.help = function (task, params, options) {
    var task = (task === 'help') ? params.shift() : task
      , subtask = params.shift()
      , ln = '\n'

    if (sj.getTask(task, subtask) && sj.getTask(task, subtask).help) {
      var help = sj.getTask(task, subtask).help

      sj.print((task + ' ' + (subtask || '')).green + ln)
      sj.print(help.description + ln)

      if (help.extended) {
        sj.print(help.extended + ln)
      }

      sj.printUsage(help.usage)
      sj.printOptions(help.options)

    } else {
      if (task) {
        sj.print('Invalid command or no help available for '.yellow
          + (task + ' ' + (subtask || '')).green
        )
        sj.print()
      }

      sj.print('To get help for a specific task, use ' + (sj.scriptname + ' help <task> [subtask]').green)
      sj.print('For a list of avaialble tasks, use ' + (sj.scriptname + ' list [task]').green)
      sj.print()
    }

    process.exit()
  }

  return tasks
}
