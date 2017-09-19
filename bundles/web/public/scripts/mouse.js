/**
 * Keep a record of mouse position
 */
var web_mouse_position = {

	/**
	 * Horizontal position
	 */
	x: 0,

	/**
	 * Vertical position
	 */
	y: 0,

	/**
	 * Horizontal motion
	 */
	dirX: 1, //-1:left 1:right

	/**
	 * Vertical motion
	 */
	dirY: 1, //-1:up 1:down

	/**
	 * Set the mouse position
	 * @return {void}
	 */
	set: function(event){
		if(typeof event != 'object'){
			return false;
		}
		var oldX = this.x;
		var oldY = this.y;
		if(typeof event.pageX == 'number' && typeof event.pageY == 'number'){
			this.x = event.pageX;
			this.y = event.pageY;
		} else if(typeof event.originalEvent == 'object' && typeof event.originalEvent.touches == 'object' && typeof event.originalEvent.touches[0] == 'object' && typeof event.originalEvent.touches[0].pageX == 'number' && typeof event.originalEvent.touches[0].pageY == 'number'){
			this.x = event.originalEvent.touches[0].pageX;
			this.y = event.originalEvent.touches[0].pageY;
		} else if(typeof event.originalEvent.touches == 'object' && typeof event.touches[0] == 'object' && typeof event.touches[0].pageX == 'number' && typeof event.touches[0].pageY == 'number'){
			this.x = event.touches[0].pageX;
			this.y = event.touches[0].pageY;
		}
		if(this.x < oldX){
			this.dirX = -1;
		} else if(this.x > oldX){
			this.dirX = 1;
		} else {
			//Do not record 0 because of crenelage effect
		}
		if(this.y < oldY){
			this.dirY = -1;
		} else if(this.y > oldY){
			this.dirY = 1;
		} else {
			//Do not record 0 because of crenelage effect
		}
	},
};
