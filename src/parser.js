var xml = require('../lib/node-xml');
var types = require('./types.js');
var fs = require('fs');

module.exports = HTMLParser;

function HTMLParser() {
	this.xmlParser = new xml.SaxParser(parse);
};

HTMLParser.prototype.parseString = function (string) {
	this.xmlParser.parseString('<root>' + string + '</root>');
};

HTMLParser.prototype.parseFile = function (filename) {
	var that = this;
	fs.readFile(filename, 'utf8', function (err, data) {
		that.parseString(data);
	});
};

var tags;
var block_opened;
var paragraph_el = types['p'].tag_name;

/* Output functions */

function output(str) {
	console.log(str);
};

function writeStartTag(elem, attrs) {
	output('<' + types[elem].tag_name + handleAttributes(elem, attrs) + '>');
};

function writeEndTag(elem) {
	output('</' + types[elem].tag_name + '>');
};

function writeStandaloneTag(elem, attrs) {
	output('<' + types[elem].tag_name + handleAttributes(elem, attrs) + '/>')
}

function writeText(text) {
	output(text);
}

/* Auxilary functions */

function startBlock() {
	if (!block_opened) {
		tags.push(paragraph_el);
		block_opened = true;
		writeStartTag(paragraph_el);
	}
}

function handleAttributes(elem, attrs) {
	var out_attrs = [];
	
	if (attrs) {
		attrs.forEach(function (attr) {
			if (types[elem].attributes && types[elem].attributes[attr[0]]) {
				out_attrs.push(types[elem].attributes[attr[0]](attr[1]));
			}
		});
	}
	
	return (out_attrs.length > 0) ? ' ' + out_attrs.join(' ')  : '';
}

/* Handling tags */

function handleStartTag(elem, attrs) {
	if (types[elem]) {
		if (types[elem].standelone) {
			return handleStandaloneTag(elem, attrs);
		}
		if (types[elem].inline) {
			return handleInlineStartTag(elem, attrs);
		}
		if (types[elem].replace) {
			return handleStartTag(types[elem].replace);
		}
		if (!types[elem].inline) {
			return handleBlockStartTag(elem, attrs);
		}
	} else {
		tags.push(elem);
	}
}

function handleBlockStartTag(elem, attrs) {
	if (block_opened) {
		var tmp_tags = [];
		var tags_el;
		var end = false;

		// Close
		while ((!end) && (tags_el = tags.pop())) {
			if (types[tags_el] && !types[tags_el].inline) {
				end = true;
			} else {
				tmp_tags.push(tags_el);
			}
			handleEndTag(tags_el);
		}
		
		// Write
		tags.push(elem);
		block_opened = true;
		writeStartTag(elem, attrs);
		
		// Reopen
		var i = tmp_tags.length;
		while (i--) {
			handleStartTag(tmp_tags[i]);
		}
	} else {
		tags.push(elem);
		block_opened = true;
		writeStartTag(elem, attrs);
	}
}

function handleInlineStartTag(elem, attrs) {
	if (!block_opened) {
		startBlock();
	}
	tags.push(elem);
	writeStartTag(elem, attrs);
}

function handleStandaloneTag(elem, attrs) {
	writeStandaloneTag(elem, attrs);
}

function handleText(text) {
	var last_tag = tags[tags.length - 1];
	if (types[last_tag]) {
		if (!block_opened) {
			startBlock();
		}
		writeText(text);
	}
}

function handleEndTag(elem) {
	if (types[elem]) {
		if (block_opened && !types[elem].inline) {
			block_opened = false;
		}
		writeEndTag(elem);
	}
}

/* Parser events */

function parse(cb) {
	cb.onStartDocument(function () {
		tags = [];
		block_opened = false;
	});
	
	cb.onEndDocument(function () {
		var i = tags.length;
		while (i--) {
			handleEndTag(tags[i]);
		}
	});
	
	cb.onStartElementNS(function (elem, attrs, prefix, uri, namespaces) {
		if (elem === 'root') { return; }
		handleStartTag(elem, attrs);
	});

	cb.onEndElementNS(function (elem, prefix, uri) {
		if (elem === 'root') { return; }
		var tmp_tags = [];
		var tags_el;
		var end = false;

		if (tags.indexOf(elem) > -1) {
			while ((!end) && (tags_el = tags.pop())) {
				if (tags_el === elem) {
					end = true;
				} else {
					tmp_tags.push(tags_el);
				}
				handleEndTag(tags_el);
			}

			var i = tmp_tags.length;
			while (i--) {
				handleStartTag(tmp_tags[i]);
			}
		}
	});

	cb.onCharacters(function (chars) {
		handleText(chars);
	});

	cb.onCdata(function (cdata) {
		console.error('<CDATA>' + cdata + "</CDATA>");
	});
	cb.onComment(function (msg) {
		console.error('<COMMENT>' + msg + "</COMMENT>");
	});
	cb.onWarning(function (msg) {
		console.error('<WARNING>' + msg + "</WARNING>");
	});
	cb.onError(function (msg) {
		console.error('<ERROR>' + JSON.stringify(msg) + "</ERROR>");
	});
}