var fs = require('fs');
var Parse = require('./parser.js');

const path = '../content/monsters/';

fs.readdir(path, (err, files) => {
	files.forEach(file => {
		if (file == 'overview.html')
			return;

		var data = fs.readFileSync(path + file);
		var results = Parse(data);

		if (!fs.existsSync('./json/'))
			fs.mkdirSync('./json/');

		var filename = './json/' + file.replace('.html', '.json');

		fs.writeFileSync(filename, JSON.stringify(results, null, 4));
	});
});

