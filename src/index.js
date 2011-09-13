/**
 * HTMLCleaner cleans input string or file
 * HTMLCleaner fires four type of events - start, data, end, error
 *
 * @author Matej Paulech <matej.paulech@gmail.com>
 */

var EventEmitter = require('events').EventEmitter;
var sys = require('sys');
var fs = require('fs');
var xml = require('../lib/node-xml');
var types = require('./types.js');
var Writer = require('./writer.js');

var ROOT_EL = 'HTMLCleaner_root';

var debug = false;
var emitter;
var writer;

module.exports = HTMLCleaner;

/**
 * @constructor
 */
function HTMLCleaner() {
	EventEmitter.call(this);
	emitter = this;
	this.xmlParser = new xml.SaxParser(parsing);
	writer = new Writer(types, emitter);
}
sys.inherits(HTMLCleaner, EventEmitter);

/**
 * Start cleaning input string
 * @params {String} string String to clean
 */
HTMLCleaner.prototype.cleanString = function (string) {
	this.xmlParser.parseString('<' + ROOT_EL + '>' + string + '</' + ROOT_EL + '>');
}

/**
 * Start cleaning input file
 * @params {String} filename File to clean
 */
HTMLCleaner.prototype.cleanFile = function (filename) {
	fs.readFile(filename, 'utf8', function (err, data) {
		if (err) return outputError(err.message);
		this.cleanString(data);
	}.bind(this));
}