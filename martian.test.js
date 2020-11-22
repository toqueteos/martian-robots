const {
	parseParamsFromInput,
	left,
	right,
	forward,
} = require('./martian.js');

describe('parseParamsFromInput', () => {
	test('ok', () => {
		const input = `5 3
1 1 E
RFRFRFRF
3 2 N
FRRFLLFFRRFLL
0 3 W
LLFFFLFLFL`;
		const params = parseParamsFromInput(input);
		expect(params).toMatchSnapshot();
	});

	test('negative numbers not allowed', () => {
		const testCases = [
			{
				input: `-5 3\n1 1 E\nF`,
				error: 'negative mapSize x',
			},
			{
				input: `5 -3\n1 1 E\nF`,
				error: 'negative mapSize y',
			},
			{
				input: `5 3\n-1 1 E\nF`,
				error: 'negative robot x',
			},
			{
				input: `5 3\n1 -1 E\nF`,
				error: 'negative robot y',
			},
		];
		for (const testCase of testCases) {
			const params = () =>
				parseParamsFromInput(testCase.input);
			expect(params).toThrowError(testCase.error);
		}
	});

	test('invalid or malformed instructions', () => {
		const paramsOk = parseParamsFromInput(`5 3\n1 1 E\nflr`);
		expect(paramsOk).toMatchSnapshot();

		const params = () =>
			parseParamsFromInput(`5 3\n1 1 E\na`);
		expect(params).toThrowError('invalid instruction');
	});

	test('instruction length max 99', () => {
		const i1 = 'F'.repeat(99);
		const params1 = parseParamsFromInput(
			`5 3\n1 1 E\n${i1}`
		);
		expect(params1).toMatchSnapshot;

		const i2 = 'F'.repeat(100);
		const params2 = () =>
			parseParamsFromInput(`5 3\n1 1 E\n${i2}`);
		expect(params2).toThrowError('max instruction length');
	});

	test('max coordinate is 50', () => {
		const paramsOk = parseParamsFromInput(
			`50 50\n50 50 E\nF`
		);
		expect(paramsOk).toMatchSnapshot();

		const testCases = [
			{
				input: `51 3\n1 1 E\nF`,
				error: 'max mapSize x',
			},
			{
				input: `5 51\n1 1 E\nF`,
				error: 'max mapSize y',
			},
			{ input: `5 3\n51 1 E\nF`, error: 'max robot x' },
			{ input: `5 3\n1 51 E\nF`, error: 'max robot y' },
		];
		for (const testCase of testCases) {
			const params = () =>
				parseParamsFromInput(testCase.input);
			expect(params).toThrowError(testCase.error);
		}
	});

	test('invalid or malformed orientations', () => {
		const testCasesOk = [
			`1 1\n1 1 N\nF`,
			`1 1\n1 1 E\nF`,
			`1 1\n1 1 W\nF`,
			`1 1\n1 1 S\nF`,
			`1 1\n1 1 n\nF`,
			`1 1\n1 1 e\nF`,
			`1 1\n1 1 w\nF`,
			`1 1\n1 1 s\nF`,
		];
		for (const input of testCasesOk) {
			const params = parseParamsFromInput(input);
			expect(params).toMatchSnapshot();
		}

		const params = () =>
			parseParamsFromInput(`1 1\n1 1 Z\nF`);
		expect(params).toThrowError('invalid orientation');
	});
});

describe('left', () => {
	const testCasesOk = [
		{ input: 'N', output: 'W' },
		{ input: 'E', output: 'N' },
		{ input: 'S', output: 'E' },
		{ input: 'W', output: 'S' },
	];

	for (const t of testCasesOk) {
		test(`${t.input} -> ${t.output}`, () =>
			expect(left(t.input)).toBe(t.output));
	}

	test('Z -> Error', () => {
		expect(() => left('Z')).toThrowError('invalid');
	});
});

describe('right', () => {
	const testCasesOk = [
		{ input: 'N', output: 'E' },
		{ input: 'E', output: 'S' },
		{ input: 'S', output: 'W' },
		{ input: 'W', output: 'N' },
	];

	for (const t of testCasesOk) {
		test(`${t.input} -> ${t.output}`, () =>
			expect(right(t.input)).toBe(t.output));
	}

	test('Z -> Error', () => {
		expect(() => right('Z')).toThrowError('invalid');
	});
});

describe('forward', () => {
	// x y 'N' -> x   y+1
	// x y 'E' -> x+1 y
	// x y 'S' -> x   y-1
	// x y 'W' -> x-1 y

	const testCasesOk = [
		{
			input: { x: 0, y: 0, o: 'N' },
			output: { x: 0, y: 1 },
		},
		{
			input: { x: 0, y: 0, o: 'E' },
			output: { x: 1, y: 0 },
		},
		{
			input: { x: 0, y: 0, o: 'S' },
			output: { x: 0, y: -1 },
		},
		{
			input: { x: 0, y: 0, o: 'W' },
			output: { x: -1, y: 0 },
		},
	];

	for (const t of testCasesOk) {
		const { x: ix, y: iy, o: io } = t.input;
		const { x: ox, y: oy } = t.output;

		test(`${ix} ${iy} ${io} -> ${ox} ${oy}`, () =>
			expect(forward(ix, iy, io)).toStrictEqual({
				x: ox,
				y: oy,
			}));
	}

	test("x y 'Z' -> Error", () => {
		expect(() => forward(0, 0, 'Z')).toThrowError('invalid');
	});
});
