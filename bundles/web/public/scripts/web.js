/**
 * @author Bruno Martin <brunoocto@gmail.com>
 */

 var web_app_timer;

//Delete URI
window.history.replaceState(null, null, document.location.pathname);

/**
 * Load some actions after the DOM is loaded
 */
attachAction('load', window, function(){

	//Force to display remove button for touch devices
	if(supportsTouch){
		document.getElementById('-web_playlist_line').getElementsByClassName('web_playlist_line_remove')[0].classList.add('web_playlist_line_remove_force');
	}

	//Initialize the SDK
	DZ.init({
		appId: web_app_id, //The API_ID stored into NGINX configuration file 'nginx_fronf.conf'.
		channelUrl: top.location.protocol+'//'+document.domain+'/channel.html',
		player: {
			volume: 100,
			onload : function(){},
		}
	});

	//I am using a setInterval to track when the Application is loaded, I did not find yet which one is the ready callback
	web_app_timer = setInterval(function(){
		if(DZ.initialized){
			clearInterval(web_app_timer);
			if(!web_deezer_authorized){
				//Hide the Player button if have access to the player already (just waiting for the API to be loaded)
				document.getElementById('web_app_login_button').classList.remove('divers_display_none');
				attachAction('click', 'web_app_login_button', function(){

					//(prefered method) This method avoid a the use of a popup, but it refresh the main page, and need to assign DZ.token and DZ.tokenExpire manually
					window.location.href = 'https://connect.deezer.com/oauth/auth.php?app_id='+web_app_id+'&redirect_uri='+top.location.protocol+'//'+document.domain+'&perms=basic_access,email,manage_library,offline_access';

					//Popup method
					/*
					DZ.login(function(response) {
						if (response.authResponse) {
							console.log(web_translation.get(2001)); //Fetching your information...
							DZ.api('/user/me', function(response) {
								console.log(response);
								console.log(web_translation.get(2002)+' ' + response.name + '!'); //Welcome back bruno!
								web_player.init();
							});
						} else {
							console.log(web_translation.get(2003)); //Login cancelled or unauthorized.
						}
					}, {perms: 'basic_access,email,manage_library,offline_access'});
					*/

				});
			} else {
				web_player.init(true);
			}
		}
	}, 200);

});

/**
 * Lanuch request with the database
 */
var web_action = {

	/**
	 * Load user's favorite playlist
	 * @return {void}
	 */
	load_favorite: function(){
		console.log('Refresh the favorite playlist');
		DZ.api('/user/me/tracks', function(response){
			console.log(response);
			if(typeof response.data != 'undefined'){
				var data = response.data;
			} else {
				data = fake.favorites; //Simulation
			}
			web_playlist.load(data);
		});
	},

	/**
	 * Search for songs
	 * @param {string} txt search
	 * @return {array}
	 */
	search: function(txt){
		DZ.api('/search?q='+txt, function(response){
			console.log(response);
			if(typeof response.data != 'undefined'){
				var data = response.data;
			} else {
				data = fake.non_favorites; //Simulation
			}
			web_playlist.load(data, true);
		});
	},

	add_song: function(song_id){
		fake.add(song_id); //Simulation
		DZ.api('/user/me/tracks', 'POST', song_id, function(response){
			console.log(response);
			//Refresh the list
			web_action.load_favorite();
		});
	},

	remove_song: function(song_id){
		fake.remove(song_id); //Simulation
		DZ.api('/user/me/tracks', 'DELETE', song_id, function(response){
			console.log(response);
			//Refresh the list
			web_action.load_favorite();
		});
	},

};


/**
 * Visual control of the player
 */
var web_player = {

	/**
	 * Track if the initialization has been done
	 */
	initialized: false,

	/**
	 * The id of the song displayed
	 */
	current_id: false,

	/**
	 * At true the player is playing music
	 */
	playing: false,

	/**
	 * This timer is to avoid a visual glitch when move the track ball
	 */
	event_switch_timer: null,

	/**
	 * Initialize mouse events
	 * @return {void}
	 */
	init: function(init_token){
		if(typeof init_token != 'boolean'){
			init_token = false;
		}
		//Make sure we initialized only once
		if(this.initialized){
			return false;
		}
		this.initialized = true;

		if(init_token){
			//Because we are using the "window.location.href" method (non-popup)
			DZ.token = web_deezer_authorized;
			DZ.tokenExpire = 0;
		}

		//Attach some event listeners
		DZ.Event.subscribe('player_position', function(position){
			web_trackball.position( 100 * parseInt(position[0]) / parseInt(position[1]) );
		});

		DZ.Event.subscribe('player_play', function(position){
			clearTimeout(web_player.event_switch_timer);
			web_player.event_switch_timer = setTimeout(function(){
				web_player.refresh(true);
			}, 50);
		});
		
		DZ.Event.subscribe('player_paused', function(position){
			clearTimeout(web_player.event_switch_timer);
			web_player.event_switch_timer = setTimeout(function(){
				web_player.refresh(false);
			}, 50);
		});

		DZ.Event.subscribe('player_loaded', function(position){
			web_player.refresh();
		});

		DZ.Event.subscribe('current_track', function(position){
			web_player.refresh();
		});

		document.getElementById('web_top').classList.add('divers_display_none');
		document.getElementById('web_page').classList.remove('divers_display_none');

		document.getElementById('web_page_player').style.backgroundImage = "url("+web_page_player_cd_control_cdbg.src+")";

		attachAction('click', 'web_page_player_cd_control_prev', function(){
			web_player.previous();
		});

		attachAction('click', 'web_page_player_cd_control_next', function(){
			web_player.next();
		});

		attachAction('click', 'web_page_language', function(){
			web_change_language();
		});

		attachAction('click', 'web_page_player_cd_control_img', function(){
			if(!web_player.current_id){
				//Start wth the first song
				DZ.player.playTracks(web_playlist.getSongs(), 0);
				web_player.refresh();
			} else {
				web_player.switch();
			}
		});

		setInterval(function(){
			web_player.refresh();
		}, 100);

		web_action.load_favorite();

	},

	/**
	 * Refresh the display information
	 * @param {boolean} play - At true we force to refresh the play/pause information
	 * @param {boolean} force - At true we force to refresh all information
	 * @return {void}
	 */
	refresh: function(play, force){
		if(typeof play == 'undefined'){
			play = null;
		}
		var song = DZ.player.getCurrentTrack();
		if(
			   song != null
			&& typeof song == 'object'
			&& (web_player.current_id != song.id || force)
		){
			web_player.current_id = song.id;

			var song_detail = web_playlist.getSong(song.id);
			if(!song_detail){
				return;
			}

			//Text information
			document.getElementById('web_page_player_song_top_title').innerHTML = parseHTML(song_detail.title);
			document.getElementById('web_page_player_song_by').innerHTML = parseHTML(song_detail.artist.name);
			document.getElementById('web_page_player_song_top_duration').innerHTML = convertDuration(song_detail.duration);
			
			if(song_detail.album && typeof song_detail.album.cover_medium == 'string'){
				document.getElementById('web_page_player').style.backgroundImage = "url("+song_detail.album.cover_medium+")";
			} else {
				document.getElementById('web_page_player').style.backgroundImage = "url("+web_page_player_cd_control_cdbg.src+")";
			}

			//Commands
			if(web_player.current_id){
				document.getElementById('web_page_player_cd_control_prev').classList.remove('blocked');
				document.getElementById('web_page_player_cd_control_next').classList.remove('blocked');
				var index = DZ.player.getCurrentIndex();
				if(!index){
					document.getElementById('web_page_player_cd_control_prev').classList.add('blocked');
				}
				if(index >= web_playlist.getSongs().length-1){
					document.getElementById('web_page_player_cd_control_next').classList.add('blocked');
				}
			} else {
				document.getElementById('web_page_player_cd_control_prev').classList.add('blocked');
				document.getElementById('web_page_player_cd_control_next').classList.add('blocked');
			}

			//Show the song currently played
			var playing = document.getElementsByClassName('web_playlist_line_playing');
			for(var i in playing){
				if(isNaN(parseInt(i, 10))){ continue; }
				playing[i].classList.remove('web_playlist_line_playing');
			}
			var elem = document.getElementById('web_playlist_line_'+song_detail.id);
			if(elem){
				document.getElementById('web_playlist_line_'+song_detail.id).classList.add('web_playlist_line_playing');
			}

			play = true;

			//Tracker
			web_trackball.init();
		}

		if(play===true){
			web_rotate.start('web_page_player');
			document.getElementById('web_page_player_cd_control_img').src = web_page_player_cd_control_pause.src;
			this.playing = true;
		} else if(play===false){ //It excludes default value null
			web_rotate.stop('web_page_player');
			document.getElementById('web_page_player_cd_control_img').src = web_page_player_cd_control_play.src;
			this.playing = false;
		}

	},

	/**
	 * Switch between play and pause
	 * @return {boolean}
	 */
	switch: function(){
		if(!this.current_id || this.playing){
			DZ.player.pause();
			this.refresh(false);
			return false;
		} else {
			DZ.player.play();
			this.refresh(true);
			return true;
		}
	},

	/**
	 * Play next song (if any)
	 * @return {void}
	 */
	next: function(){
		DZ.player.playTracks(web_playlist.getSongs(), DZ.player.getCurrentIndex()+1);
		web_player.refresh();
	},

	/**
	 * Play previous song (if any)
	 * @return {void}
	 */
	previous: function(){
		DZ.player.playTracks(web_playlist.getSongs(), DZ.player.getCurrentIndex()-1);
		web_player.refresh();
	},

};

/**
 * Playlist detail
 */
var web_playlist = {

	/**
 	* List of songs currently loaded
 	*/
	songs: null,

	/**
 	* Return the list of songs ID of the loaded list
 	* @return {array} - Array of songs
 	*/
	getSongs: function(){
		var list = [];
		if(web_playlist.songs != null && typeof web_playlist.songs == 'object'){
			for(var i in web_playlist.songs){
				list.push(web_playlist.songs[i].id);
			}
		}
		return list;
	},

	/**
 	* Return the list of songs ID of the loaded list
 	* @param {array} songs - List of songs to display
	* @return {integer} - Index of song seek
 	*/
	getIndex: function(song_id){
		var index = 0; //By default just return the first song
		if(web_playlist.songs != null && typeof web_playlist.songs == 'object'){
			for(var i in web_playlist.songs){
				if(song_id == web_playlist.songs[i].id){
					index = i;
					break;
				}
			}
		}
		return parseInt(index, 10);
	},

	/**
 	* Return the song object with it ID
 	* @return {object} - A song
 	*/
	getSong: function(song_id){
		var song = null;
		if(web_playlist.songs != null && typeof web_playlist.songs == 'object'){
			for(var i in web_playlist.songs){
				if(song_id == web_playlist.songs[i].id){
					return web_playlist.songs[i];
				}
			}
		}
		return null;
	},

	/**
 	* Draw the songs' list
 	* @param {array} - Songs'list received by Deezer API
	* @return {void}
 	*/
	load: function(songs, add_song){
		//The quickest way (but can be CPU hunger) is to completly remove the list and rebuild it.
		//In a proper way, we shoud update existing DOM element, delete those who does not exist in the new playlist, and insert at the correct position the new one
		//For demo only, I use the quick version

		if(typeof add_song != 'boolean'){
			add_song = false;
		}

		//We update the list of songs only when we request the real list
		if(!add_song){
			this.songs = songs;
		}

		var web_page_playlist = document.getElementById('web_page_playlist');
		web_page_playlist.classList.remove('web_page_playlist_hide');

		//Clean button
		var list = document.getElementsByClassName('web_playlist_line_button_cloned');
		//We need to clone the list because of its attachment to the DOM
		var list_clone = {};
		for(var i in list){
			if(isNaN(parseInt(i, 10))){ continue; }
			list_clone[i] = list[i];
		}
		//Detal all click event previously attached to avoid duplication when we redraw the list
		for(var i in list_clone){
			detachAllActions('click', list_clone[i].id);
			var parent = list_clone[i].parentElement;
			if(parent){
				parent.removeChild(document.getElementById(list_clone[i].id));
			}
		}

		if(add_song){
			//Clone back playlist
			var clone = document.getElementById('-web_playlist_line_back_playlist').cloneNode(true);
			clone.id = 'web_playlist_line_back_playlist';
			clone.classList.add('web_playlist_line_button_cloned');
			web_page_playlist.appendChild(clone);
			attachAction('click', clone.id, function(){
				document.getElementById('web_page_playlist').classList.add('web_page_playlist_hide');
				web_playlist.load(web_playlist.songs);
			});
		} else {
			//Clone add song
			var clone = document.getElementById('-web_playlist_line_add_song').cloneNode(true);
			clone.id = 'web_playlist_line_add_song';
			clone.classList.add('web_playlist_line_button_cloned');
			web_page_playlist.appendChild(clone);
			attachAction('click', clone.id, function(){
				document.getElementById('web_page_playlist').classList.add('web_page_playlist_hide');
				web_action.search("Daft Punk");
			});
		}

		//Clean song tabs
		var list = document.getElementsByClassName('web_playlist_line_cloned');
		//We need to clone the list because of its attachment to the DOM
		var list_clone = {};
		for(var i in list){
			if(isNaN(parseInt(i, 10))){ continue; }
			list_clone[i] = list[i];
		}
		//Detal all click event previously attached to avoid duplication when we redraw the list
		for(var i in list_clone){
			detachAllActions('click', list_clone[i].id);
			detachAllActions('click', list_clone[i].getElementsByClassName('web_playlist_line_remove')[0].id);
			var parent = list_clone[i].parentElement;
			if(parent){
				parent.removeChild(document.getElementById(list_clone[i].id));
			}
		}

		
		for(var i in songs){
			var clone = document.getElementById('-web_playlist_line').cloneNode(true);
			clone.id = 'web_playlist_line_'+songs[i].id;
			clone.classList.add('web_playlist_line_cloned');
			clone.getElementsByClassName('web_playlist_line_content_top_title')[0].innerHTML = parseHTML(songs[i].title);
			clone.getElementsByClassName('web_playlist_line_content_top_duration')[0].innerHTML = convertDuration(songs[i].duration);
			clone.getElementsByClassName('web_playlist_line_content_by')[0].innerHTML = parseHTML(songs[i].artist.name);
			clone.getElementsByClassName('web_playlist_line_picture')[0].style.backgroundImage = "url("+songs[i].album.cover_medium+")";
			web_page_playlist.appendChild(clone);
			clone.song_id = songs[i].id;
			if(add_song){
				var plus = clone.getElementsByClassName('web_playlist_line_plus')[0].classList.remove('divers_display_none');
				attachAction('click', clone.id, function(){
					web_action.add_song(this.song_id);
				});
				clone.getElementsByClassName('web_playlist_line_remove')[0].classList.remove('web_playlist_line_remove_force');
				clone.getElementsByClassName('web_playlist_line_remove')[0].classList.add('divers_display_none');
			} else {
				attachAction('click', clone.id, function(){
					DZ.player.playTracks(web_playlist.getSongs(), web_playlist.getIndex(this.song_id));
					web_player.refresh();
				});
				//Event for removing the song fro the list
				var remove_id = 'web_playlist_line_remove_'+songs[i].id;
				clone.getElementsByClassName('web_playlist_line_remove')[0].id = remove_id;
				clone.getElementsByClassName('web_playlist_line_remove')[0].song_id = songs[i].id;
				attachAction('click', remove_id, function(event){
					event.stopPropagation();
					if(confirm(web_translation.get(2005))){
						web_action.remove_song(this.song_id);
					}
				});
			}
		}

		web_player.refresh(null, true);
		web_playlist.resize();
	},

	/**
 	* Help to have the scrollbar for the playlist only
	* @return {void}
 	*/
	resize: function(){
		document.getElementById('web_page_playlist').style.height = (window.innerHeight - 14)+'px';
	}

}

/**
 * Control the track ball
 */
var web_trackball = {

	/**
	 * Track if the initialization has been done
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
	 * DOM element of the track click event
	 */
	elem_click: null,

	/**
	 * At true we are move the track ball manually
	 */
	mouse_move: false,

	/**
	 * Current percentage value
	 */
	percentage: 0,

	/**
	 * Initialize mouse events
	 * @return {void}
	 */
	init: function(){
		//Make sure we initialized only once
		if(this.initialized){
			return false;
		}
		this.initialized = true;

		this.elem_ball = document.getElementById('web_page_player_song_track_ball');
		this.elem_line = document.getElementById('web_page_player_song_track');
		this.elem_cover = document.getElementById('web_page_player_song_track_cover');
		this.elem_click = document.getElementById('web_page_player_song_track_click');

		this.elem_ball.classList.remove('web_page_player_song_track_default');
		this.elem_click.classList.remove('web_page_player_song_track_default');

		attachAction('click', this.elem_click, function(){
			web_trackball.move(true);
			DZ.player.seek(web_trackball.percentage);
			web_trackball.mouse_move = false;
		});

		attachAction('mousedown', this.elem_ball, function(event){
			web_trackball.mouse_move = true;
		});

		attachAction('mouseup', document, function(){
			if(web_trackball.mouse_move){
				DZ.player.seek(web_trackball.percentage);
			}
			web_trackball.mouse_move = false;
		});

		attachAction('mouseleave', document, function(){
			if(web_trackball.mouse_move){
				DZ.player.seek(web_trackball.percentage);
			}
			web_trackball.mouse_move = false;
		});

		attachAction('blur', window, function(){
			if(web_trackball.mouse_move){
				DZ.player.seek(web_trackball.percentage);
			}
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
	 * @param {boolean} force - Force repositioning the track ball
	 * @return {boolean|void}
	 */
	position: function(percentage, force){
		if(typeof force == 'undefined'){
			force = false;
		}
		if(web_trackball.mouse_move && !force){
			return false;
		}
		if(typeof percentage == 'number' && percentage >= 0 && percentage <= 100){
			this.init();
			this.percentage = percentage;
			this.elem_ball.style.left = percentage+"%";
			this.elem_cover.style.width = percentage+"%";
		}
	},

	/**
	 * Move the track ball according to the current mouse position
	 * @param {boolean} force - Force repositioning the track ball
	 * @return {void}
	 */
	move: function(force){
		if(typeof force == 'undefined'){
			force = false;
		}
		if(force || web_trackball.mouse_move){
			var min = this.elem_line.getBoundingClientRect().x;
			var max = min + this.elem_line.getBoundingClientRect().width;
			if(web_mouse_position.x <= min){
				this.position(0, true);
			} else if(web_mouse_position.x >= max){
				this.position(100, true);
			} else {
				var progress = web_mouse_position.x - min;
				var total = max - min;
				this.position(100*progress/total, true);
			}
		}
	},

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
 * Translation object
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
 * This help to redraw the scrolll if we resize the window (or rotate)
 */
attachAction('resize', window, function(){
	web_playlist.resize();
});




/**
 * Because of access issue, I am simulating songs and playlist
 */
var fake = {

	/**
	 * Add a song to the favorites
	 * @param {integer} song_id - Song ID
	 * @return {void}
	 */
	add: function(song_id){
		var song = false;
		var list = [];
		for(var i=0; i<this.non_favorites.length; i++){
			if(this.non_favorites[i].id == song_id){
				this.favorites.push(this.non_favorites[i]);
			} else {
				list.push(this.non_favorites[i]);
			}
		}
		this.non_favorites = list;
	},

	/**
	 * Remove a song from the favorites
	 * @param {integer} song_id - Song ID
	 * @return {void}
	 */
	remove: function(song_id){
		var song = false;
		var list = [];
		for(var i=0; i<this.favorites.length; i++){
			if(this.favorites[i].id == song_id){
				this.non_favorites.push(this.favorites[i]);
			} else {
				list.push(this.favorites[i]);
			}
		}
		this.favorites = list;
	},

	/**
	 * A fake favorite list
	 */
	favorites: [
		{
			"id": "3135553",
			"readable": true,
			"title": "One More Time",
			"duration": "320",
			"rank": "848415",
			"explicit_lyrics": false,
			"artist": {
				"id": "27",
				"name": "Daft Punk",
			},
			"album": {
				"id": "302127",
				"title": "Discovery",
				"cover": "https://api.deezer.com/album/302127/image",
				"cover_small": "https://e-cdns-images.dzcdn.net/images/cover/2e018122cb56986277102d2041a592c8/56x56-000000-80-0-0.jpg",
				"cover_medium": "https://e-cdns-images.dzcdn.net/images/cover/2e018122cb56986277102d2041a592c8/250x250-000000-80-0-0.jpg",
				"cover_big": "https://e-cdns-images.dzcdn.net/images/cover/2e018122cb56986277102d2041a592c8/500x500-000000-80-0-0.jpg",
				"cover_xl": "https://e-cdns-images.dzcdn.net/images/cover/2e018122cb56986277102d2041a592c8/1000x1000-000000-80-0-0.jpg",
			},
		},
		{
			"id": "3135554",
			"readable": true,
			"title": "Aerodynamic",
			"duration": "212",
			"rank": "735079",
			"explicit_lyrics": false,
			"artist": {
				"id": "27",
				"name": "Daft Punk",
			},
			"album": {
				"id": "302127",
				"title": "Discovery",
				"cover": "https://api.deezer.com/album/302127/image",
				"cover_small": "https://e-cdns-images.dzcdn.net/images/cover/2e018122cb56986277102d2041a592c8/56x56-000000-80-0-0.jpg",
				"cover_medium": "https://e-cdns-images.dzcdn.net/images/cover/2e018122cb56986277102d2041a592c8/250x250-000000-80-0-0.jpg",
				"cover_big": "https://e-cdns-images.dzcdn.net/images/cover/2e018122cb56986277102d2041a592c8/500x500-000000-80-0-0.jpg",
				"cover_xl": "https://e-cdns-images.dzcdn.net/images/cover/2e018122cb56986277102d2041a592c8/1000x1000-000000-80-0-0.jpg",
			},
		},
		{
			"id": "3135555",
			"readable": true,
			"title": "Digital Love",
			"duration": "301",
			"rank": "662558",
			"explicit_lyrics": false,
			"artist": {
				"id": "27",
				"name": "Daft Punk",
			},
			"album": {
				"id": "302127",
				"title": "Discovery",
				"cover": "https://api.deezer.com/album/302127/image",
				"cover_small": "https://e-cdns-images.dzcdn.net/images/cover/2e018122cb56986277102d2041a592c8/56x56-000000-80-0-0.jpg",
				"cover_medium": "https://e-cdns-images.dzcdn.net/images/cover/2e018122cb56986277102d2041a592c8/250x250-000000-80-0-0.jpg",
				"cover_big": "https://e-cdns-images.dzcdn.net/images/cover/2e018122cb56986277102d2041a592c8/500x500-000000-80-0-0.jpg",
				"cover_xl": "https://e-cdns-images.dzcdn.net/images/cover/2e018122cb56986277102d2041a592c8/1000x1000-000000-80-0-0.jpg",
			},
		},
		{
			"id": "3135556",
			"readable": true,
			"title": "Harder Better Faster Stronger",
			"duration": "224",
			"rank": "727696",
			"explicit_lyrics": false,
			"artist": {
				"id": "27",
				"name": "Daft Punk",
			},
			"album": {
				"id": "302127",
				"title": "Discovery",
				"cover": "https://api.deezer.com/album/302127/image",
				"cover_small": "https://e-cdns-images.dzcdn.net/images/cover/2e018122cb56986277102d2041a592c8/56x56-000000-80-0-0.jpg",
				"cover_medium": "https://e-cdns-images.dzcdn.net/images/cover/2e018122cb56986277102d2041a592c8/250x250-000000-80-0-0.jpg",
				"cover_big": "https://e-cdns-images.dzcdn.net/images/cover/2e018122cb56986277102d2041a592c8/500x500-000000-80-0-0.jpg",
				"cover_xl": "https://e-cdns-images.dzcdn.net/images/cover/2e018122cb56986277102d2041a592c8/1000x1000-000000-80-0-0.jpg",
			},
		},
		{
			"id": "3135557",
			"readable": true,
			"title": "Crescendolls",
			"duration": "211",
			"rank": "523807",
			"explicit_lyrics": false,
			"artist": {
				"id": "27",
				"name": "Daft Punk",
			},
			"album": {
				"id": "302127",
				"title": "Discovery",
				"cover": "https://api.deezer.com/album/302127/image",
				"cover_small": "https://e-cdns-images.dzcdn.net/images/cover/2e018122cb56986277102d2041a592c8/56x56-000000-80-0-0.jpg",
				"cover_medium": "https://e-cdns-images.dzcdn.net/images/cover/2e018122cb56986277102d2041a592c8/250x250-000000-80-0-0.jpg",
				"cover_big": "https://e-cdns-images.dzcdn.net/images/cover/2e018122cb56986277102d2041a592c8/500x500-000000-80-0-0.jpg",
				"cover_xl": "https://e-cdns-images.dzcdn.net/images/cover/2e018122cb56986277102d2041a592c8/1000x1000-000000-80-0-0.jpg",
			},
		},
		{
			"id": "3135558",
			"readable": true,
			"title": "Nightvision",
			"duration": "104",
			"rank": "499112",
			"explicit_lyrics": false,
			"artist": {
				"id": "27",
				"name": "Daft Punk",
			},
			"album": {
				"id": "302127",
				"title": "Discovery",
				"cover": "https://api.deezer.com/album/302127/image",
				"cover_small": "https://e-cdns-images.dzcdn.net/images/cover/2e018122cb56986277102d2041a592c8/56x56-000000-80-0-0.jpg",
				"cover_medium": "https://e-cdns-images.dzcdn.net/images/cover/2e018122cb56986277102d2041a592c8/250x250-000000-80-0-0.jpg",
				"cover_big": "https://e-cdns-images.dzcdn.net/images/cover/2e018122cb56986277102d2041a592c8/500x500-000000-80-0-0.jpg",
				"cover_xl": "https://e-cdns-images.dzcdn.net/images/cover/2e018122cb56986277102d2041a592c8/1000x1000-000000-80-0-0.jpg",
			},
		},
		{
			"id": "3135559",
			"readable": true,
			"title": "Superheroes",
			"duration": "237",
			"rank": "574634",
			"explicit_lyrics": false,
			"artist": {
				"id": "27",
				"name": "Daft Punk",
			},
			"album": {
				"id": "302127",
				"title": "Discovery",
				"cover": "https://api.deezer.com/album/302127/image",
				"cover_small": "https://e-cdns-images.dzcdn.net/images/cover/2e018122cb56986277102d2041a592c8/56x56-000000-80-0-0.jpg",
				"cover_medium": "https://e-cdns-images.dzcdn.net/images/cover/2e018122cb56986277102d2041a592c8/250x250-000000-80-0-0.jpg",
				"cover_big": "https://e-cdns-images.dzcdn.net/images/cover/2e018122cb56986277102d2041a592c8/500x500-000000-80-0-0.jpg",
				"cover_xl": "https://e-cdns-images.dzcdn.net/images/cover/2e018122cb56986277102d2041a592c8/1000x1000-000000-80-0-0.jpg",
			},
		},
		{
			"id": "3135560",
			"readable": true,
			"title": "High Life",
			"duration": "201",
			"rank": "508307",
			"explicit_lyrics": false,
			"artist": {
				"id": "27",
				"name": "Daft Punk",
			},
			"album": {
				"id": "302127",
				"title": "Discovery",
				"cover": "https://api.deezer.com/album/302127/image",
				"cover_small": "https://e-cdns-images.dzcdn.net/images/cover/2e018122cb56986277102d2041a592c8/56x56-000000-80-0-0.jpg",
				"cover_medium": "https://e-cdns-images.dzcdn.net/images/cover/2e018122cb56986277102d2041a592c8/250x250-000000-80-0-0.jpg",
				"cover_big": "https://e-cdns-images.dzcdn.net/images/cover/2e018122cb56986277102d2041a592c8/500x500-000000-80-0-0.jpg",
				"cover_xl": "https://e-cdns-images.dzcdn.net/images/cover/2e018122cb56986277102d2041a592c8/1000x1000-000000-80-0-0.jpg",
			},
		},
		{
			"id": "3135561",
			"readable": true,
			"title": "Something About Us",
			"duration": "232",
			"rank": "683083",
			"explicit_lyrics": false,
			"artist": {
				"id": "27",
				"name": "Daft Punk",
			},
			"album": {
				"id": "302127",
				"title": "Discovery",
				"cover": "https://api.deezer.com/album/302127/image",
				"cover_small": "https://e-cdns-images.dzcdn.net/images/cover/2e018122cb56986277102d2041a592c8/56x56-000000-80-0-0.jpg",
				"cover_medium": "https://e-cdns-images.dzcdn.net/images/cover/2e018122cb56986277102d2041a592c8/250x250-000000-80-0-0.jpg",
				"cover_big": "https://e-cdns-images.dzcdn.net/images/cover/2e018122cb56986277102d2041a592c8/500x500-000000-80-0-0.jpg",
				"cover_xl": "https://e-cdns-images.dzcdn.net/images/cover/2e018122cb56986277102d2041a592c8/1000x1000-000000-80-0-0.jpg",
			},
		},
		{
			"id": "3135562",
			"readable": true,
			"title": "Voyager",
			"duration": "227",
			"rank": "581113",
			"explicit_lyrics": false,
			"artist": {
				"id": "27",
				"name": "Daft Punk",
			},
			"album": {
				"id": "302127",
				"title": "Discovery",
				"cover": "https://api.deezer.com/album/302127/image",
				"cover_small": "https://e-cdns-images.dzcdn.net/images/cover/2e018122cb56986277102d2041a592c8/56x56-000000-80-0-0.jpg",
				"cover_medium": "https://e-cdns-images.dzcdn.net/images/cover/2e018122cb56986277102d2041a592c8/250x250-000000-80-0-0.jpg",
				"cover_big": "https://e-cdns-images.dzcdn.net/images/cover/2e018122cb56986277102d2041a592c8/500x500-000000-80-0-0.jpg",
				"cover_xl": "https://e-cdns-images.dzcdn.net/images/cover/2e018122cb56986277102d2041a592c8/1000x1000-000000-80-0-0.jpg",
			},
		},
		{
			"id": "3135563",
			"readable": true,
			"title": "Veridis Quo",
			"duration": "345",
			"rank": "707640",
			"explicit_lyrics": false,
			"artist": {
				"id": "27",
				"name": "Daft Punk",
			},
			"album": {
				"id": "302127",
				"title": "Discovery",
				"cover": "https://api.deezer.com/album/302127/image",
				"cover_small": "https://e-cdns-images.dzcdn.net/images/cover/2e018122cb56986277102d2041a592c8/56x56-000000-80-0-0.jpg",
				"cover_medium": "https://e-cdns-images.dzcdn.net/images/cover/2e018122cb56986277102d2041a592c8/250x250-000000-80-0-0.jpg",
				"cover_big": "https://e-cdns-images.dzcdn.net/images/cover/2e018122cb56986277102d2041a592c8/500x500-000000-80-0-0.jpg",
				"cover_xl": "https://e-cdns-images.dzcdn.net/images/cover/2e018122cb56986277102d2041a592c8/1000x1000-000000-80-0-0.jpg",
			},
		},
	],

	non_favorites: [
		{
			"id": "3135564",
			"readable": true,
			"title": "Short Circuit",
			"link": "https://www.deezer.com/track/3135564",
			"duration": "206",
			"rank": "492339",
			"explicit_lyrics": false,
			"artist": {
				"id": "27",
				"name": "Daft Punk",
			},
			"album": {
				"id": "302127",
				"title": "Discovery",
				"cover": "https://api.deezer.com/album/302127/image",
				"cover_small": "https://e-cdns-images.dzcdn.net/images/cover/2e018122cb56986277102d2041a592c8/56x56-000000-80-0-0.jpg",
				"cover_medium": "https://e-cdns-images.dzcdn.net/images/cover/2e018122cb56986277102d2041a592c8/250x250-000000-80-0-0.jpg",
				"cover_big": "https://e-cdns-images.dzcdn.net/images/cover/2e018122cb56986277102d2041a592c8/500x500-000000-80-0-0.jpg",
				"cover_xl": "https://e-cdns-images.dzcdn.net/images/cover/2e018122cb56986277102d2041a592c8/1000x1000-000000-80-0-0.jpg",
			},
		},
		{
			"id": "3135565",
			"readable": true,
			"title": "Face To Face",
			"link": "https://www.deezer.com/track/3135565",
			"duration": "240",
			"rank": "621838",
			"explicit_lyrics": false,
			"artist": {
				"id": "27",
				"name": "Daft Punk",
			},
			"album": {
				"id": "302127",
				"title": "Discovery",
				"cover": "https://api.deezer.com/album/302127/image",
				"cover_small": "https://e-cdns-images.dzcdn.net/images/cover/2e018122cb56986277102d2041a592c8/56x56-000000-80-0-0.jpg",
				"cover_medium": "https://e-cdns-images.dzcdn.net/images/cover/2e018122cb56986277102d2041a592c8/250x250-000000-80-0-0.jpg",
				"cover_big": "https://e-cdns-images.dzcdn.net/images/cover/2e018122cb56986277102d2041a592c8/500x500-000000-80-0-0.jpg",
				"cover_xl": "https://e-cdns-images.dzcdn.net/images/cover/2e018122cb56986277102d2041a592c8/1000x1000-000000-80-0-0.jpg",
			},
		},
		{
			"id": "3135566",
			"readable": true,
			"title": "Too Long",
			"link": "https://www.deezer.com/track/3135566",
			"duration": "600",
			"rank": "530018",
			"explicit_lyrics": false,
			"artist": {
				"id": "27",
				"name": "Daft Punk",
			},
			"album": {
				"id": "302127",
				"title": "Discovery",
				"cover": "https://api.deezer.com/album/302127/image",
				"cover_small": "https://e-cdns-images.dzcdn.net/images/cover/2e018122cb56986277102d2041a592c8/56x56-000000-80-0-0.jpg",
				"cover_medium": "https://e-cdns-images.dzcdn.net/images/cover/2e018122cb56986277102d2041a592c8/250x250-000000-80-0-0.jpg",
				"cover_big": "https://e-cdns-images.dzcdn.net/images/cover/2e018122cb56986277102d2041a592c8/500x500-000000-80-0-0.jpg",
				"cover_xl": "https://e-cdns-images.dzcdn.net/images/cover/2e018122cb56986277102d2041a592c8/1000x1000-000000-80-0-0.jpg",
			},
		},
	],

};
