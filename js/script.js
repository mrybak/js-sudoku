$(function() {
	// Initialize application
	
	// difficulty levels here? 
	Sudoku.init();
	
	// Load riddle
	// var availableBoardsCount = // check length of certain array
	var boardNumber = Math.floor(Math.random()*20);
	Sudoku.loadBoard(boards.easy[boardNumber], boards.easy[boardNumber], solutions.easy[boardNumber]);
});