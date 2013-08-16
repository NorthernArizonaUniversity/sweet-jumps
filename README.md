Node.js Webapp Boilerplate
==========================

NAUEWT unified boilerplate / skeleton for Node.js web applications for consistency of approach and maintenance.

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
- **config/** - Application configuration files. Recommended: Files should be separated by environment (at least dev and prod, but also test and stage if appropriate, see example).
- **modules/** - Contains arbitrary class modules that supply some global functionality, but which are separate from the app and not available via NPM. The structure should be similar to node_modules/. This directory also contains middleware which is used across projects that we have found to be generally useful (error handlers, body parsers, etc).
    - **app/** - The main application module.
        - *index.js* - Application class. Wraps the Express application, performs necessary setup and includes. Available as `exports.App`.
        - *common.js* - Common utility functions used by App, but which might be handy elsewhere. Available as `exports.common`.
- ***node_modules/*** - Contains module dependencies handled by NPM. Created automatically, do not manually manage.
- **plugins/** *(optional)* - Contains plugin modules specifically built for the [plugin-manager package](https://bitbucket.org/nauewt/plugin-manager "BitBucket"). Plugins may contain controller, module, or library code. If a specific functionality is handled in plugins, the normal directory is optional. Alternatively, use a separate plugin-manager instance for each type of plugin and use the standard directory structure.
- **resources/** *(optional)* - Arbitrary data files specific to this project: Database fixtures and migrations, certificates, documentation, flat files. Also, any source files for client-side CSS or JS (SASS, unminified JS, CoffeeScript, etc).
- **static/** *(optional)* - Any public files that are served as-is to the client: Images, CSS, JS, etc. Recommended: CSS and JS files should be minified / compiled to this directory from resources/.
- **test/** - Unit and behavioral tests. Recommended: Use this. At the very least do behavioral tests for your controllers.


Quick Start
-----------

 1. Create a new Git repository: `git init`
 2. Add the boilerplate as an upstream remote: `git remote add upstream git@bitbucket.org:nauewt/node.js-webapp-boilerplate.git`
 3. Pull the boilerplate down: `git pull upstream`
 4. Install dependencies: `npm install`
 5. Choose a server.js template version from the 3 available in the project root. Rename that file to `server.js` and delete the other 2.
 6. If you are extending the App class to customize functionality, consider moving the class to its own file in the root folder.
 7. Double check the json files in config and customize as needed. In particular, pay attention to the MongoDB and port settings. By default, the devlopment.json file extends and overrides the values in the production.json file, so check both.
    - **Note**: the config file used at runtime is decided by NODE_ENV (usually either 'dev' or 'prod'). To set this for development, either pass it as a command line parameter `node server.js --node-env=dev` or as an environment variable `NODE_ENV=dev node server.js`. See the scripts section in package.json for exmaples.
 8. Recommended is to use the scripts provided in package.json during development: `npm run-script start-dev` or `npm run-script supervise-dev` if you have Supervisor installed.
 9. Start writing routes/controllers, middleware, models, modules, or plugins as needed. Examples are provided for each. CoffeeScript is included by default, so feel free to use it.


Roadmap
-------

1. Integrate Grunt, allowing for watch compilation of assets, linting, and test running.
2. grunt-init, a cli tast to stub out components.
3. Convert entire boilerplate to grunt-init template.
4. Convert main application code to CoffeScript.