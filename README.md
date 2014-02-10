Sweet Jumps - A Node.js Webapp Framework
========================================

*NOTE - Sweet Jumps is currently undergoing a major refactor to a standard Node.js module and this documentation may contain inaccuracies.*

Boilerplate / framework for Node.js web applications to enable consistency of approach and maintenance.

Copyright 2013 Northern Arizona University

This file is part of Sweet Jumps.

Sweet Jumps is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

Sweet Jumps is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with Sweet Jumps. If not, see <http://www.gnu.org/licenses/>.


Structure
---------

This is a recommended file structure, but not required. If a particular directory does not make sense to have remove it (eg: views and static in a JSON only webservice).

- *README.md* - A copy of this file.
- *package.json* - NPM package definition. Contains common dependencies. Recommended: Should also contain scripts definitions for running prod, dev, and supervised environments.
- *server-simple.js* - Application entry point. Bootstraps environment, initializes and starts the app. Simple version that uses the App class as is.
- *server-hooked.js* - Application entry point. Bootstraps environment, initializes and starts the app. Example of using application events in initialization.
- *server-extended.js* - Application entry point. Bootstraps environment, initializes and starts the app. Example of extending the base App class and overriding methods.
- **app/** - Contains all local application business logic.
    - **controllers/** - Contains controller or route files. These modules should return a function with the definition `function (app, args...)`.
    - **middleware/** *(optional)* - Contains application specific Express middleware. These modules should return a function with the definition `function (app, args...)`.
    - **models/** - Contains database models. These modules should return an object or class. Recommended: Use MongoDB and Mongoose; the module should export both the Schema and the Model objects (see example).
    - **views/** - Contains view templates. Examples use Jade (preferred), but use whatever makes the most sense for your project.
    - **scripts/** - Contains source files for client-side JavaScript (unminified, CoffeeScript, etc).
    - **styles/** - Contains source files for client-side CSS (unminified, SASS, Stylus, etc).
- **config/** - Application configuration files. Recommended: Files should be separated by environment (at least dev and prod, but also test and stage if appropriate, see example).
- **modules/** - Contains arbitrary class modules that supply some global functionality, but which are separate from the app and not available via NPM. The structure should be similar to node_modules/. This directory also contains middleware which is used across projects that we have found to be generally useful (error handlers, body parsers, etc).
    - **sweet-jumps/** - The main application module.
        - *index.js* - SweetJumps application class. Wraps the Express application, performs necessary setup and includes. Available as `exports.SweetJumps`.
        - *common.js* - Common utility functions used by App, but which might be handy elsewhere. Available as `exports.common`.
        - **test/** - Unit test bootstrap module.
- ***node_modules/*** - Contains module dependencies handled by NPM. Created automatically, do not manually manage.
- **plugins/** *(optional)* - Contains plugin modules specifically built for the [plugin-manager package](https://bitbucket.org/nauewt/plugin-manager "BitBucket"). Plugins may contain controller, module, or library code. If a specific functionality is handled in plugins, the normal directory is optional. Alternatively, use a separate plugin-manager instance for each type of plugin and use the standard directory structure.
- **resources/** *(optional)* - Arbitrary data files specific to this project: Database fixtures and migrations, certificates, documentation, flat files, logs.
- **static/** *(optional)* - Any public files that are served as-is to the client: Images, CSS, JS, etc. Recommended: CSS and JS files should be minified / compiled to this directory from resources/.
- **test/** - Unit and behavioral tests. Recommended: Use this. At the very least do behavioral tests for your controllers.


Quick Start
-----------

1. Create a new Git repository: `git init`
2. Add the boilerplate as an upstream remote: `git remote add upstream git@github.com:NorthernArizonaUniversity/sweet-jumps.git`
3. Pull the boilerplate down: `git pull upstream master`
    - (Optional) Create a new remote repository at your favorite Git hosting site and add it as your origin: `git remote add origin my-repository-uri.git`
    - Push your project to your new origin: `git push -u origin --all`
    - If you later want to grab upgrades from Sweet Jumps, fetch and merge from upstream: `git fetch upstream -v; git merge upstream/master`
4. Install dependencies: `npm install`
5. Choose a server.js template version from the 3 available in the project root. Rename that file to `server.js` and delete the other 2.
6. If you are extending the App class to customize functionality, consider moving the class to its own file in the root folder.
7. Double check the json files in config and customize as needed. In particular, pay attention to the MongoDB and port settings. By default, the devlopment.json file extends and overrides the values in the production.json file, so check both. You should at least have production.json, development.json, and test.json.
    - **Note**: the config file used at runtime is decided by NODE_ENV (usually either 'dev' or 'prod'). To set this for development, either pass it as a command line parameter `node server.js --node-env=dev` or as an environment variable `NODE_ENV=dev node server.js`. Grunt handles this for you during development.
    - You may want to, in your project repository, move the existing config files to .sample.json and make local, ignored copies of them so that passwords, paths, or secrets are not stored in the repository.
8. If you don't already have Grunt on your system, install it: `npm install -g grunt-cli`
9. Use Grunt during development. Several Grunt tasks are included to ease development, provide linting, unit testing, asset management etc. In particular, during development you should have 2 or 3 terminal windows open running the following Grunt tasks.
    - "grunt develop" - Starts the node server.js in dev mode and watches for changes (assumes you have a server.js, if you need to run in a different environment, add it after develop: "grunt develop:test"). You should run at least this task; it replaces the need to run with supervisor.
    - "grunt develop:check" - Watches for server file changes and lints them.
    - "grunt develop:client" - Watches client files for changes and rebuilds if necessary
10. Views are written using the Swig templating engine by default (http://paularmstrong.github.io/swig/docs). If you would like to use a different engine, override the App::initializeViews() method.
11. Start writing routes/controllers, middleware, models, modules, or plugins as needed. Examples are provided for each. CoffeeScript is included by default, so feel free to use it.


Configuration
-------------
Configuration is handled using JSON files in the application's config directory. By default the application will load the JSON file corresponding to the environment being used (usually either 'dev', 'development', 'prod', or 'production', but could be 'test', 'stage', etc). The file loaded can "extend" a different config file and override values specific to the environment without repeating values. Usually, and by default, development.json and test.json both extend production.json. Set all configuration in production and if you need specific settings for development, override just those settings in development.json.

### Configuration keys:

- config-extends - <string> The config file that this file extends and overrides.
- port - <int> The port to listen for incoming connections on.
- auto-start - <boolean> If true, the server will automatically start listening for connections when init is finished. This is generally fine if you are using the simple-server model, but this prevents you from hooking events or extending some functions.
- parse-xml - <boolean> If true, the server will accept and parse requests with XML post bodies if the "Content-Type:application-xml" header is sent.
- session - <mixed> If truthy a session will be initialized for requests.
    - If boolean and true, a default memory store will be used with the application secret.
    - If string, it will try to use it as a key for the type of store to use. Currently only supports "mongo" or "mongodb"
    - If an object, it will use it as the session options object. Store and secret will be set automatically if not provided, and any other cookie options may be specified.
- secret - <string> Secret key used for secure sessions, just set it to some unique value.
- mongodb - <object> MongoDB connection config. Generally will have just one key "uri", which contains a mongodb:// connection string. Other keys as used by Mongoose.
- logger - <object> Logger (Log4js) configuration. By default, just used console, but can also be set to use files in multiple configurations. See https://github.com/nomiddlename/log4js-node for more details.

### Application configuration keys:

- app - Your application's domain configuration. These values will be available in all controllers, views, etc.
- controllers / middleware / models / plugins - Keys in these objects are the names of the components of that type that you would like to load, and the values are specific configuration that will be passed to the init function or options of that component. If this key is omitted entirely.
    - If this key is omitted for controllers, middleware, or models, *every* module of that type will be loaded with a blank configuration. On the other hand, if the key is present but empty, *no* modules of that type will be loaded.
    - If this key is omitted for plugins or is empty, *no* plugins will be loaded. Plugins must be specified by name but the configuration object may be empty.


Included Components
-------------------

- CoffeeScript - http://coffeescript.org/
- Express - http://expressjs.com/
- Swig (views) - http://paularmstrong.github.io/swig
    - Alternatives:
        - Embedded Javascript templates (ejs) - https://npmjs.org/package/ejs
        - Handlebars - https://npmjs.org/package/handlebars
        - Jade - https://npmjs.org/package/jade
- nconf (configuration) - https://npmjs.org/package/nconf
- connect-mongo (session store) - https://npmjs.org/package/connect-mongo
- Mongoose (models) - http://mongoosejs.com/
- Plugin Manager (plugins) - https://bitbucket.org/nauewt/plugin-manager
- Log4js (logging) - https://npmjs.org/package/log4js
- Others:
    - Async
    - Underscore
    - Grunt
- Development / Testing
    - Grunt
    - Mocha (test framework) - http://visionmedia.github.io/mocha/
    - Chai (test assertions) - http://chaijs.com/
    - Zombie (headless http client) - http://zombie.labnotes.org/


Roadmap
-------

- Convert main application code to CoffeScript.
