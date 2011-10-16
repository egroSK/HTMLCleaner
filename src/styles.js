var Color_parser = require('../lib/color-parser');

module.exports = {
	'font-weight': function (value) {
		switch (value) {
			case 'bold': 
				return ['strong'];
				break;
		}
	},

	'font-style': function (value) {
		switch (value) {
			case 'italic': 
				return ['em'];
				break;
		}
	},

	'text-decoration': function (value) {
		switch (value) {
			case 'underline':
				return ['u'];
				break;
			case 'line-throught':
				return ['strike'];
				break;
		}
	},

	'background-color': function (value) {
		var color = Color_parser.parseToHex(value);
		if (color) {
			return ['_highlight', ['color', color]];	
		}
	},

	'color': function (value) {
		var color = Color_parser.parseToHex(value);
		if (color) {
			return ['_font', ['color', color]];	
		}
	}
}