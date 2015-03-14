var cards = new Array(104);
var deck_count = 0;
var gamemode = 0;
/*
//0 = betting 
--deal cards disable betting buttons 
//1 = playing
--stand or bust 
//2 = dealer turn
//3 = payment and results 
*/
var player = {
	hand : [],
	aces : 0,
	total : [],
	span: ".player span",
	total_display: ".player_total span",
	bust : false,
	blackjack : false,
	chips : 2000
};
var dealer = {
	hand : [],
	aces : 0,
	total : [],
	span: ".dealer span",
	total_display: ".dealer_total span",
	bust : false,
	blackjack : false,
};
var game = {
	/* playerwin:
	0 = none
	1 = win
	2 = lose 
	3 = tie */
	playerwin :  0,
	result : '',
	gameover : 1,
	count : 0,
	count_hidden : true,
	pot : 0,
	max_pot_size : 1000
};

$(document).ready(function(){
	setup();
	betting(0);
    shuffle();
    gamecontrol(0);
});


var value = function(card){
	return (((card)%13 >= 10) ? 10 : card%13 + 1);
};

var face = function(card){
	switch(card%13){
		case 0: return 'A';
		case 10: return 'J';
		case 11: return 'Q';
		case 12: return 'K';
		default: return (card%13+1).toString();
	}
};

var suit = function(card){
	if(card < 13) return 'spade';
	if(card >= 13 && card < 26) return 'diamond';
	if(card >= 26 && card < 39) return 'club';	
	if(card >= 39) return 'heart';
};

var setup = function(){
	for (var ii = 0; ii < cards.length; ii++){
        cards[ii] = Math.floor(ii/2);
	}
};

var deal = function(){	 
	draw(player);
	draw(dealer);
	draw(player);
	draw(dealer);
	update();
};

var shuffle = function (){
	var temp;
	game.count = 0;
	for(var ii = 0; ii < 1000; ii++){
		a = Math.floor(Math.random()*52);
		b = Math.floor(Math.random()*52);
		temp = cards[a];
		cards[a] = cards[b];
		cards[b] = temp;
	}
};

var draw = function(side){
	side.hand.push(cards[deck_count]);
	game.count += counting(value(cards[deck_count]));
	deck_count++; 
};

var gameplay = function(){ 
	if(player.bust === true){
		playerwin = 2; 
		console.log('player loses ya');
	} else if (dealer.bust){
		playerwin = 1;	
		console.log('player wins');
	} else if ((player.total[0] > dealer.total[0] || player.total[1] > dealer.total[0]) && dealer.aces === 0){
		playerwin = 1;
		console.log('player wins');
	} else if ( (player.total[0] > dealer.total[1] || player.total[1] > dealer.total[1]) && (player.total[0] > dealer.total[0] || player.total[1] > dealer.total[0]) ){
		playerwin = 1;
		console.log('player wins');
	} else {
		playerwin = 3;
		console.log('player ties');
	} 
	gamecontrol(3);
};

var gamecontrol = function(state){
	$('.controls').css('display','none');
	if (state === 0){
		gamemode = 0;
		$('.menu0').css('display','block');
	} if (state === 1){
		gamemode = 1;
		deal();
		$('.menu1').css('display','block');
	} if (state === 2){
		game.gameover = 0;
		gamemode = 2;
		gameplay();
		$('.menu2').css('display','block');
	} if (state === 3){
		gamemode = 3;
		game.gameover = 0;
		results();
		$('.menu3').css('display','block');
	}
};

var betting = function(amount){
	if(amount === -1){
		player.chips += game.pot;
		game.pot = 0;
	} else {
		if(player.chips - amount > 0 && game.pot < game.max_pot_size){
			game.pot += amount;
			player.chips -= amount;
			if(game.pot > game.max_pot_size){
				player.chips -= (game.max_pot_size - game.pot);
				game.pot = game.max_pot_size;
			}
		}	
	}
	$('.player-chips span').html(player.chips);
	$('.pot span').html(game.pot);
};



var results = function(){
	if (playerwin === 1){
		player.chips += (game.pot*2);
		game.pot = 0;
		betting(-1);
	} else if (playerwin === 2) { 
		game.pot = 0;
		betting(-1);
	} else if (playerwin === 3) {
		player.chips += (game.pot);
		game.pot = 0;
		betting(-1);
	}	
};

var counting = function(card_count){
	if (card_count >= 2 && card_count < 7) {
		return 1;
	} if (card_count === 10 || card_count === 1) {
		return -1;
	} 
	return 0;
};

var player_draw = function(){
	if (player.total[0] <= 21 || (player.total[1] <= 21 && player.aces === 0)) {
		draw(player);
		update();	
	} if (player.total[0] > 21 && player.aces === 0) {
		player.bust = true;
	} if(player.total[0] > 21  && player.total[1] > 21) {
		player.bust = true;
	} if(player.bust === true){
		gamecontrol(2);
	}	
};

var dealer_draw = function(){
	game.gameover = 0;
	if(dealer.blackjack !== true){
		while(dealer.total[0] < 17){
			draw(dealer);
			update();
		}
	}
	if(dealer.total[0] > 21 && dealer.aces === 0){
		dealer.bust = true;
	}
	if(dealer.total[0] > 21 && dealer.total[1] > 21){
		dealer.bust = true;
	}
	update();
	gamecontrol(2);
};

var reset = function(){
	playerwin = 0;
	game.count_hidden = true;
	//shuffle();
	player.total = [0,0];
	dealer.total = [0,0];
	player.aces = 0;
	dealer.aces = 0;
	player.hand = [];
	dealer.hand = [];
	player.bust = false;
	dealer.bust = false;
	player.blackjack = false;
	dealer.blackjack = false;
	gamecontrol(0);
	game.gameover = 0;
	update();
};

var score_handler = function(side){
	side.total[0] = 0;
	side.total[1] = 0;
	for(var i = 0; i < side.hand.length; i++){
		side.total[0] += value(side.hand[i]);
		if(value(side.hand[i]) === 1) {
			side.aces++;
		}
	}
	if(side.aces !== 0){
		side.total[1] = side.total[0] + 10;	
	}
	if(side.total[0] === 21 || side.total[1] === 21){
		side.blackjack = true;
		console.log(side.this + "has blackjack!");
	}
};

var score_display = function(side){
	if(side.total[1] !== 0 && side.total[1] < 22){
		$(side.total_display).html(side.total[1] + ' or ' + side.total[0]);
	} else {
		$(side.total_display).html(side.total[0]);	
	} 
	if(game.gameover === 1){
		$(dealer.total_display).html(value(dealer.hand[1]));
	}
};


var update = function(){
	var playerHTML = '';
	var dealerHTML = '';

	for (var ii = 0; ii < player.hand.length; ii++){
		playerHTML += '<div class="card"><p>' + face(player.hand[ii]) +'</p><img class="suit" src="img/' + suit(player.hand[ii]) + '.svg"/></div>'; 
	} 
	$(player.span).html(playerHTML);

	if(game.gameover === 1) {
		dealerHTML += '<div class="card"><p>?<p></div>';
	}

	for (var jj= game.gameover; jj < dealer.hand.length; jj++){
		dealerHTML += '<div class="card"><p>' + face(dealer.hand[jj]) +'</p><img class="suit" src="img/' + suit(dealer.hand[jj]) + '.svg"/></div>'; 
	} 
	$(dealer.span).html(dealerHTML);

	if(game.gameover === 1 && game.count_hidden === true){
		if(counting(value(dealer.hand[0])) === -1){
			game.count += 1;
		} if (counting(value(dealer.hand[0])) === 1){
			game.count -= 1;
		}
		game.count_hidden = false;
	} if (game.gameover === 0 && game.count_hidden === false) {
		if(counting(value(dealer.hand[0])) === -1){
			game.count -= 1;
		} if (counting(value(dealer.hand[0])) === 1){
			game.count += 1;
		}
		game.count_hidden = true;
	}

	$('.count span').html(game.count);
	score_handler(player);
	score_handler(dealer);
	score_display(player);
	score_display(dealer);
};


