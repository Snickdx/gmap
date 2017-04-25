var gulp = require('gulp'),
	bowerFiles = require('main-bower-files'),
	inject = require('gulp-inject'),
	stylus = require('gulp-stylus'),
	es = require('event-stream');



gulp.task('index', function () {
	var target = gulp.src('public/index.html');
	
	var sources = gulp.src(['public/js/**/*.js', 'public/css/**/*.css'], {read: false});
	
	gulp.src('./public/index.html')
		.pipe(inject(gulp.src(bowerFiles(), {read: false}), {name: 'bower'}, {relative: true}))
		.pipe(inject(gulp.src('./public/js/**/*.js', {read: false},  {relative: true})))
		.pipe(gulp.dest('./public'));
	
	return target.pipe(inject(sources)).pipe(gulp.dest('./public'));
});

gulp.task('generate-service-worker', function(callback) {
	var path = require('path');
	var swPrecache = require('sw-precache');
	var rootDir = 'public';
	
	swPrecache.write(
		path.join(rootDir, 'service-worker.js'),
		{
			staticFileGlobs: [rootDir + '/**/*.{js,html,css,png,jpg,gif,svg,eot,ttf,woff}'],
			stripPrefix: rootDir,
			importScripts: [
				'bower_components/firebase/firebase.js',
				'FCMScript.js'
			],
		},
		callback
	);
});


gulp.task('watch', function() {
	
	var paths = {
		javascript: [
			'./public/**/*.js',
			'!./public/js/app.js',
			'!.bower_components/**'
		],
		css: [
			'./public/**/*.css',
			'!.bower_components/**'
		]
	};
	
	gulp.watch([
		paths.javascript,
		paths.css
	], ['index']);
});