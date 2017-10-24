module.exports = function(grunt) {
	grunt.loadNpmTasks('grunt-eslint');
	grunt.loadNpmTasks('grunt-jsdoc');
	grunt.option('force', true); // for es-lint
 
	grunt.initConfig({
		eslint: {
			options: {
				config: 'eslintrc.js'
			},
			target: ['.']
		},
		jsdoc : {
			dist : {
				options: {
					configure: './docs/docConfig.json'
				}
			}
		}
	});

	grunt.registerTask('default', ['eslint']);

	grunt.registerTask('docs', ['jsdoc']);

	grunt.registerTask('build', ['eslint']);

	grunt.registerTask('buildLocal', function(source, dest) {
		this.async();
		var exec = require('child_process').exec;
		var fs = require('fs');
		var path = require('path');

		source = (source) ? source : '.';
		dest = (dest) ? dest : '.';
		exec('npm pack '+source, function(error, stdout, stderr) {
			if (error || stderr) {
				console.log('Error packing : '+ ((error) ? error : stderr));
			}
			else {
				var fileName = stdout.slice(0, stdout.length - 1); // remove newline
				fs.renameSync(path.resolve(source, fileName), path.resolve(dest, fileName));
				console.log("Packed and moved to "+dest);
			}
		});
	});


};