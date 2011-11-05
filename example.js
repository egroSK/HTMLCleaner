var HTMLCleaner = require('./');

var cleaner = new HTMLCleaner();

cleaner.cleanString('<p>test</p>', function (err, data) {
	if (err) {
		return console.error('HTMLCleaner error: ' + err);
	}
	console.log(data);
});

// cleaner.cleanFile('example_file.js', function (err, data) {
// 	if (err) {
// 		return console.error('HTMLCleaner error: ' + err);
// 	}
// 	console.log(data);
// });