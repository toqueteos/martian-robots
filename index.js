import { readFileSync } from 'fs';

function main() {
	const filename = process.argv[2];
	const input = parseInputFromFileLines(filename);
	// console.log(input.mapSize);
	// console.log(input.robots[0]);
	const deaths = [];

	let id = 1;
	for (const robot of input.robots) {
		const robotSimulation = simulate(
			id,
			robot,
			input.mapSize,
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

function parseInputFromFileLines(filename) {
	const input = readFileSync(filename, 'utf-8');

	const lines = input.trim().split('\n');

	const mapSize = lines[0]
		.split(' ')
		.map((x) => parseInt(x, 10));

	const robots = [];
	for (
		let index = 1;
		index < lines.length;
		index += 2
	) {
		const [x, y, o] = lines[index].split(' ');
		const instr = lines[index + 1].split('');

		const robot = {
			x: parseInt(x, 10),
			y: parseInt(y, 10),
			o,
			instructions: instr,
		};

		robots.push(robot);
	}

	return {
		mapSize: { x: mapSize[0], y: mapSize[1] },
		robots,
	};
}

function left(input) {
	switch (input) {
		case 'N':
			return 'W';
		case 'E':
			return 'N';
		case 'S':
			return 'E';
		case 'W':
			return 'S';
	}
}

function right(input) {
	switch (input) {
		case 'N':
			return 'E';
		case 'E':
			return 'S';
		case 'S':
			return 'W';
		case 'W':
			return 'N';
	}
}

function forward(x, y, o) {
	switch (o) {
		case 'N':
			return { x, y: y + 1 };
		case 'E':
			return { x: x + 1, y };
		case 'S':
			return { x, y: y - 1 };
		case 'W':
			return { x: x - 1, y };
	}
}

function canForward(mapSize, rx, ry, ro, deaths) {
	const destination = forward(rx, ry, ro);
	const dx = destination.x;
	const dy = destination.y;
	const { x, y } = mapSize;

	for (const d of deaths) {
		if (d.x === rx && d.y === ry && d.o === ro) {
			return 'lost';
		}
	}

	if (dx > x) {
		return 'death';
	}
	if (dx < 0) {
		return 'death';
	}
	if (dy > y) {
		return 'death';
	}
	if (dy < 0) {
		return 'death';
	}

	return 'ok';
}

function simulate(id, robot, mapSize, deaths) {
	let robotLost = false;
	let { x, y, o, instructions } = robot;

	// console.log(
	// 	`Robot #${id} starts at (${x}, ${y}, o=${o})`
	// );
	// console.log(instructions);

	for (const i of instructions) {
		const result = robotInstruction(
			i,
			robot,
			mapSize,
			deaths
		);
		let { x, y, o, lost } = result;
		if (lost) {
			// console.log(
			// 	`Robot #${id}: input=${i} (${x}, ${y}, o=${o}) LOST`
			// );
			robotLost = lost;
			break;
		}

		robot.x = x;
		robot.y = y;
		robot.o = o;

		// console.log(
		// 	`Robot #${id}: input=${i} (${x}, ${y}, o=${o})`
		// );
	}

	// console.log('--------');

	return {
		x: robot.x,
		y: robot.y,
		o: robot.o,
		lost: robotLost,
	};
}

function robotInstruction(
	instruction,
	robot,
	mapSize,
	deaths
) {
	let { x, y, o } = robot;
	let lost = false;
	switch (instruction) {
		case 'L':
			o = left(o);
			break;
		case 'R':
			o = right(o);
			break;
		case 'F':
			const robotCanForward = canForward(
				mapSize,
				x,
				y,
				o,
				deaths
			);

			if (robotCanForward === 'ok') {
				// console.log('canForward ok');
				const position = forward(x, y, o);
				x = position.x;
				y = position.y;
			} else if (robotCanForward === 'death') {
				// console.log('canForward death');
				lost = true;
				deaths.push({ x, y, o });
			} else {
				// console.log('canForward lost');
			}
			break;
	}

	return { x, y, o, lost };
}
