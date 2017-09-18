/**
 * @author Bruno Martin <brunoocto@gmail.com>
 */

 var web_app_timer;

/**
 * Load some actions after the DOM is loaded
 */
attachAction('load', window, function(){

	//Initialize the SDK
	DZ.init({
		appId: web_app_id, //My API_ID is 252622. For development purpose, I stored it into NGINX configuration file 'nginx_fronf.conf'.
		channelUrl: top.location.protocol+'//'+document.domain+'/channel.html',
		player: {
			onload : function(){}
		}
	});

	//I am using a setInterval to track when the Application is loaded, I did not find yet which one is the ready callback
	web_app_timer = setInterval(function(){
		if(DZ.initialized){
			clearInterval(web_app_timer);
			web_app_login();
		}
	}, 200);

	
	var elem = document.getElementById('web_page_player_cd_control_img');
	if(elem){
		elem.src = web_page_player_cd_control_play.src;
	}


	//toto => line for test only, to be deleted
	web_app_start_player();
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
		}, {perms: 'basic_access,email'});
	});

}

/**
 * Display the player and prepare some events
 * @return {void}
 */
var web_app_start_player = function(){

	var elem = document.getElementById('web_top');
	if(elem){
		elem.classList.add('web_display_none');
	}

	var elem = document.getElementById('web_page');
	if(elem){
		elem.classList.remove('web_display_none');
	}

	/**
	 * Click event for the button 'web_app_login_button'
	 */
	attachAction('click', 'aaa', function(){
		
	});

	//toto
	var elem = document.getElementById('web_page_player');
	if(elem){
		elem.style.backgroundImage = "url('/deezer/web/images/cd/bruno.jpg')";
		web_rotate.start('web_page_player');
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
			this.timer[elem_id] = setInterval(function(elem_id, speed){
				var elem = document.getElementById(elem_id);
				if(elem){
					var deg = 10*speed;
					if(typeof web_rotate.deg[elem_id] == 'number'){
						deg = web_rotate.deg[elem_id] + 10*speed;
					}
					web_rotate.deg[elem_id] = deg;
					elem.style.transform = "rotate("+deg+"deg)";
				} else {
					web_rotate.stop(elem_id);
				}
			}, 1000, elem_id, speed);
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

var toto = function(){

	DZ.api('/user/me/playlists', function(response){
		console.log(response);
	});

}
