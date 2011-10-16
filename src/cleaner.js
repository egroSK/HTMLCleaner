/**
 * HTMLCleaner cleans input string or file
 * HTMLCleaner fires four types of event - start, data, end, error
 *
 * @author Matej Paulech <matej.paulech@gmail.com>
 */

var EventEmitter = require('events').EventEmitter;
var sys = require('sys');
var fs = require('fs');
var xml = require('../lib/node-xml');
var types = require('./types.js');
var Styles = require('./styles.js');
var Writer = require('./writer.js');

var ROOT_EL = 'HTMLCleaner_root';

var START_TAG = 'st';
var END_TAG = 'et';
var TEXT = 'tx';
var STANDELONE_ELEM = 'se';

var use_cdata = true;
var emitter;
var writer;

/**
 * @constructor
 */
function HTMLCleaner() {
	EventEmitter.call(this);
	emitter = this;
	this.xmlParser = new xml.SaxParser(parsing);
	writer = new Writer(types, emitter, use_cdata);
}
sys.inherits(HTMLCleaner, EventEmitter);

module.exports = HTMLCleaner;

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

function outputError(err) {
	emitter.emit('error', err);
}

/* CLEANER */

var output;
var opened;
var block;

function _getParent() {
	return opened[opened.length - 1];
}

function _lastOutput() {
	return output[output.length - 1];
}

function _cleanAttributes(elem, attrs) {
	var out_attrs = [];
	var act_type = types[elem];
	
	if (!act_type) {
		return;
	}
	
	if (act_type.attributes) {
		var i = attrs.length;
		while (i--) {
			var cur_attr_name = attrs[i][0];
			var cur_attr_value = attrs[i][1];
			if (act_type.attributes[cur_attr_name]) {
				out_attrs.push(act_type.attributes[cur_attr_name](cur_attr_value));
			}
		}
	}

	if (act_type.tag_attrs) {
		var parent = _getParent();
		Object.keys(act_type.tag_attrs).forEach(function (attr) {
			out_attrs.push(act_type.tag_attrs[attr](parent));
		});
	}
	
	return out_attrs;
}

function openTag(elem, attrs) {
	var act_type = types[elem];
	
	// Zistit, ci je v types
	if (!act_type) {
		return opened.push(elem);
	}
	
	// Zistit, ci je replace
	if (act_type.replace) {
		return openTag(act_type.replace, attrs);
	}
	
	// Zistit, ci existuje parent
	if (opened.length > 0) {
		// Zisti, ci moze byt v parentovi
		var parent = _getParent();
		while ((opened.length > 0) && ((!types[parent]) || (!types[parent].childs[elem]))) {
			closeTag(parent);
			parent = _getParent();
		}
	}
	
	// Zisti, ci ma vyzadovaneho parent
	var parent = _getParent();
	if ((act_type.parents) && (!act_type.parents[parent])) {
		openTag(Object.keys(act_type.parents)[0]);
	}
	// Zisti, ci je blokovy pri inline -- TODO: remove dependency
	if ((act_type.type === 'inline') && (block.length === 0)) {
		openTag('p');
	}
	
	// Zisti, ci je standelone
	if (act_type.standelone) {
		return output.push([STANDELONE_ELEM, elem, _cleanAttributes(elem, attrs)]);
	}
	
	// Zisti, ci uz je otvoreny ten isty (pri inline)
	if ((act_type.type === 'inline') && (opened.indexOf(elem) > -1)) {
		return;
	}
	
	// Vytvor tag
	output.push([START_TAG, elem, _cleanAttributes(elem, attrs)]);
	opened.push(elem);
	if (act_type.type === 'block') {
		block.push(elem);
	}

	// Handling tags with attrs as inline styles
	if ((act_type['attrs_as_style']) && (attrs)) {
		for (var i = 0, ii = attrs.length; i < ii; i++) {
			var attr_name = attrs[i][0];
			var attr_value = attrs[i][1];
			var act_style_name = act_type['attrs_as_style'][attr_name];

			if ((act_style_name) && (Styles[act_style_name])) {
				var result = Styles[act_style_name](attr_value);
				if (result) {
					openTag(result[0], (result[1]) ? [result[1]] : []);
				}
			}
		}
	}
	
	// Handling inline styles
	if (attrs) {
		var style_attr;
		var i = attrs.length;
		while (i--) {
			if (attrs[i][0] === 'style') {
				style_attr = attrs[i][1];
				break;
			}
		}
		
		if (style_attr) {
			var styles = style_attr.split(/\s*;\s*/);
			for (var i = 0, ii = styles.length; i < ii; i++) {
				var style = styles[i].split(/\s*:\s*/);
				var style_name = style[0];
				var style_value = style[1];
				
				if (Styles[style_name]) {
					var result = Styles[style_name](style_value);
					if (result) {
						openTag(result[0], (result[1]) ? [result[1]] : []);
					} 
				}
			}
		}
	} // if attrs
}

function text(txt) {
	// Zisti, ci existuje parent -- TODO: remove dependency
	if (opened.length === 0) {
		openTag('p');
		return output.push([TEXT, txt]);
	}
	
	var parent_type = types[_getParent()];
	
	// Zisti, ci je parent unsupported + ci moze byt v parentovi
	if ((!parent_type) || (!parent_type.childs['text'])) {
		return;
	}
	
	// Zisti, ci je otvoreny blokovy element -- TODO: remove dependency
	if (block.length === 0) {
		openTag('p');
	}
	
	output.push([TEXT, txt]);	
}

function closeTag(elem) {	
	var act_type = types[elem];
	
	// Zisti, ci je tag replace
	if ((act_type) && (act_type.replace)) {
		elem = act_type.replace;
	}
	
	// Zisti, ci je tag v opened
	if (opened.indexOf(elem) === -1) {
		return;
	}
	
	// Iteruj opened odzadu, pokym nie je uzatvarany tag
	var stop = false;
	var closing_tag;
	
	while ((!stop) && (closing_tag = opened.pop())) {
		var closing_type = types[closing_tag];
		
		// Zisti, ci je tag replace
		if ((closing_type) && (closing_type.replace)) {
			closing_tag = closing_type.replace;
			closing_type = types[closing_tag];
		}
		
		// Posledna iteracia, ak najdena zhoda
		if (closing_tag === elem) {
			stop = true;
		}
		
		// Zisti, ci je v unsupported
		if (closing_type) {
			var last_output = _lastOutput();
			// Zisti, ci sa aktualny zatvarany tag rovna poslednemu tagu v outpute
			if ((last_output[0] === START_TAG) && (last_output[1] === closing_tag)) {
				// Zisti, ci moze byt empty
				if (closing_type.empty) {
					var poped_tag = output.pop();
					output.push([STANDELONE_ELEM, closing_tag, poped_tag[2]]);
				} else {
					output.pop();
				}
			} else {
				output.push([END_TAG, closing_tag]);
			}
			
			// Zisti, ci bol blockovy
			if (closing_type.type === 'block') {
				block.pop();
			}
		} //end_if unsupported
	} // end_while
}

function parsing(cb) {
	cb.onStartDocument(function () {
		output = [];
		opened = [];
		block = [];
		emitter.emit('start');
	});
	
	cb.onEndDocument(function () {
		while (opened.length > 0) {
			closeTag(_getParent());
		}		
		writer.parse(output);
		emitter.emit('end');
		
		// DEBUG
		// console.log('=== OUTPUT ===');
		// output.forEach(function (out) {
		// 	console.log(out);
		// })
		// console.log('=== /OUTPUT ===');
		// /DEBUG
	});
	
	cb.onStartElementNS(function (elem, attrs, prefix, uri, namespaces) {
		if (elem === ROOT_EL) return;
		if (prefix) {
			elem  = prefix + ':' + elem;
		}
		openTag(elem.toLowerCase(), attrs);
	});

	cb.onEndElementNS(function (elem, prefix, uri) {
		if (elem === ROOT_EL) return;
		if (prefix) {
			elem = prefix + ':' + elem
		}
		closeTag(elem.toLowerCase());
	});

	cb.onCharacters(function (chars) {
		chars = chars.replace('\n', '');
		if (chars.trim().length > 0) {
			text(chars);
		}
	});

	cb.onCdata(function (cdata) {
		console.error('<CDATA>' + cdata + "</CDATA>");
	});
	cb.onComment(function (msg) {
		// console.error('<COMMENT>' + msg + "</COMMENT>");
	});
	cb.onWarning(function (msg) {
		console.error('<WARNING>' + msg + "</WARNING>");
	});
	cb.onError(function (msg) {
		outputError('<ERROR>' + JSON.stringify(msg) + "</ERROR>");
	});
}