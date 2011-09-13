var fs = require('fs');
var HTMLCleaner = require('./');

var cleaner = new HTMLCleaner();

/// Output to variable
var out;
cleaner.on('start', function () {
	out = '';
})
cleaner.on('data', function (data) {
	out += data;
});
cleaner.on('end', function () {
	console.log('cleaned data: \n' + out);
});
cleaner.on('error', function (err) {
	console.error(err);
});

/// Output to file
// var ws;
// cleaner.on('start', function () {
// 	ws = fs.createWriteStream('example_output.xml', {encoding: 'utf8'});
// })
// cleaner.on('data', function (data) {
// 	ws.write(data);
// });
// cleaner.on('end', function () {
// 	console.log('cleaned data are in file: example_output.xml');
// });
// cleaner.on('error', function(err) {
// 	console.error(err);
// });

cleaner.cleanString('<p>test</p>');
// cleaner.cleanFile('example_file.js');