Node.js Webapp Boilerplate
=================

NAUEWT unified boilerplate / skeleton for Node.js web applications for consistency of approach and maintenance.

Structure
--------

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