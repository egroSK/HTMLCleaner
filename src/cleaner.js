/**
 * HTMLCleaner cleans input string or file
 * HTMLCleaner returns cleaned data in callback function
 *
 * @author Matej Paulech <matej.paulech@gmail.com>
 */

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
var writer;

/**
 * @constructor
 */
function HTMLCleaner() {
	writer = new Writer(types, use_cdata);
}

module.exports = HTMLCleaner;

/**
 * Start cleaning input string
 * @param {String} string String to clean
 * @param {function(string, string)} callback The callback function(err, data) 
 */
HTMLCleaner.prototype.cleanString = function (string, callback) {
	var parsing = function (cb) {
		cb.onStartDocument(function () {
			output = [];
			opened = [];
			block = [];
		});
		
		cb.onEndDocument(function () {
			while (opened.length > 0) {
				closeTag(_getParent());
			}		
			callback(null, writer.parse(output));
			
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
			// console.log('<CDATA>' + cdata + "</CDATA>");
		});
		cb.onComment(function (msg) {
			// console.log('<COMMENT>' + msg + "</COMMENT>");
		});
		cb.onWarning(function (msg) {
			console.warn('<WARNING>' + msg + "</WARNING>");
		});
		cb.onError(function (msg) {
			callback(JSON.stringify(msg));
		});
	};

	var xmlParser = new xml.SaxParser(parsing);
	xmlParser.parseString('<' + ROOT_EL + '>' + string + '</' + ROOT_EL + '>');
}

/**
 * Start cleaning input file
 * @params {String} filename File to clean
 */
HTMLCleaner.prototype.cleanFile = function (filename, callback) {
	fs.readFile(filename, 'utf8', function (err, data) {
		if (err) {
			return callback(err.message);
		}
		this.cleanString(data, callback);
	}.bind(this));
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
		return out_attrs;
	}
	
	if (act_type.attributes) {
		var i = attrs.length;
		while (i--) {
			var cur_attr_name = attrs[i][0];
			var cur_attr_value = attrs[i][1];
			if (act_type.attributes[cur_attr_name]) {
				var return_attr = act_type.attributes[cur_attr_name](cur_attr_value);
				if (return_attr) {
					out_attrs.push(return_attr);
				}
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
	
	// Find out, if element is in types
	if (!act_type) {
		return opened.push(elem);
	}
	
	// Find out, if element is replacable
	if (act_type.replace) {
		return openTag(act_type.replace, attrs);
	}
	
	// Find out, if parent exists
	if (opened.length > 0) {
		// Find out, if element could be in parent
		var parent = _getParent();
		while ((opened.length > 0) && ((!types[parent]) || (!types[parent]['childs'][elem]))) {
			closeTag(parent);
			parent = _getParent();
		}
	}
	
	// Find out, if element has required parent
	var parent = _getParent();
	if ((act_type.parents) && (!act_type.parents[parent])) {
		openTag(Object.keys(act_type.parents)[0]);
	}
	// Find out, if one of parent elements is block, when there is a inline element -- TODO: remove dependency
	if ((act_type.type === 'inline') && (block.length === 0)) {
		openTag('p');
	}
	
	// Find out, if element is standelone
	if (act_type.standelone) {
		return output.push([STANDELONE_ELEM, elem, _cleanAttributes(elem, attrs)]);
	}
	
	// Find out, if there is the same (inline) element opened
	if ((act_type.type === 'inline') && (opened.indexOf(elem) > -1)) {
		return;
	}
	
	// Create tag
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
		for (var i = 0, ii = attrs.length; i < ii; i++) {
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
	} //if attrs
}

function text(txt) {
	// Find out, if there is some opened element -- TODO: remove dependency
	if (opened.length === 0) {
		openTag('p');
		return output.push([TEXT, txt]);
	}
	
	var parent_type = types[_getParent()];
	
	// Find out, if parent element is supported and if text could be in parent 
	if ((!parent_type) || (!parent_type['childs']['text'])) {
		return;
	}
	
	// Find out, if is opened required (block) element -- TODO: remove dependency
	if (block.length === 0) {
		openTag('p');
	}
	
	output.push([TEXT, txt]);	
}

function closeTag(elem) {	
	var act_type = types[elem];
	
	// Find out, if element is replacable
	if ((act_type) && (act_type.replace)) {
		elem = act_type.replace;
	}
	
	// Find out, if element is opened
	if (opened.indexOf(elem) === -1) {
		return;
	}
	
	// Iterate opened backward, while element is not closed
	var stop = false;
	var closing_tag;
	
	while ((!stop) && (closing_tag = opened.pop())) {
		var closing_type = types[closing_tag];
		
		// Find out, if element is replacable
		if ((closing_type) && (closing_type.replace)) {
			closing_tag = closing_type.replace;
			closing_type = types[closing_tag];
		}
		
		// This is the last iteration, if iterating element is same as closing element
		if (closing_tag === elem) {
			stop = true;
		}
		
		// Find out, if element is supported
		if (closing_type) {
			var last_output = _lastOutput();
			// Check out, if closing element is the same as the last element in output array
			if ((last_output[0] === START_TAG) && (last_output[1] === closing_tag)) {
				// Check out, if element could be empty
				if (closing_type.empty) {
					var poped_tag = output.pop();
					output.push([STANDELONE_ELEM, closing_tag, poped_tag[2]]);
				} else {
					output.pop();
				}
			} else {
				output.push([END_TAG, closing_tag]);
			}
			
			// Find out, if type of element was block
			if (closing_type.type === 'block') {
				block.pop();
			}
		} //end_if unsupported
	} // end_while
}