const request = require('request-promise');
const cheerio = require('cheerio');
const fs = require('fs');
const colors = require('colors');

createJSONFile = function (data, name) {
	data = JSON.stringify(data, null, 2);
	fs.writeFile('assets/' + name + '.json', data, 'utf8', function (err) {
		if (err) {
			console.log(
				'An error occured while writing JSON object to file.'.red,
			);
			return console.log(err);
		}
		console.log(`Success! `.green + `Created ${name}.json...`.underline);
	});
};
async function main() {
	const result = await request.get(
		'https://civilization.fandom.com/wiki/Leaders_(Civ6)',
	);
	const $ = cheerio.load(result);
	$('#mw-content-text > table.wikitable > tbody').each((index, element) => {
		if (index > 0) return;
		const tableRows = $(element).find('tr').toArray();
		tableRows.shift();

		const leadersList = tableRows.map((element, index) => {
			// Id from index of the table row
			const leaderId = index;

			// Leader Name and Leader image
			const firstTd = $(element).find('td').eq(0);
			const leader = $(firstTd).find('a').first().attr('title');
			let leaderImg = $(firstTd).find('img').attr('data-src');
			if (leaderImg === undefined) {
				leaderImg = $(firstTd).find('img').attr('src');
			}

			// Leader Civilization and Civilization image
			const secondTd = $(element).find('td').eq(1);
			const civilization = $(secondTd).find('a').first().attr('title');
			let civImg = $(secondTd).find('img').attr('data-src');
			if (civImg === undefined) {
				civImg = $(secondTd).find('img').attr('src');
			}

			return {
				id: `l${leaderId}`,
				leader: leader,
				imgUrl: leaderImg,
				civilization: civilization,
				civImgUrl: civImg,
			};
		});
		createJSONFile(leadersList, 'leaders');
	});
}
main();
