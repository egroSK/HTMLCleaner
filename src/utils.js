var http = require('http');
var URL = require('url');
var fs = require('fs');
var Path = require('path');
var crypto = require('crypto');

/**
 * Add data:uri prefix to base64 data(image).
 * @param {string} data Data(Image) in base64 encoding without prefix.
 * @return {string|null} 
 */
module.exports.addBase64UriPrefix = function (data) {
	var getImageType = function (data) {
		if (data.search(/^\/9j\//) > -1) {
			return type = 'image/jpeg';
		}
		if (data.search(/^R0lGOD/) > -1) {
			return type = 'image/gif';
		}
		if (data.search(/^iVBORw0KGgo/) > -1) {
			return type = 'image/png';
		}
		if (data.search(/^Qk/) > -1) {
			return type = 'image/bmp';
		}
		return null;
	};

	var sub_data = data.substr(0, 20);	
	var type = getImageType(sub_data);

	if (type) {
		return 'data:' + type + ',' + data;
	} else {
		console.warn('Utils:addBase64UriPrefix => Unknown image type: ' + sub_data);
		return null;
	}
};

/**
 * Get data from url.
 * @param {string} src Url to get.
 * @param {?string} encoding Accepted encodings are - base64, binary, utf8. Default is binary.
 * @param {function(string, string)} callback Callback function(err, data)
 */
module.exports.getDataFromURL = function (src, encoding, callback) {
	if (typeof arguments[1] === 'function') {
		callback = arguments[1];
		encoding = 'binary';
	} else {
		encoding = (['base64', 'binary', 'utf8'].indexOf(encoding) > -1) ? encoding : 'binary';		
	}

	var url = URL.parse(src);

	var request = http.get({host: url.hostname, path: url.pathname}, function (res) {
		res.setEncoding(encoding);
		
		if (res.statusCode !== 200) {
			return callback('Status code is not 200, but ' + res.statusCode);
		} 
		
		var data = '';
		res.on('data', function (chunk) {
			data += chunk;	
		});
		res.on('end', function () {
			return callback(null, data)
		});
	});

	request.on('error', function (err) {
		return callback('Request error: ' + err);
	});
};

/**
 * Return concent of file.
 * @param {string} path Path to file
 * @param {string} filename Name of file
 * @param {?string} encoding Accepted encodings are - base64, binary, utf8. Default is binary.
 * @return {string|null}
 */
module.exports.getDataFromFile = function (path, filename, encoding) {
	encoding = (['base64', 'binary', 'utf8'].indexOf(encoding) > -1) ? encoding : 'binary';		
	try {
		return fs.readFileSync(Path.join(path, filename), encoding);	
	} catch (e) {
		console.warn('Utils:getDataFromFile(' + path + ', ' + filename + ', ' + encoding + ') => ' + e);
		return null;
	}
}

/**
 * Write data to file with given filename.
 * @param {string} path Path of file
 * @param {string} filename Name of file
 * @param {string} data Data to write
 */
module.exports.writeDataToFile = function (path, filename, data) {
	try {
		var fd = fs.openSync(Path.join(path, filename), 'a');
		fs.writeSync(fd, data);
		fs.closeSync(fd);
	} catch (e) {
		console.warn('Utils:writeDataToFile FAILED with "' + e + '"');
	}
}

/**
 * Return hashed data.
 * @param {string} algorithm Hash algorithm is dependent on the available algorithms supported by the version of OpenSSL on the platform. Examples are 'sha1', 'md5', 'sha256', 'sha512', etc.
 * @param {string} data Data to be hashed.
 * @param {?string} encoding Encoding of the output. Accepted encodings are - base64, binary, hex. Default is binary.
 * @return {string|null}
 */
module.exports.createHash = function (algorithm, data, encoding) {
	encoding = (['base64', 'binary', 'hex'].indexOf(encoding) > -1) ? encoding : 'binary';
	try {
		return crypto.createHash(algorithm).update(data).digest(encoding);
	} catch (e) {
		console.warn('Utils:createHash(' + algorithm + ', ' + data + ' ,' + encoding + ') FAILED with "' + e + '"');
		return null;
	}
}

/**
 * Return encrypted data.
 * @param {string} algorithm Encrypt algorithm is dependent on OpenSSL, examples are 'aes192', etc.
 * @param {string} data Data to be encrypted.
 * @param {?string} encoding Encoding of the output. Accepted encodings are - base64, binary, hex. Default is binary.
 * @return {string|null}
 */
module.exports.encryptString = function (algorithm, data, encoding) {
	encoding = (['base64', 'binary', 'hex'].indexOf(encoding) > -1) ? encoding : 'binary';
	try {
		var encrypter = crypto.createCipher(algorithm, 'hasher');
		var encrypted_string = encrypter.update(data, 'utf8', encoding);
		return encrypted_string + encrypter.final(encoding);
	} catch (e) {
		console.warn('Utils:encryptString(' + algorithm + ', ' + data + ' ,' + encoding + ') FAILED with "' + e + '"');
		return null;
	}
}
