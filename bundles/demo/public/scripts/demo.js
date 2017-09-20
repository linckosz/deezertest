/**
 * @author Bruno Martin <brunoocto@gmail.com>
 */

/**
 * Clear the page from any output
 * @param {boolean} show - At true it show the 'clear' button, at false, it clear the page
 * @return {void}
 */
var demo_clear = function(show){
	if(typeof show != 'boolean'){
		show = false;
	}
	var elem = document.getElementById('demo_clear');
	if(elem){
		if(show){
			elem.classList.remove('demo_display_none');
		} else {
			elem.classList.add('demo_display_none');
			var list = document.getElementsByClassName('demo_clear_content');
			for(var i in list){
				if(isNaN(parseInt(i, 10))){ continue; }
				list[i].innerHTML = '';
			}
			var list = document.getElementsByClassName('demo_loading');
			for(var i in list){
				if(isNaN(parseInt(i, 10))){ continue; }
				list[i].add('demo_response_hidden');
			}
		}
	}
}

/**
 * Clear the page from any output
 * @param {string} exercise - List string of the current excercise (like "1a", "2b", etc.)
 * @return {void}
 */
var demo_loading = function(exercise){
	var elem;
	elem = document.getElementById('demo_response_'+exercise+'_date');
	if(elem){
		elem.classList.add('demo_response_hidden');
	}
	elem = document.getElementById('demo_response_'+exercise+'_content');
	if(elem){
		elem.classList.add('demo_response_hidden');
	}
	elem = document.getElementById('demo_response_'+exercise+'_loading');
	if(elem){
		elem.classList.remove('demo_response_hidden');
	}
}

/**
 * Clear the page from any output
 * @param {string} exercise - List string of the current excercise (like "1a", "2b", etc.)
 * @param {string} content - Information to display
 * @return {void}
 */
var demo_display = function(exercise, content){
	//The setTimeout is use to make sure the user feel the data change
	setTimeout(function(exercise, content){
		var elem;
		elem = document.getElementById('demo_response_'+exercise+'_date');
		if(elem){
			elem.classList.remove('demo_response_hidden');
			elem.innerHTML = new Date();
		}
		elem = document.getElementById('demo_response_'+exercise+'_content');
		if(elem){
			elem.classList.remove('demo_response_hidden');
			elem.innerHTML = content;
		}
		elem = document.getElementById('demo_response_'+exercise+'_loading');
		if(elem){
			elem.classList.add('demo_response_hidden');
		}
	}, 300, exercise, content);
}

/**
 * Load some actions after the DOM is loaded
 */
attachAction('load', window, function(){

	/**
	 * Click event for the button 'demo_clear'
	 */
	attachAction('click', 'demo_clear', function(){
		demo_clear();
	});

	/**
	 * Click event for the button 'demo_action_1a'
	 * Get the Information of the user ID:1
	 */
	attachAction('click', 'demo_action_1a', function(){
		var user_id = 1;
		var user_md5 = '8f30ddb8d80ccd2b';
		var data = {};
		data.read = {};
		data.read.user = {};
		data.read.user[user_id] = {
			id: user_id,
			md5: user_md5, //Act like a password, this makes sure that the client has read access, can be short (8 first characters will be accepted for read operation only)
		};
		demo_loading('1a');
		commmunication_ajax.send('/data', 'post', data, function(response){
			var content = '';
			if(
				   typeof response == 'object' && response
				&& typeof response.data == 'object' && response.data
				&& typeof response.data.read == 'object' && response.data.read
				&& typeof response.data.read.user == 'object' && response.data.read.user
			){
				for(var i in response.data.read.user){
					content += '<br />';
					content += 'Model => user';
					for(var j in response.data.read.user[i]){
						if(j=='id' || j=='md5' || j=='name' || j=='email'){
							content += '<br />';
							content += '&nbsp;&nbsp;&nbsp;&nbsp;'+j+': '+parseHTML(response.data.read.user[i][j]);
						}
					}
					content += '<br />';
				}
			}
			demo_display('1a', content);
			demo_clear(true);
		});
	});

	/**
	 * Click event for the button 'demo_action_1b'
	 * Get the Information of the song ID:1
	 */
	attachAction('click', 'demo_action_1b', function(){
		var song_id = 1;
		var song_md5 = '89bcee85e5d53ee79d70ebd026a7c188';
		var data = {};
		data.read = {};
		data.read.song = {};
		data.read.song[song_id] = {
			id: song_id,
			md5: song_md5,
		};
		demo_loading('1b');
		commmunication_ajax.send('/data', 'post', data, function(response){
			var content = '';
			if(
				   typeof response == 'object' && response
				&& typeof response.data == 'object' && response.data
				&& typeof response.data.read == 'object' && response.data.read
				&& typeof response.data.read.song == 'object' && response.data.read.song
			){
				for(var i in response.data.read.song){
					content += '<br />';
					content += 'Model => song';
					for(var j in response.data.read.song[i]){
						if(j=='id' || j=='md5' || j=='name'){
							content += '<br />';
							content += '&nbsp;&nbsp;&nbsp;&nbsp;'+j+': '+parseHTML(response.data.read.song[i][j]);
						} else if(j=='duration'){
							content += '<br />';
							content += '&nbsp;&nbsp;&nbsp;&nbsp;'+j+' [MM:SS] : '+convertDuration(response.data.read.song[i][j]);
						}

					}
					content += '<br />';
				}
			}
			demo_display('1b', content);
			demo_clear(true);
		});
	});

	/**
	 * Click event for the button 'demo_action_2a'
	 * Get all the songs' information from the favorite playlist of the user ID:1
	 */
	attachAction('click', 'demo_action_2a', function(){
		var user_id = 1;
		var user_md5 = '8f30ddb8d80ccd2b';
		var data = {}
		data.read = {};
		data.read.user = {};
		data.read.user[user_id] = {
			id: user_id,
			md5: user_md5,
		};
		demo_loading('2a');
		commmunication_ajax.send('/playlist/favoritesongs', 'post', data, function(response){
			var content = '';
			//Playlist
			if(
				   typeof response == 'object' && response
				&& typeof response.data == 'object' && response.data
				&& typeof response.data.read == 'object' && response.data.read
				&& typeof response.data.read.playlist == 'object' && response.data.read.playlist
			){
				for(var i in response.data.read.playlist){
					break; //Note: It's not requested to display the playlist infomation
					content += '<br />';
					content += 'Model => Favorite playlist';
					for(var j in response.data.read.playlist[i]){
						if(j=='id' || j=='md5' || j=='user_id' || j=='name' || j=='favorite'){
							content += '<br />';
							content += '&nbsp;&nbsp;&nbsp;&nbsp;'+j+': '+parseHTML(response.data.read.playlist[i][j]);
						}
					}
					content += '<br />';
				}
			}
			//Songs
			if(
				   typeof response == 'object' && response
				&& typeof response.data == 'object' && response.data
				&& typeof response.data.read == 'object' && response.data.read
				&& typeof response.data.read.song == 'object' && response.data.read.song
			){
				for(var i in response.data.read.song){
					content += '<br />';
					content += 'Model => song';
					for(var j in response.data.read.song[i]){
						if(j=='id' || j=='md5' || j=='name'){
							content += '<br />';
							content += '&nbsp;&nbsp;&nbsp;&nbsp;'+j+': '+parseHTML(response.data.read.song[i][j]);
						} else if(j=='duration'){
							content += '<br />';
							content += '&nbsp;&nbsp;&nbsp;&nbsp;'+j+' [MM:SS] : '+convertDuration(response.data.read.song[i][j]);
						}

					}
					content += '<br />';
				}
			}
			demo_display('2a', content);
			demo_clear(true);
		});
	});

	/**
	 * Click event for the button 'demo_action_2b'
	 * Add the song ID:5 to the playlist ID:1 (which is actually the favorite playlist of the user ID:1)
	 */
	attachAction('click', 'demo_action_2b', function(){
		var playlist_id = 1;
		var playlist_md5 = '54d40443deff03162a6ebb057c8380c8';
		var song_id = 5;
		var song_md5 = 'e70ec532c5a4da739965216bfb733730';
		var data = {}
		data.set = {};
		data.set.playlist = {};
		data.set.playlist[playlist_id] = {
			id: playlist_id,
			md5: playlist_md5,
			//This format pattern enable multiple attachment at a time
			_attach: [
				['song', song_id, song_md5]
			],
		};
		demo_loading('2b');
		//We first use the general method to add/remove a song 
		commmunication_ajax.send('/data', 'post', data, function(response){
			//Then we grab the whole list
			var playlist_id = 1;
			var playlist_md5 = '54d40443deff03162a6ebb057c8380c8';
			var data = {}
			data.read = {};
			data.read.playlist = {};
			data.read.playlist[playlist_id] = {
				id: playlist_id,
				md5: playlist_md5,
			};
			commmunication_ajax.send('/playlist/songs', 'post', data, function(response){
				var content = '';
				//Playlist
				if(
					   typeof response == 'object' && response
					&& typeof response.data == 'object' && response.data
					&& typeof response.data.read == 'object' && response.data.read
					&& typeof response.data.read.playlist == 'object' && response.data.read.playlist
				){
					for(var i in response.data.read.playlist){
						break; //Note: It's not requested to display the playlist infomation
						content += '<br />';
						content += 'Model => Favorite playlist';
						for(var j in response.data.read.playlist[i]){
							if(j=='id' || j=='md5' || j=='user_id' || j=='name' || j=='favorite'){
								content += '<br />';
								content += '&nbsp;&nbsp;&nbsp;&nbsp;'+j+': '+parseHTML(response.data.read.playlist[i][j]);
							}
						}
						content += '<br />';
					}
				}
				//Songs
				if(
					   typeof response == 'object' && response
					&& typeof response.data == 'object' && response.data
					&& typeof response.data.read == 'object' && response.data.read
					&& typeof response.data.read.song == 'object' && response.data.read.song
				){
					for(var i in response.data.read.song){
						content += '<br />';
						content += 'Model => song';
						for(var j in response.data.read.song[i]){
							if(j=='id' || j=='md5' || j=='name'){
								content += '<br />';
								content += '&nbsp;&nbsp;&nbsp;&nbsp;'+j+': '+parseHTML(response.data.read.song[i][j]);
							} else if(j=='duration'){
								content += '<br />';
								content += '&nbsp;&nbsp;&nbsp;&nbsp;'+j+' [MM:SS] : '+convertDuration(response.data.read.song[i][j]);
							}

						}
						content += '<br />';
					}
				}
				demo_display('2b', content);
				demo_clear(true);
			});
		});
	});

	/**
	 * Click event for the button 'demo_action_2c'
	 * Remove the song ID:5 to the playlist ID:1 (which is actually the favorite playlist of the user ID:1)
	 */
	attachAction('click', 'demo_action_2c', function(){
		var playlist_id = 1;
		var playlist_md5 = '54d40443deff03162a6ebb057c8380c8';
		var song_id = 5;
		var song_md5 = 'e70ec532c5a4da739965216bfb733730';
		var data = {}
		data.set = {};
		data.set.playlist = {};
		data.set.playlist[playlist_id] = {
			id: playlist_id,
			md5: playlist_md5,
			//This format pattern enable multiple attachment at a time
			_detach: [
				['song', song_id, song_md5]
			],
		};
		demo_loading('2c');
		//We first use the general method to add/remove a song 
		commmunication_ajax.send('/data', 'post', data, function(response){
			//Then we grab the whole list
			var playlist_id = 1;
			var playlist_md5 = '54d40443deff03162a6ebb057c8380c8';
			var data = {}
			data.read = {};
			data.read.playlist = {};
			data.read.playlist[playlist_id] = {
				id: playlist_id,
				md5: playlist_md5,
			};
			commmunication_ajax.send('/playlist/songs', 'post', data, function(response){
				var content = '';
				//Playlist
				if(
					   typeof response == 'object' && response
					&& typeof response.data == 'object' && response.data
					&& typeof response.data.read == 'object' && response.data.read
					&& typeof response.data.read.playlist == 'object' && response.data.read.playlist
				){
					for(var i in response.data.read.playlist){
						break; //Note: It's not requested to display the playlist infomation
						content += '<br />';
						content += 'Model => Favorite playlist';
						for(var j in response.data.read.playlist[i]){
							if(j=='id' || j=='md5' || j=='user_id' || j=='name' || j=='favorite'){
								content += '<br />';
								content += '&nbsp;&nbsp;&nbsp;&nbsp;'+j+': '+parseHTML(response.data.read.playlist[i][j]);
							}
						}
						content += '<br />';
					}
				}
				//Songs
				if(
					   typeof response == 'object' && response
					&& typeof response.data == 'object' && response.data
					&& typeof response.data.read == 'object' && response.data.read
					&& typeof response.data.read.song == 'object' && response.data.read.song
				){
					for(var i in response.data.read.song){
						content += '<br />';
						content += 'Model => song';
						for(var j in response.data.read.song[i]){
							if(j=='id' || j=='md5' || j=='name'){
								content += '<br />';
								content += '&nbsp;&nbsp;&nbsp;&nbsp;'+j+': '+parseHTML(response.data.read.song[i][j]);
							} else if(j=='duration'){
								content += '<br />';
								content += '&nbsp;&nbsp;&nbsp;&nbsp;'+j+' [MM:SS] : '+convertDuration(response.data.read.song[i][j]);
							}

						}
						content += '<br />';
					}
				}
				demo_display('2c', content);
				demo_clear(true);
			});
		});
	});

});
