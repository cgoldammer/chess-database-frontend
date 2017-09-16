
export var axios = require('axios');
var MockAdapter = require('axios-mock-adapter');

var mock = new MockAdapter(axios);

const data1 = [
	{"moveTestFen":"rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
	 "moveTestMove":["e4", ["e2", "e4"]],
	 "moveTestBest":["e3", ["e2", "e3"]],
	 "white": "Barry B",
	 "black": "Carry C",
	 "moveTestComparison":-169},
	{"moveTestFen":"rnbqkbnr/pppppppp/8/8/3P4/8/PPP1PPPP/RNBQKBNR b KQkq - 0 1",
	 "moveTestMove":["Nf6", ["g8", "f6"]],
	 "moveTestBest":["Nc6", ["b8", "c6"]],
	 "white": "Barry B",
	 "black": "Donald D",
	 "moveTestComparison":-240}]

const data = {
	'Najdorf': data1,
}

mock.onGet('/moves').reply(200, data);

export const testVar = "hi";

// var processReponse = function(response){
// 	console.log(response.data);
// }

// axios.get('/moves').then(processResponse);
