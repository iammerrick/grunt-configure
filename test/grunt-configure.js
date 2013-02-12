var configure = require('../index');
var expect = require('chai').expect;

describe('grunt-configure', function() {
  it('should load the proper configuration files', function() {
    var conf = configure('./support/**/*.js', {
      cwd: __dirname
    });

    expect(conf).to.have.property('jshint');
    expect(conf).to.have.property('favorites');
  });

  it('should load the proper configuration without an override', function() {
    var conf = configure('./support/**/*.js', {
      cwd: __dirname
    });

    expect(conf.favorites.soda).to.equal('Diet Coke');
  });

  it('should deep merge user overrides if they exists', function() {
    var conf = configure('./support/**/*.js', {
      cwd: __dirname
    });
    expect(conf.jshint.all.length).to.equal(2);
  });
  
  it('should execute the return value of a module if it is a function', function() {
    var conf = configure('./support/**/*.js', {
      cwd: __dirname
    });
    
    expect(conf.compass.file).to.equal('config.rb');
  });
  
  it('should support overrides if the value is a function', function() {
    var conf = configure('./support/**/*.js', {
      cwd: __dirname
    });
    
    expect(conf.compliment.compliments.length).to.equal(2);
  });
  
  it('should support json files', function() {
    var conf = configure('./support/**/*.json', {
      cwd: __dirname
    });
    
    expect(conf.music.bands.length).to.equal(3);
  });
  
  it('should support yaml files', function() {
    var conf = configure('./support/**/*.yml', {
      cwd: __dirname
    });
    
    expect(conf.soda.favorite).to.equal('Diet Coke');
  });
  
  it('should support merging different types', function() {
    var conf = configure('./support/**/*.+(yml|json)', {
      cwd: __dirname
    });
    
    expect(conf.soda.favorite).to.equal('Diet Coke');
    expect(conf.soda.backup).to.equal('Diet Dr. Pepper');
  });
});