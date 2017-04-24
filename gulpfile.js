var gulp = require('gulp'),
	bowerFiles = require('main-bower-files'),
	inject = require('gulp-inject'),
	stylus = require('gulp-stylus'),
	es = require('event-stream');



gulp.task('index', function () {
	var target = gulp.src('public/index.html');
	// It's not necessary to read the files (will speed up things), we're only after their paths:
	var sources = gulp.src(['public/**/*.js', 'public/**/*.css'], {read: false});
	
	var cssFiles = gulp.src('public/**/*.styl')
		.pipe(stylus())
		.pipe(gulp.dest('public'));
	
	gulp.src('public/index.html')
		.pipe(inject(gulp.src(bowerFiles(), {read: false}), {name: 'bower'}, {relative: true}))
		.pipe(inject(es.merge(
			cssFiles,
			gulp.src('public/**/*.js', {read: false})
		)))
		.pipe(gulp.dest('public'));
	
	return target.pipe(inject(sources))
		.pipe(gulp.dest('public'));
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