$(function() {
	// Initialize application
	Sudoku.init();
	
	// Load riddle
	var boardNumber = Math.floor(Math.random()*10);
	Sudoku.loadBoard(boards[0], boards[0], solutions[0]);
});