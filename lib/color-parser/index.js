var RGBColor = require('./rgbcolor.js');

module.exports.parseToHex = function (color_string) {
	if (color_string.trim().length < 1) {
		return null;
	}
	
	var color = new RGBColor(color_string);
	if (color.ok) {
		return color.toHex();
	} else {
		return null;	
	}
}