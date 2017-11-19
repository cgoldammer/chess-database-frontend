
export var axios = require('axios');
var MockAdapter = require('axios-mock-adapter');

var mock = new MockAdapter(axios);

const data1 = [
	{"fen":"rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
	 "move":["e4", ["e2", "e4"]],
	 "best":["e3", ["e2", "e3"]],
	 "white": "Barry B",
	 "black": "Carry C",
	 "comparison":-169},
	{"fen":"rnbqkbnr/pppppppp/8/8/3P4/8/PPP1PPPP/RNBQKBNR b KQkq - 0 1",
	 "move":["Nf6", ["g8", "f6"]],
	 "best":["Nc6", ["b8", "c6"]],
	 "white": "Barry B",
	 "black": "Donald D",
	 "comparison":-240}]

const data2 = [
	{"fen":"rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
	 "move":["e4", ["e2", "e4"]],
	 "best":["e3", ["e2", "e3"]],
	 "white": "Ella E",
	 "black": "Carry C",
	 "comparison":-169},
	{"fen":"rnbqkbnr/pppppppp/8/8/3P4/8/PPP1PPPP/RNBQKBNR b KQkq - 0 1",
	 "move":["Nf6", ["g8", "f6"]],
	 "best":["Nc6", ["b8", "c6"]],
	 "white": "Barry B",
	 "black": "Larry L",
	 "comparison":-240}]



const data = {
	'Naj': data1,
	'Temp': data2
}


const d1 = {
	'key': 1,
	'player': 'Anish Giri',
	'evaluations': {1: 0.05, 2: -0.05, 5: 0.25}
	}

const d2 = {
	'key': 2,
	'player': 'Magnus Carlsen',
	'evaluations': {1: -0.05, 2: +0.05, 5: -0.25}
	}

export const moveData = [d1, d2];


mock.onGet('/moves').reply(200, data);
mock.onGet('/moveEval').reply(200, moveData);

