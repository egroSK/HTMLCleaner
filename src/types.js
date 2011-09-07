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
		tag_name: 'h4',
	},
	'h5': {
		tag_name: 'h5',
	},
	'h6': {
		tag_name: 'h6',
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
	
	// Styles - inline
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
	'sub': {
		tag_name: 'sub',
		inline: true,
	},
	'sup': {
		tag_name: 'sup',
		inline: true,
	},
	
	'code': {
		tag_name: 'code',
		inline: true,
	},
	'cite': {
		tag_name: 'quote',
		inline: true,
	},
	'mark': {
		tag_name: 'highlight',
		inline: true,
	},
	
	'span': {
		inline: true,
	},
	
	// Styles - block
	'blockquote': {
		tag_name: 'quote',
	},
	
	// Standelone
	'img': {
		tag_name: 'img',
		standelone: true,
		attributes: {
			'src': function (value) {
				return 'src="' + value + '"';
			},
		},
	},
	
	// Replace with another tag
	'br': {
		replace: 'p',
	},
	'div': {
		replace: 'p',
	},
}