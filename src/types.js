module.exports = {
	'p': {
		tag_name: 'paragraph',
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
	
	// Lists
	'ul': {
		tag_name: 'text',
		tag_attr: 'list="arrow"',
		inline: true,
	},
	'ol': {
		tag_name: 'text',
		tag_attr: 'list="num"',
	},
	'li': {
		
		parent_el: ['ul', 'ol'],
		inline: true,
	},
	
	// Table
	'table': {
		tag_name: 'table',
	},
	'tr': {
		tag_name: 'tr',
		parent_el: ['table'],
		inline: true,
	},
	'th': {
		tag_name: 'th',
		parent_el: ['tr'],
		inline: true,
	},
	'td': {
		tag_name: 'td',
		parent_el: ['tr'],
		inline: true,
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
	
	// Styles
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
	'u': {
		tag_name: 'u',
		inline: true,
	},
	'strike': {
		tag_name: 'strike',
		inline: true,
	},
	's': {
		tag_name: 'strike',
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

	// Styles - block
	'blockquote': {
		tag_name: 'quote',
	},
	'pre': {
		tag_name: 'code',
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
	
	// Write only content
	'acronym': {
		inline: true,
	},
	'font': {
		inline: true,
	},
	'ins': {
		inline: true,
	},
	'small': {
		inline: true,
	},
	'span': {
		inline: true,
	},
	'st1': {
		inline: true,
	},
	'var': {
		inline: true,
	},
	'wbr': {
		inline: true,
	},
	
	// Replace with another tag
	'br': {
		replace: 'p',
	},
	'div': {
		replace: 'p',
	},
}