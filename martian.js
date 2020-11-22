const allowedInstructions = ['F', 'L', 'R'];
const allowedOrientations = ['N', 'E', 'W', 'S'];

const MAX_COORDINATE = 50;

function parseParamsFromInput(input) {
	const lines = input.trim().split('\n');

	const mapSize = lines[0]
		.split(' ')
		.map((x) => parseInt(x, 10));

	const [mx, my] = mapSize;
	if (mx < 0) {
		throw new Error('negative mapSize x');
	}
	if (mx > MAX_COORDINATE) {
		throw new Error(`max mapSize x is ${MAX_COORDINATE}`);
	}
	if (my < 0) {
		throw new Error('negative mapSize y');
	}
	if (my > MAX_COORDINATE) {
		throw new Error(`max mapSize y is ${MAX_COORDINATE}`);
	}

	const robots = [];
	for (let index = 1; index < lines.length; index += 2) {
		const [x, y, o] = lines[index].toUpperCase().split(' ');
		if (!allowedOrientations.includes(o)) {
			throw new Error('invalid orientation found');
		}

		const instr = lines[index + 1].toUpperCase().split('');

		if (instr.length >= 100) {
			throw new Error('max instruction length is 99');
		}

		for (const i of instr) {
			if (!allowedInstructions.includes(i)) {
				throw new Error('invalid instruction found');
			}
		}

		const robot = {
			x: parseInt(x, 10),
			y: parseInt(y, 10),
			o,
			instructions: instr,
		};

		if (robot.x < 0) {
			throw new Error('negative robot x');
		}
		if (robot.x > MAX_COORDINATE) {
			throw new Error(`max robot x is ${MAX_COORDINATE}`);
		}
		if (robot.y < 0) {
			throw new Error('negative robot y');
		}
		if (robot.y > MAX_COORDINATE) {
			throw new Error(`max robot y is ${MAX_COORDINATE}`);
		}

		robots.push(robot);
	}

	return {
		mapSize: { x: mx, y: my },
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

	throw new Error(`invalid orientation ${input}`);
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

	throw new Error(`invalid orientation ${input}`);
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

	throw new Error(`invalid orientation ${o}`);
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

function robotInstruction(instruction, robot, mapSize, deaths) {
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

module.exports = {
	parseParamsFromInput,
	simulate,
	left,
	right,
	forward,
};
