'use strict';
const gulp = require('gulp');
const au2gulp = require('@aurelia/plugin-gulp').default;
const build = require('@microsoft/sp-build-web');
const sass = require("@microsoft/gulp-core-build-sass");
build.addSuppression(`Warning - [sass] The local CSS class 'ms-Grid' is not camelCase and will not be type-safe.`);

var getTasks = build.rig.getTasks;
build.rig.getTasks = function () {
  var result = getTasks.call(build.rig);

  result.set('serve', result.get('serve-deprecated'));

  return result;
};

sass.default.mergeConfig({
  preamble: '/* tslint:disable */',
  postamble: '/* tslint:enable */',
  sassMatch: ['src/**/*.scss', 'src/**/*.sass'],
  useCSSModules: false,
  warnOnCssInvalidPropertyName: true,
  dropCssFiles: true,
  warnOnNonCSSModules: true,
  // Cast is needed due to autoprefixer types mismatch due to workspace install in odsp-web
  autoprefixerOptions: {
      overrideBrowserslist: ['> 1%', 'ie >= 11']
  }
});
let aureliaGulpConventionSubTask = build.subTask('aurelia-gulp-subtask', function(gulp, buildOptions, done) {

gulp.src('./src/**/*.ts')
  .pipe(au2gulp()).pipe(gulp.dest("autemp")).on('finish', ()=>
  {
    gulp.src('src/**/*.html')
    .pipe(au2gulp()).pipe(gulp.dest("lib")).on('finish', () => 
    {
      gulp.src('autemp/**/*.css')
      .pipe(gulp.dest("lib")).on('finish', () => done());
    });  
  });
});
let aureliaConvention = build.task('aurelia-convention', aureliaGulpConventionSubTask);
aureliaConvention.getCleanMatch = (config) =>
{
  return ['autemp'];
};
let mysass = build.task('my-sass', sass.default);
build.rig.addPreBuildTask([mysass,aureliaConvention]);
build.initialize(gulp);

build.configureWebpack.mergeConfig({
  additionalConfiguration: (generatedConfiguration) => {
    //generatedConfiguration.module.rules.splice(4,1);

    // Remove .html rule, generally with index 4
    
    // generatedConfiguration.module.rules.forEach( (rule) =>
    // {
    //   console.log(rule);
    // });

    // generatedConfiguration.plugins.push(function () {
    //   this.hooks.done.tapAsync('done', function (stats, callback) {
    //     if (stats.compilation.errors.length > 0) {
    //       throw new Error(
    //         stats.compilation.errors.map(err => err.message || err)
    //       );
    //     }
    //     callback();
    //   });
    // });

    //console.log(JSON.stringify(generatedConfiguration));

    var filtered = generatedConfiguration.module.rules.filter(function(rule, index, arr)
    { 
      if(typeof rule.test.source == "string")
      {
        if(rule.test.source.includes('.html'))
        {
          return true;
        }
      }
      // if(typeof rule.test.source == "string")
      // {
      //   if(rule.test.source.includes('.js'))
      //   {
      //     if(rule.use.includes("source-map-loader"))
      //     {
      //       return true;

      //     }
      //   }
      // }
      return false;
    });

    filtered.forEach( (rule)=>
    {
      var index = generatedConfiguration.module.rules.indexOf(rule);
      generatedConfiguration.module.rules.splice(index,1);
    });
    return generatedConfiguration;
  }
});