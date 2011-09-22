var types;
var emitter;
var use_cdata;
var cdata_opened;

var START_TAG = 'st';
var END_TAG = 'et';
var TEXT = 'tx';
var STANDELONE_ELEM = 'se';

function Writer(in_types, in_emitter, in_use_cdata) {
	types = in_types;
	emitter = in_emitter;
	use_cdata = in_use_cdata;
}

module.exports = Writer;

Writer.prototype.parse = function (output) {
	cdata_opened = false;
	for (var i = 0, ii = output.length; i < ii; i++) {
		var type = output[i][0];
		var value = output[i][1];
		var attrs = output[i][2];

		switch (type) {
			case START_TAG:
				writeStartTag(value, attrs);
				break;
			case END_TAG:
				writeEndTag(value);
				break;
			case STANDELONE_ELEM:
				writeStandeloneTag(value, attrs);
				break;
			case TEXT:
				writeText(value);
				break;
		}
	}
}

function write(data) {
	emitter.emit('data', data);
}

function openCDATA() {
	if ((use_cdata) && (!cdata_opened)) {
		cdata_opened = true;
		write('<![CDATA[');
	}
}

function closeCDATA() {
	if ((use_cdata) && (cdata_opened)) {
		cdata_opened = false;
		write(']]>');
	}
}

function getAttributes(elem, attrs) {
	var out_attrs = [];
	
	var i = attrs.length;
	while (i--) {
		out_attrs.push(attrs[i][0] + '="' + attrs[i][1] + '"');
	}
	
	return (out_attrs.length > 0) ? ' ' + out_attrs.join(' ')  : '';
}

function writeStartTag(elem, attrs) {
	var act_type = types[elem];
	if ((act_type) && (act_type.tag_name)) {
		closeCDATA();
		write('<' + act_type.tag_name + getAttributes(elem, attrs) + '>');
	}
}

function writeStandeloneTag(elem, attrs) {
	var act_type = types[elem];
	if ((act_type) && (act_type.tag_name)) {
		closeCDATA();
		write('<' + act_type.tag_name + getAttributes(elem, attrs) + '/>');
	}
}

function writeEndTag(elem) {
	var act_type = types[elem];
	if ((act_type) && (act_type.tag_name)) {
		closeCDATA();
		write('</' + act_type.tag_name + '>');
	}
}

function writeText(txt) {
	openCDATA();
	write(txt);
}