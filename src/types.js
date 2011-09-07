module.exports = {
	'p': {
		tag_name: 'p',	
	},
	
	// Headers
	'h1': {
		tag_name: 'h1',
	},
	'h2': {
		tag_name: 'h2',
	},
	'h3': {
		tag_name: 'h3',
	},
	'h4': {
		tag_name: 'h3',
	},
	'h5': {
		tag_name: 'h3',
	},
	
	// Inline
	'a': {
		tag_name: 'a',
		inline: true,
		attributes: {
			'href': function (value) {
				return 'href="' + value + '"'; 
			}
		},
	},
	
	// Inline styles
	'b': {
		tag_name: 'strong',
		inline: true,
	},
	'strong': {
		tag_name: 'strong',
		inline: true,
	},
	'i': {
		tag_name: 'em',
		inline: true,
	},
	'em': {
		tag_name: 'em',
		inline: true,
	},
	
	// Standelone
	'img': {
		tag_name: 'img',
		standelone: true,
		attributes: {
			'src': function (value) {
				return 'src="' + value + '"';
			}
		}
	},
	
	// Replace with another tag
	'br': {
		replace: 'p',
	}
}