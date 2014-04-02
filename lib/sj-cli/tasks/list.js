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
   * Lists all available tasks
   */
  tasks.list = function (task, params, options) {
    var list = sj.getTaskNames()
      , task = params.shift()

    if (sj.getTask(task)) {
      list = sj.getSubtaskNames(task) || [task]
    }

    list.forEach(function (taskname) {
      var description = sj.getTask(taskname).help
        ? (' - '.grey + sj.getTask(taskname).help.description)
        : ''

      sj.print(taskname.replace(/_/g, ' ').green + description)
    })

    sj.print()
  }

  tasks.list.help = {
    description: 'Lists all available modules and/or submodules.',
    usage: [
      'list '.green + ' [task]',
    ]
  }

  return tasks
}


