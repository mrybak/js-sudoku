$(function() {
	// difficulty levels here? 
	
	$('.start_game .btn').click(function() {
		alert( $(this).attr('difficulty') ); 
		Sudoku.init();
		var boardNumber = Math.floor(Math.random()*20);
		Sudoku.loadBoard(boards.easy[boardNumber], boards.easy[boardNumber], solutions.easy[boardNumber]);
	});
	

});