'use strict'

// Basic template description.
exports.description = 'Creates a new application model.'

// Template-specific notes to be displayed before question prompts.
exports.notes = ''

// Template-specific notes to be displayed after question prompts.
exports.after = ''

// Any existing file or directory matching this wildcard will cause a warning.
//exports.warnOn = '*'

// The actual init template.
exports.template = function(grunt, init, done) {

  init.process({}, [
    // Prompt for these values.
    {
      name: 'name',
      message: 'Model name',
      default: null,
      validator: /^[A-Z]\w+/,
      warning: 'Model name should be in full CamelCase.'
    },
    {
      name: 'collection',
      message: 'Collection name (auto)',
      default: '',
      warning: 'Collection name should be blank for auto (based on model name) or be a valid MongoDB collection name.'
    }
  ], function(err, props) {
    props.lower = props.name.replace(/(.)([A-Z])/g, '$1-$2').toLowerCase()

    if (props.collection === '') {
      props.collection = props.lower
    }

    // Files to copy (and process).
    var files = init.filesToCopy(props)

    // Actually copy (and process) files.
    init.copyAndProcess(files, props)

    // All done!
    done()
  })

}