$(function() {	
	$('.start_game .btn').click(function() {		
		// Initialize application
		Sudoku.init();
		var diffLevel = $(this).attr('difficulty');
		// Check number of boards for this difficulty level
		var	numberOfBoards = boards[diffLevel].length;
		// Choose number of board...
		var	boardNumber = Math.floor(Math.random()*numberOfBoards);
		// ...and load it.
		Sudoku.loadBoard(boards[diffLevel][boardNumber], boards[diffLevel][boardNumber], solutions[diffLevel][boardNumber]);
	});
});