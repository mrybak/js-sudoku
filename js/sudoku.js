/* 
 * Sudoku
 * @author: kontakt@mrybak.pl
 */
var Sudoku = (function() {

	/* DEFAULT CONFIGURATION */
	var config = {
		diffChoiceContainer : ".start_game",
		boardContainer : ".board",
		buttonsContainer : ".buttons",
		timerContainer : ".timer",
		successMessage : "Correctomundo!",
		failureMessage : "Sorry sir, you suck at this."		
	};

	/* PRIVATE METHODS AND VARIABLES */
	var initialBoard = ""; // initial contents of board
	var currentBoard = ""; // current contents of board
	var solvedBoard = "";
	var lastFocusId = ""; // id of parent of last focused input (@see hint() )
	var history = new Array();
	var solvingTime = 0;
	var timerActive = true;
	var undoBuffer = new Array(); // hold undone operations

	/* Returns 9x9 table in which every field has its own id. */
	function drawBoard() {
		var board = '<table border="1">';
		var fieldIndex;
		for ( var rowIndex = 0; rowIndex < 9; rowIndex++) {
			board += '<tr>';
			for ( var colIndex = 0; colIndex < 9; colIndex++) {
				fieldIndex = rowIndex * 9 + colIndex;
				board += '<td id="field_'
						+ fieldIndex
						+ '" class="input"><input type="text" size="1" maxlength="1" /></td>';
			}
			board += '</tr>';
		}
		board += '</table>';

		return board;
	}

	/* Fills table cells with numbers, regarding given board description. */
	function fillBoard() {
		for ( var rowIndex = 0; rowIndex < 9; rowIndex++) {
			for ( var colIndex = 0; colIndex < 9; colIndex++) {
				var fieldIndex = rowIndex * 9 + colIndex;
				var fieldId = 'field_' + fieldIndex;
				if (initialBoard[fieldIndex] > 0)
					$('#' + fieldId).removeClass('input').html(
							initialBoard[fieldIndex]);
				else if (currentBoard[fieldIndex] > 0)
					$('#' + fieldId + ' input').val(currentBoard[fieldIndex]);
				else if (currentBoard[fieldIndex] == 0
						&& $('#' + fieldId + ' input').val() != "")
					$('#' + fieldId + ' input').val("");
			}
		}
	}

	function updateState(fieldIndex) {
		var fieldId = 'field_' + fieldIndex;
		var fieldValue = $('#' + fieldId + ' input').val();
		if (fieldValue != currentBoard[fieldIndex] && fieldValue != '') {
			history.push(currentBoard);
			$('#undo').removeClass('disabled');
			var updatedBoard = currentBoard.substr(0, fieldIndex) + fieldValue
					+ currentBoard.substr(parseInt(fieldIndex) + 1);
			currentBoard = updatedBoard;
		}
	}

	function getColumn(fieldIndex) {
		var indices = new Array();
		var colIndex = fieldIndex % 9;
		for ( var rowIndex = 0; rowIndex < 9; rowIndex++) {
			indices.push(colIndex + (9 * rowIndex));
		}
		return indices;
	}

	function getRow(fieldIndex) {
		var indices = new Array();
		var rowIndex = Math.floor(fieldIndex / 9);
		for ( var colIndex = 0; colIndex < 9; colIndex++) {
			indices.push(colIndex + (9 * rowIndex));
		}
		return indices;
	}

	function getSquare(fieldIndex) {
		var indices = new Array();
		var sqRowIndex = Math.floor((fieldIndex % 9) / 3);
		var sqColIndex = Math.floor(Math.floor(fieldIndex / 9) / 3);
		for ( var x = 0; x < 3; x++) {
			for ( var y = 0; y < 3; y++) {
				indices.push((sqColIndex * 3 + x) * 9 + (sqRowIndex * 3 + y));
			}
		}
		return indices;
	}

	function highlight(fieldSet) {
		for ( var fieldNumber = 0; fieldNumber < fieldSet.length; fieldNumber++) {
			fieldIndex = fieldSet[fieldNumber];
			var fieldId = 'field_' + fieldIndex;
			$('#' + fieldId).addClass('highlighted');
		}
	}

	function highlightFields(fieldIndex) {
		highlight(getColumn(fieldIndex));
		highlight(getRow(fieldIndex));
		highlight(getSquare(fieldIndex));
	}

	function dimFields() {
		$('td').removeClass('highlighted');
	}

	function undo() {
		if (!($('#undo').hasClass('disabled'))) {
			if (history.length > 0) {
				var previousState = history.pop();
				if (history.length == 0) {
					$('#undo').addClass('disabled');
				}
				undoBuffer.push(currentBoard);
				loadBoard(initialBoard, previousState, solvedBoard);
			}
			$('#redo').removeClass('disabled');
		}
		$('#' + lastFocusId + ' input').focus();
	}

	function redo() {
		if (!($('#redo').hasClass('disabled'))) {
			if (undoBuffer.length > 0) {
				var nextState = undoBuffer.pop();
				if (undoBuffer.length == 0) {
					$('#redo').addClass('disabled');
				}
				history.push(currentBoard);
				loadBoard(initialBoard, nextState, solvedBoard);
			}
			$('#undo').removeClass('disabled');
		}
	}

	function hint() {
		if (!($('#hint').hasClass('disabled'))) {
			var activeFieldIndex = lastFocusId.slice(6);
			$('#' + lastFocusId + ' input').val(solvedBoard[activeFieldIndex]);
			updateState(activeFieldIndex);
			solvingTime += 30;
			$(config.timerContainer).fadeOut(200, function() { $(this).fadeIn(); }).html(parseTime(solvingTime));
		}
	}

	function save() { // TODO: multiple cookies
		var boardsJSON = {
				"initialBoard" : initialBoard,
				"currentBoard" : currentBoard,
				"solvedBoard" : solvedBoard,
				"solvingTime" : solvingTime
		};
		setCookie("sudokuBoard", JSON.stringify(boardsJSON));
		alert("game saved");
	}

	/* Loads saved game from cookie */
	function load() {
		var boardsJSON = JSON.parse(getCookie("sudokuBoard"));
		showGame();
		loadBoard(boardsJSON.initialBoard, boardsJSON.currentBoard, boardsJSON.solvedBoard, boardsJSON.solvingTime);
		alert("game loaded");
	}

	
	function togglePauseState() {
		if (timerActive) { // pause
			timerActive = false;
			$(config.boardContainer).slideUp(function() {
				$(config.timerContainer).addClass('stopped');
			});
			$('#pause').html('<i class="icon-play"></i> Resume');
		} else { // resume
			timerActive = true;
			$(config.boardContainer).slideDown(function() {
				$(config.timerContainer).removeClass('stopped');
			});
			$('#pause').html('<i class="icon-pause"></i> Pause');
		}
	}

	/* Converts number of seconds to m:ss format */
	function parseTime(seconds) {
		return Math.floor(seconds / 60) + ":"
				+ ((seconds % 60) < 10 ? "0" : "") + (seconds % 60);
	}

	function startTimer() {
		setInterval(function() {
			if (timerActive) {
				$(config.timerContainer).html(parseTime(++solvingTime));
			}
		}, 1000);
	}
	
	function bindEvents() {
		$('#checker').click(function() {
			alert(isCorrect() ? config.successMessage : config.failureMessage);
		});
		$('#undo').addClass('disabled').click(function() {
			undo();
		});
		$('#redo').addClass('disabled').click(function() {
			redo();
		});
		$('#hint').addClass('disabled').mousedown(function() {
			hint();
		});
		$('#back').click(function() {
			showDiffChoice();
		});
		$('#save').click(function() {
			$('#load').removeClass('disabled');
			save();
		});
		if (!(getCookie("sudokuBoard"))) $('#load').addClass('disabled');
		$('#load').click(function() {
			load();
		});
		$('#pause').click(function() {
			togglePauseState();
		});
		$(':not(#hint)').mouseup(function() {
			if ($('td input:focus').length == 0) {
				$('#hint').addClass('disabled');
			}
		});
		$('td input').focus(function() {
			$('#hint').removeClass('disabled');
			var parentId = $(this).parent().attr('id');
			lastFocusId = parentId;
			highlightFields(parentId.slice(6));
		}).blur(function() {
			dimFields();
			updateState($(this).parent().attr('id').slice(6));
		});
		$('td').hover(function() {
			$(this).addClass('hover');
		}, function() {
			$(this).removeClass('hover');
		});
	}
	
	/* Shows board, buttons and timer and hides diff choice panel */
	function showGame() {
		$(config.diffChoiceContainer).slideUp();
		$(config.boardContainer).parent().show();
		$(config.boardContainer).html(drawBoard()).slideDown();
		$(config.buttonsContainer).show();	
	}
	
	/* Opposite of showGame */
	/* TODO: fix that shit... */
	function showDiffChoice() {
		$(config.diffChoiceContainer).slideDown();
		// timerActive = false; 
		$(config.boardContainer).html(drawBoard()).slideUp();
		$(config.buttonsContainer).hide();	
		$(config.boardContainer).parent().hide();
	}

	/* PUBLIC METHODS */

	function init(customConfig) {
		// update configuration if custom configuration was supplied
		$.extend(config, customConfig);
		
		// display board, buttons, timer etc; hide difficulty choice panel
		showGame();
		
		// start timer
		startTimer();

		// bind events
		bindEvents();	
	}

	function loadBoard(initialBoardDescription, currentBoardDescription,
			solvedBoardDescription, initTime) {
		initialBoard = initialBoardDescription;
		currentBoard = currentBoardDescription;
		solvedBoard = solvedBoardDescription;

		// if no initTime was provided, solvingTime defaults to 0
		solvingTime = initTime || 0;
		$(config.timerContainer).html(parseTime(solvingTime));
		
		// fill board using given board description
		fillBoard();
	}

	/* Checks if current board state is same with proper solution. */
	function isCorrect() {
		return currentBoard == solvedBoard;
	}

	/* Return public interface */
	return {
		init : init,
		loadBoard : loadBoard,
		isCorrect : isCorrect
	}
})();
