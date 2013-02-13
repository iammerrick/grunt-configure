# grunt-configure

grunt-configure supports loading a group of configuration files for more organized Grunt configuration!

## Features

- Clean separation of task configuration.
- User overrides for a specific task will be deep merged and kept in a separate file, this means user overrides can be ignored by version control systems.
- Support for JavaScript modules.
- Support for JavaScript modules that are functions.
- Support for JSON.
- Support for YAML.

## Installation

```
npm install grunt-configure
```

## Usage

You call into grunt-configure with a mini match regular expression to select which files you want to construct your configuration from.

```
grunt.initConfig(require('grunt-configure')('./configuration/**/+(.js|.json)'));
```

If this directory had a file called lint.js it would use the export value of that module and the key `lint` for the configuration. If someone had a user version, suffixed by a -user (this can be configured) it would deep merge with the lint.

### Example

#### lint.js
```javascript
module.exports = {
  files: [
    'app/some-feature/**/*.js'
  ]
};
```


#### lint-user.json
```json
{
  "files" : ["app/another-feature/**/*.js"]
}
```

The constructed configuration would look like this:

#### Output

```json
{
  "files" : ["app/another-feature/**/*.js", "app/some-feature/**/*.js"]
}
```

## API

### configure(MiniMatch Pattern, Options)

Available options are `cwd` from which to load the file paths from and `suffix` if `-user` doesn't fit your fancy. An example of changing the suffix:

```javascript
configure('./configuration/**/*.js', {
  suffix: '-override'
});
```

Now files with that suffix, like "lint-override.js", will be used for the override.