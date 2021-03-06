Sweet Jumps - A Node.js Web Framework
=====================================

[![NPM Version](http://img.shields.io/npm/v/sweet-jumps.svg)](https://www.npmjs.org/package/sweet-jumps) [![GitHub Release](http://img.shields.io/github/release/NorthernArizonaUniversity/sweet-jumps.svg)](https://github.com/NorthernArizonaUniversity/sweet-jumps/releases) [![License](http://img.shields.io/badge/license-GPL3-green.svg)](https://raw.githubusercontent.com/NorthernArizonaUniversity/sweet-jumps/master/LICENSE)

Sweet Jumps is an Express based framework / boilerplate stack for Node.js web applications built on a set of proven modules with the flexibility to do what you want with your code.

What is it?
-----------

Sweet Jumps was made to fill a need for a full-stack web framework that was built from existing, proven Node modules. This allows Sweet Jumps to both use the power of the community of Node developers while also providing consistency and speed of development by being opinionated about style and structure.

Sweet Jumps is both a boilerplate and a set of tools for generating code, developing, and testing.

Philosophically, Sweet Jumps aims to provide style and practice as well as a physical structure and stack of common modules, but allows you the freedom to swap out what you want. Would you rather use Jade than Handlebars (or don't need templates at all)? Go right ahead! Need a MySQL adapter instead of MongoDB? Not a problem. The rest of the framework will still be available.


Quick Start
-----------

- Install Sweet Jumps globally (or by whatever method you choose) to gain access to the `sj` command line utility:

        $ npm -g install sweet-jumps

- Create a new project directory.
- Generate a new project:

        $ sj create project --name="My Awesome Project" --server-simple

    - Instead of using `--server-simple`, you may wish to use one of the other base application templates: `--server-hooked` allows you to hook Sweet Jumps events, and `--server-extended` provides an application class which extends Sweet Jumps.
    - If you leave this parameter out, all 3 templates will be copied into your project root, and you can choose one by renaming it.
- Install dependencies:

        $ npm install

- **Optional** - Install client-side dependencies:

        $ bower install

- Set up your configuration files in /config.

        $ cp config/production.example.json config/production.json

    - There are also example development and test config files that you might want to copy. The config file used at runtime is decided by NODE_ENV (usually either 'dev' or 'prod').
- When you run your server, it will appear at http://localhost:5050 by default (or 5051 if you also copy the default development config).
- Start writing routes/controllers, middleware, models, etc as needed. Examples are provided for each. See the documentation for `sj` to see what kinds of modules can be generated for you.
- Use Grunt during development. If you don't already have the Grunt CLI on your system, install it:

        $ npm install -g grunt-cli

   Several Grunt tasks are included to ease development, provide linting, unit testing, asset management, and more. In particular, during development you may want to run the following Grunt tasks:

   Start the node server.js in dev mode and watch for changes (if you need to run in a different environment, add it after develop):

        $ grunt develop

   Watches for server file changes and lints them:

        $ grunt develop:check

   Watches client files for changes and rebuilds if necessary:

        $ grunt develop:client



The Sweet Jumps CLI Utility
---------------------------

*Coming Soon*

See:

        $ sj list
        $ sj help


Project Structure
-----------------

This is the standard file structure, but many parts are not required. If a particular directory does not make sense for your application, remove it (eg: views and static in a JSON only webservice).

- **README.md** - A copy of this file.
- **package.json** - NPM package definition. Contains common dependencies, and is generated for your project.
- **server.js** - Application entry point. Bootstraps environment, initializes and starts the app. Note that if you generated your project without a `--server` parameter, you will probably have to create or copy this file.
- **app/** - Contains all your application's business logic.
    - **controllers/** - Contains controller or route files. These modules return a function with the definition `function (app, args...)`.
    - **middleware/** *(optional)* - Contains application specific Express middleware. These modules return a function with the definition `function (app, args...)`.
    - **models/** - Contains database models. By default, Sweet Jumps uses Mongoose models; the module should export both the Schema and the Model objects (see examples).
    - **views/** - Contains view templates. Handlebars is used by default.
    - **scripts/** - Contains source files for client-side JavaScript (unminified, CoffeeScript, etc). If you do not plan to have a build process for your client JavaScript, you may want to remove this.
    - **styles/** - Contains source files for client-side CSS. SASS compilation is included by default, but you may remove this.
- **config/** - Application configuration files. By default, files are named by environment (at least production, development and test, but also staging and others if appropriate, see examples).
- **modules/** - *(optional)* - Contains arbitrary class modules that supply some global functionality, but which are separate from the app and not available via NPM. The structure should be similar to node_modules/.
- **plugins/** *(optional)* - Contains plugin modules specifically built for the [Plugout](https://github.com/NorthernArizonaUniversity/plugout "GitHub") plugin manager. Plugins may contain controller, module, or library code.
- **resources/** *(optional)* - Arbitrary data files specific to this project: Database fixtures and migrations, certificates, documentation, flat files, logs.
- **public/** *(optional)* - Any public files that are served as-is to the client: Images, CSS, JS, etc. It's recommended that CSS and JS files should be minified / compiled to this directory from /app, but that is not required.
- **test/** - Unit and behavioral tests. See examples.


Configuration
-------------

Configuration is handled using JSON files in the application's config directory. By default the application will load the JSON file corresponding to the environment being used (usually either 'dev' / 'development' or 'prod' / 'production', but could be 'test', 'stage', etc).

The loaded configuration file can "extend" a different config file and override values specific to the current environment without repeating values. Usually, development.json and test.json both extend production.json. In general, you will want to set all configuration in production and if you need specific settings for development, override just those settings in development.json.

### Server Configuration

- **config-extends** - (*string*) The config file that this file extends and overrides.
- **port** - (*int*) The port to listen for incoming connections on (default: 5050).
- **parse-xml** - (*boolean*) If true, the server will accept and parse requests with XML post bodies if the "Content-Type:application-xml" header is sent.
- **session** - (*mixed*) If truthy, a session will be initialized for requests.
    - If boolean and true, a default memory store will be used with the application secret.
    - If string, it will try to use it as a key for the type of store to use. Currently only supports "mongo" or "mongodb"
    - If an object, it will use it as the session options object. Store and secret will be set automatically if not provided, and any other cookie options may be specified.
- **secret** - (*string*) Secret key used for secure sessions, set it to some unique value.
- **mongodb** - (*object*) MongoDB connection config. Generally will have just one key "uri", which contains a mongodb:// connection string. Other keys as used by Mongoose.
- **logger** - (*object*) Logger (Log4js) configuration. By default, just uses console, but can also be set to use files in multiple configurations. See https://github.com/nomiddlename/log4js-node for more details.

### Application Configuration

- **app** - Your application's custom configuration. These values will be available in all controllers, views, etc.
- **controllers** / **middleware** / **models** / **plugins** - Keys in these objects are the names of the modules of that type that you would like to load, and the values are configuration that will be passed to the module's init function. See examples.
    - If this key is omitted for controllers, middleware, or models, *every* module of that type will be loaded with a blank configuration. On the other hand, if the key is present but empty, *no* modules of that type will be loaded.
    - If this key is omitted for plugins or is empty, *no* plugins will be loaded. Plugins must be specified by name but the configuration object may be empty.


Controllers & Routers
---------------------

*Coming Soon*


Views
-----

*Coming Soon*

See:

 - https://www.npmjs.org/package/express-hbs
 - http://handlebarsjs.com/


Models
------

*Coming Soon*

See:

 - http://mongoosejs.com/docs/models.html


Included Components
-------------------

- Express 4 - http://expressjs.com/
- Handlebars (views) - https://www.npmjs.org/package/express-hbs & http://handlebarsjs.com/
    - Alternatives:
        - Embedded Javascript templates (ejs) - https://npmjs.org/package/ejs
        - Swig - http://paularmstrong.github.io/swig
        - Jade - https://npmjs.org/package/jade
- nconf (configuration) - https://npmjs.org/package/nconf
- Mongoose (models) - http://mongoosejs.com/
- Plugout (plugins) - https://github.com/NorthernArizonaUniversity/plugout
- connect-mongo (session store) - https://npmjs.org/package/connect-mongo
- Log4js (logging) - https://npmjs.org/package/log4js
- Others:
    - Async
    - Underscore
    - Grunt
- Development / Testing
    - Grunt
    - Mocha (test framework) - http://visionmedia.github.io/mocha/
    - Chai (test assertions) - http://chaijs.com/
    - Zombie (headless HTTP client) - http://zombie.labnotes.org/


License
-------

Copyright 2013/2014 Northern Arizona University

This file is part of Sweet Jumps.

Sweet Jumps is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

Sweet Jumps is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with Sweet Jumps. If not, see <http://www.gnu.org/licenses/>.