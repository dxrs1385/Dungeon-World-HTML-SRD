const parser = require('node-html-parser');

function Parse(html) {
	let root = parser.parse(html);
	let monsterType = root.querySelector('h1').text;

	// since file is not write in stander html, we need to do this to separate each section
	var data = root.toString().split('<h3').map(data => '<h3' + data);
	data.splice(0, 1);
	var htmlObjects = data.map(data => parser.parse(data));

	var results = [];

	for (var htmlObject of htmlObjects) {
		// console.log(htmlObject.toString());

		let { names, tags } = ParseNameAndTag(htmlObject);
		let { damageAction, hitPoint, armorPoint, damageTags } = ParseStats(htmlObject);
		let qualities = ParseQuality(htmlObject);
		let { description, instinct } = ParseDescription(htmlObject);
		let behaviour = ParseBehaviour(htmlObject);

		var result = {
			type: monsterType,
			names: names,
			tags: tags, // TODO: split tags into different groups (as defined in rule book)
			specialQualities: qualities,
			description: description,
			instinct: instinct,
			behaviour: behaviour,
			damageAction: damageAction,
			damageTags: damageTags,
			hitPoint: hitPoint,
			armorPoint: armorPoint,
		};

		results.push(result);
	}

	return results;
}

function ParseBehaviour(htmlObject) {
	var monsterBehaviour = htmlObject.querySelectorAll('ul li');
	var behaviour = [];
	for (var behaviourLi of monsterBehaviour)
		behaviour.push(behaviourLi.text);
	return behaviour;
}

function ParseDescription(htmlObject) {
	var monsterDescription = htmlObject.querySelector('.MonsterDescription');
	var descriptions = monsterDescription.text.split('本能: ').map(data => data.trim());
	var description = descriptions[0].replace(/(\r|\n|\r\n|\t)+/gm, ' ');
	var instinct = descriptions[1];
	return { description, instinct };
}

function ParseQuality(htmlObject) {
	var monsterQualities = htmlObject.querySelector('.MonsterQualities');
	if (monsterQualities)
		var qualities = monsterQualities.text.replace('特性: ', '');
	return qualities;
}

function ParseNameAndTag(htmlObject) {
	var monsterName = htmlObject.querySelector('.MonsterName');

	var name = monsterName.innerHTML;

	var tags = monsterName.querySelector('.Tags');
	if (tags) {
		name = name.replace(tags.toString(), '');
		tags = tags.text.split(', ');
	}

	else
		tags = [];

	name = name.replace('\t', '').replace(')', '');
	name = name.replace(' ', '').split('(');
	var names = { chinese: name[0], english: name[1] };
	return { names, tags };
}

function ParseStats(htmlObject) {
	var monsterStats = htmlObject.querySelectorAll('.MonsterStats');
	if (monsterStats.length != 0) {
		var stats = monsterStats[0].text;
		var damageTags = monsterStats[1].text.split(', ');
		var parts = stats.replace(' ', '').split('), ');
		stats = [(parts[0] + ')')].concat(parts[1].split(', '));

		var damageAction = stats[0];

		var otherDamageTags = damageAction.replace(')', '').split(', ');
		damageAction = otherDamageTags.splice(0, 1) + ')';

		for (var tag of otherDamageTags)
			damageTags.push(tag);

		var hitPoint = parseInt(stats[1].replace(' HP', ''));
		var armorPoint = parseInt(stats[2].replace(' 護甲', ''));
	}
	return { damageAction, hitPoint, armorPoint, damageTags };
}

module.exports = Parse;