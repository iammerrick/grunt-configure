var fs = require('fs');
var _ = require('lodash');
var glob = require('glob');
var path = require('path');
var merge = require('./lib/merge');

var ConfigurationLoaders = {
  '.js': function(file) {
    var result = require(file);
    
    if (_.isFunction(result)) {
      result = result();
    }
    
    return result;
  },
  '.json': function(file) {
    var result = fs.readFileSync(file, 'utf8');
    try {
      return JSON.parse(result);
    } catch (e) {
      throw new Error('Unable to parse "' + file + '" file (' + e.message + ').', e);
    }
  },
  '.yml': function(file) {
    var YAML = require('js-yaml');
    var result = fs.readFileSync(file, 'utf8');
    try {
      return YAML.load(result);
    } catch (e) {
      throw new Error('Unable to parse "' + file + '" file (' + e.message + ').', e);
    }
  }
};

function getAvailableLoadersPattern() {
  return '+('+Object.keys(ConfigurationLoaders).join('|')+')';
}

function getSuffixedBasenamePattern(file, suffix) {
  var name = path.basename(file).replace(path.extname(file), '');
  return name + suffix + getAvailableLoadersPattern();
}

function isOverrideFile(file, suffix) {
  return !! file.match(new RegExp(suffix+getAvailableLoadersPattern()+'$'));
}

function getOverrideFile(overrides, file, suffix) {
  var suffixed = getSuffixedBasenamePattern(file, suffix);
  return _.find(overrides, function(override) {
    return !!override.match(new RegExp(suffixed+'$'));
  });
}

function getConfigurationFromFile(file) {
  var loader = ConfigurationLoaders[path.extname(file)];

  if (loader) {
    return loader(file);
  } else {
    return {}; // What do you want from me?
  }
}

/**
 * Generates the configuration object using taskConfiguration for each task.
 */
function configuration(patterns, options) {
  options = options || {};
  options.cwd = options.cwd || process.cwd();
  options.suffix = options.suffix || '-user';

  var suffix = options.suffix;

  if (_.isString(patterns)) {
    patterns = [patterns];
  }

  var all = _(patterns).map(function(pattern) {
    return glob.sync(pattern, options);
  }).flatten().unique().map(function(file) {
    return path.resolve(options.cwd, file);
  }).value();

  var configurationFiles = _.filter(all, function(file){
    return !isOverrideFile(file, suffix);
  });

  var overrides = _.filter(all, function(file){
    return isOverrideFile(file, suffix);
  });

  return configurationFiles.reduce(function(memo, file) {
    var conf = getConfigurationFromFile(file);
    var key = path.basename(file).replace(path.extname(file), '');
    var override = getOverrideFile(overrides, file, suffix);

    if (override) {
      conf = merge(conf, getConfigurationFromFile(override));
    }
    
    memo[key] = conf;

    return memo;
  }, {});
}

module.exports = exports = configuration;