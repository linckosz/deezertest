/**
 * @author Bruno Martin <brunoocto@gmail.com>
 */

 var web_app_timer;

//Delete URI
//window.history.replaceState(null, null, document.location.pathname);

/**
 * Load some actions after the DOM is loaded
 */
attachAction('load', window, function(){

	//Initialize the SDK
	DZ.init({
		appId: web_app_id, //The API_ID stored into NGINX configuration file 'nginx_fronf.conf'.
		channelUrl: top.location.protocol+'//'+document.domain+'/channel.html',
		player: {
			onload : function(){}
		}
	});

	//I am using a setInterval to track when the Application is loaded, I did not find yet which one is the ready callback
	web_app_timer = setInterval(function(){
		if(DZ.initialized){
			clearInterval(web_app_timer);
			if(!web_deezer_code){
				web_app_login();
			} else {
				alert(web_deezer_code);
			}
		}
	}, 200);


	//toto => line for test only, to be deleted
	//web_app_start_player();
});


/**
 * Translation object
 * @return {string}
 */
var web_translation = {

	/**
	 * List of translated sentences
	 */
	list: {},

	/**
	 * Return a sentence in current language setting
	 * @return {string}
	 */
	get: function(number, format){
		if(typeof format == 'undefined'){
			format = 'js';
		}
		if(typeof this.list[number] == 'undefined'){
			return '';
		}
		if(format=='html'){
			return JStoHTML(this.list[number]);
		} else {
			return this.list[number];
		}
	},

}

/**
 * Redirect to the Deezer player
 * @return {void}
 */
var web_app_login = function(){

	/**
	 * Click event for the button 'web_app_login_button'
	 */
	/*
	attachAction('click', 'web_app_login_button', function(){
		DZ.login(function(response) {
			if (response.authResponse) {
				console.log(web_translation.get(2001)); //Fetching your information...
				DZ.api('/user/me', function(response) {
					console.log(response);
					console.log(web_translation.get(2002)+' ' + response.name + '!'); //Welcome back bruno!
					web_app_start_player();
				});
			} else {
				console.log(web_translation.get(2003)); //Login cancelled or unauthorized.
			}
		}, {perms: 'basic_access, manage_library'});
	});
	*/

	/**
	 * Click event for the button 'web_app_login_button'
	 */
	attachAction('click', 'web_app_login_button', function(){
		window.location.href = 'https://connect.deezer.com/oauth/auth.php?app_id=252642&redirect_uri=https://bruno.deezer.bru&perms=basic_access,email,manage_library';
	});

}

/**
 * Display the player and prepare some events
 * @return {void}
 */
var web_app_start_player = function(){

	var elem = document.getElementById('web_top');
	if(elem){
		elem.classList.add('divers_display_none');
	}

	var elem = document.getElementById('web_page');
	if(elem){
		elem.classList.remove('divers_display_none');
	}

	web_trackball.init();

	//toto
	var elem = document.getElementById('web_page_player');
	if(elem){
		elem.style.backgroundImage = "url("+web_page_player_cd_control_cdbg.src+")";
		web_player.play();
		web_playlist();
	}
	

};

/**
 * Rotate DOM elements
 */
var web_rotate = {

	/**
	 * Keep track of current rotation of each element used
	 */
	deg: {},

	/**
	 * Timer for each element we rotate
	 */
	timer: {},

	/**
	 * Rotate an element (clockwise)
	 * @param {string} elem_id - The ID of a DOM element to rotate
	 * @param {number} speed - Higher integer will increase the rotation speed
	 * @return {void}
	 */
	start: function(elem_id, speed){
		if(typeof speed != 'number' || speed <= 0){
			speed = 1;
		}
		var elem = document.getElementById(elem_id);
		if(elem && 'transform' in elem.style){
			elem.style.transition = "transform 1s linear";
			this.stop(elem_id);
			this.timer[elem_id] = setInterval(function(elem_id, speed){
				var elem = document.getElementById(elem_id);
				if(elem){
					var deg = 3*speed;
					if(typeof web_rotate.deg[elem_id] == 'number'){
						deg = web_rotate.deg[elem_id] + 3*speed;
					}
					web_rotate.deg[elem_id] = deg;
					elem.style.transform = "rotate("+deg+"deg)";
				} else {
					web_rotate.stop(elem_id);
				}
			}, 300, elem_id, speed);
		}
	},

	/**
	 * Stop the rotate of an element
	 * @param {string} elem_id - The ID of a DOM element to rotate
	 * @return {void}
	 */
	stop: function(elem_id){
		if(typeof this.timer[elem_id] != 'undefined'){
			clearInterval(this.timer[elem_id]);
		}
	},

};

/**
 * Visual control of the player
 */
var web_player = {

	/**
	 * At true the player is playing music
	 */
	playing: false,

	/**
	 * Setup the player
	 * @param {string} title - Song title
	 * @param {string} by - The author
	 * @param {number} duration - The song's duration
	 * @param {string} url - The Album picture
	 * @return {void}
	 */
	setCDbg: function(title, by, duration, url){
		document.getElementById('web_page_player_song_top_title').innerHTML = title;
		document.getElementById('web_page_player_song_by').innerHTML = by;
		document.getElementById('web_page_player_song_top_duration').innerHTML = convertDuration(duration);
		if(typeof url != 'string'){
			document.getElementById('web_page_player').style.backgroundImage = "url("+web_page_player_cd_control_cdbg.src+")";
		} else {
			document.getElementById('web_page_player').style.backgroundImage = "url("+url+")";
		}
	},

	/**
	 * Start playing the music
	 * @return {void}
	 */
	play: function(){
		web_rotate.start('web_page_player');
		document.getElementById('web_page_player_cd_control_img').src = web_page_player_cd_control_pause.src;
		this.playing = true;
	},

	/**
	 * Stop playing the music
	 * @return {void}
	 */
	pause: function(){
		web_rotate.stop('web_page_player');
		document.getElementById('web_page_player_cd_control_img').src = web_page_player_cd_control_play.src;
		this.playing = false;
	},

	/**
	 * Switch between play and pause
	 * @return {void}
	 */
	switch: function(){
		if(this.playing){
			this.pause();
		} else {
			this.play();
		}
	},

};

/**
 * Control the track ball
 */
var web_trackball = {

	/**
	 * DOM element of the track ball
	 */
	initialized: false,

	/**
	 * DOM element of the track ball
	 */
	elem_ball: null,

	/**
	 * DOM element of the track line
	 */
	elem_line: null,

	/**
	 * DOM element of the track cover (already read)
	 */
	elem_cover: null,

	/**
	 * At true we are move the track ball manually
	 */
	mouse_move: false,

	/**
	 * Initialize mouse events
	 * @return {void}
	 */
	init: function(){
		//Make sure we initialized only once
		if(this.initialized){
			return false;
		}

		this.elem_ball = document.getElementById('web_page_player_song_track_ball');
		this.elem_line = document.getElementById('web_page_player_song_track');
		this.elem_cover = document.getElementById('web_page_player_song_track_cover');

		attachAction('click', 'web_page_player_cd_control_img', function(){
			web_player.switch();
		});

		attachAction('mousedown', this.elem_ball, function(event){
			web_trackball.mouse_move = true;
		});

		attachAction('mouseup', document, function(){
			web_trackball.mouse_move = false;
		});

		attachAction('mouseleave', document, function(){
			web_trackball.mouse_move = false;
		});

		attachAction('blur', window, function(){
			web_trackball.mouse_move = false;
		});

		attachAction('mousemove', document, function(event){
			web_mouse_position.set(event);
			web_trackball.move();
		});

	},

	/**
	 * Place the track ball on the line
	 * @param {number} percentage - Percentage of progression of the music played
	 * @return {void}
	 */
	position: function(percentage){
		if(typeof percentage == 'number' && percentage >= 0 && percentage <= 100){
			this.elem_ball.style.left = percentage+"%";
			this.elem_cover.style.width = percentage+"%";
		}
	},

	/**
	 * Move the track ball according to the current mouse position
	 * @return {void}
	 */
	move: function(){
		if(web_trackball.mouse_move){
			var min = this.elem_line.getBoundingClientRect().x;
			var max = min + this.elem_line.getBoundingClientRect().width;
			if(web_mouse_position.x <= min){
				this.position(0);
			} else if(web_mouse_position.x >= max){
				this.position(100);
			} else {
				var progress = web_mouse_position.x - min;
				var total = max - min;
				this.position(100*progress/total);
			}
		}
	},

};

/**
 * Refresh the favorite playlist
 * @param {array} songs - List of songs to display
 * @return {void}
 */
var web_playlist = function(songs){

	//Help to have the scrollbar for the playlist only
	document.getElementById('web_page_playlist').style.height = window.innerHeight+'px';

	//Fake list
	var songs = [
		{
			id: 1,
			title: 'title 1',
			by: 'by 1',
			duration: 111,
			url: '/deezer/web/images/control_cdbg.jpg',
		},
		{
			id: 2,
			title: 'title 2',
			by: 'by 2',
			duration: 222,
			url: '/deezer/web/images/control_play.png',
		},
		{
			id: 3,
			title: 'title 3',
			by: 'by 3',
			duration: 333,
			url: '/deezer/web/images/control_pause.png',
		},
		{
			id: 4,
			title: 'title 4',
			by: 'by 4',
			duration: 444,
			url: '/deezer/web/images/control_error.png',
		},
		{
			id: 11,
			title: 'title 1',
			by: 'by 1',
			duration: 111,
			url: '/deezer/web/images/control_cdbg.jpg',
		},
		{
			id: 12,
			title: 'title 2',
			by: 'by 2',
			duration: 222,
			url: '/deezer/web/images/control_play.png',
		},
		{
			id: 13,
			title: 'title 3',
			by: 'by 3',
			duration: 333,
			url: '/deezer/web/images/control_pause.png',
		},
		{
			id: 14,
			title: 'title 4',
			by: 'by 4',
			duration: 444,
			url: '/deezer/web/images/control_error.png',
		},
		{
			id: 21,
			title: 'title 1',
			by: 'by 1',
			duration: 111,
			url: '/deezer/web/images/control_cdbg.jpg',
		},
		{
			id: 22,
			title: 'title 2',
			by: 'by 2',
			duration: 222,
			url: '/deezer/web/images/control_play.png',
		},
		{
			id: 23,
			title: 'title 3',
			by: 'by 3',
			duration: 333,
			url: '/deezer/web/images/control_pause.png',
		},
		{
			id: 24,
			title: 'title 4',
			by: 'by 4',
			duration: 444,
			url: '/deezer/web/images/control_error.png',
		},
	];

	//The quickest way (but can be CPU hunger) is to completly remove the list and rebuild it.
	//In a proper way, we shoud update existing DOM element, delete those who does not exist in the new playlist, and insert at the correct position the new one
	//For demo only, I use the quick version
	var list = document.getElementsByClassName('web_playlist_line_cloned');
	//We need to clone the list because of its attachment to the DOM
	var list_clone = {};
	for(var i in list){
		if(isNaN(parseInt(i, 10))){ continue; }
		list_clone[i] = list[i];
	}

	for(var i in list_clone){
		detachAllActions('click', list_clone[i].id);
		var parent = list_clone[i].parentElement;
		if(parent){
			parent.removeChild(document.getElementById(list_clone[i].id));
		}
	}

	var web_page_playlist = document.getElementById('web_page_playlist');
	var extra = {};
	for(var i in songs){
		var clone = document.getElementById('-web_playlist_line').cloneNode(true);
		clone.id = 'web_playlist_line_'+songs[i].id;
		clone.classList.add('web_playlist_line_cloned');
		clone.getElementsByClassName('web_playlist_line_content_top_title')[0].innerHTML = parseHTML(songs[i].title);
		clone.getElementsByClassName('web_playlist_line_content_top_duration')[0].innerHTML = convertDuration(songs[i].duration);
		clone.getElementsByClassName('web_playlist_line_content_by')[0].innerHTML = parseHTML(songs[i].by);
		clone.getElementsByClassName('web_playlist_line_picture')[0].style.backgroundImage = "url("+songs[i].url+")";
		web_page_playlist.appendChild(clone);
		detachAllActions('click', clone.id);
		extra[clone.id] = songs[i];
		attachAction('click', clone.id, function(){
			web_player.setCDbg(extra[this.id].title, extra[this.id].by, extra[this.id].duration, extra[this.id].url);
			web_player.play();
		}, songs[i]);
	}

}


attachAction('resize', window, function(){
	document.getElementById('web_page_playlist').style.height = window.innerHeight+'px';
});


var toto = function(){

	DZ.api('/user/me/playlists', function(response){
		console.log(response);
	});

}

