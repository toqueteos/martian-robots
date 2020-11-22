const fs = require('fs');
const {
	parseParamsFromInput,
	simulate,
} = require('./martian.js');

function main() {
	const filename = process.argv[2];
	const input = readFileContents(filename);
	const params = parseParamsFromInput(input);
	// console.log(params.mapSize);
	// console.log(params.robots[0]);
	const deaths = [];

	let id = 1;
	for (const robot of params.robots) {
		const robotSimulation = simulate(
			id,
			robot,
			params.mapSize,
			deaths
		);
		id++;

		const { x, y, o, lost } = robotSimulation;
		console.log(
			`${x} ${y} ${o}${lost ? ' LOST' : ''}`
		);
	}
}

main();

function readFileContents(filename) {
	return fs.readFileSync(filename, 'utf-8');
}
