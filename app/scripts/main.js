/*
  Copyright 2013 Northern Arizona University

  This file is part of Sweet Jumps.

  Sweet Jumps is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

  Sweet Jumps is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

  You should have received a copy of the GNU General Public License along with Sweet Jumps. If not, see <http://www.gnu.org/licenses/>.
*/

/*
 * This is an example JavaScript client-side *source* file.
 * Source means that this file will not be served to the client directly, but
 * will be compiled or minified by Grunt and the output served from the
 * /static/js directory.
 *
 * If you would rather just serve source files directly, put them in /static
 */

;(function ($) {
  'use strict';
  $(document).ready(function () {
    if (console) {
      console.log('example.js client script initialized!')
    }
  })
})(jQuery)