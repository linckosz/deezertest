/**
 * @author Bruno Martin <brunoocto@gmail.com>
 */

/**
 * If the variable is an array/object, it will recusively force to convert it into an object
 * it can avoid array bug [0, undefined, undefined, 3, 4] that can generated tons of unecessary calculations
 * @param {*} arr - Any variable that can be converted into an object
 * @return {string}
 */
var ArrayToObject = function(arr){
	var result = false;
	if(typeof arr == 'object'){
		result = {};
		for(var i in arr){
			result[i] = ArrayToObject(arr[i]);
		}
	} else {
		result = arr;
	}
	return result;
};

/**
 * Help to know if the device has touch capabiliy
 */
var supportsTouch = 'ontouchstart' in window || navigator.msMaxTouchPoints;

/**
 * Keep track of events attached
 */
var attachedEvent = {};

/**
 * Polyfill for event listener
 * @param {string} type - The event name (like 'click')
 * @param {string|object} id - The ID of a DOM element, or the DOM elemnet itself
 * @param {function} fn - The function to launch when the event is fired
 * @return {number} - Total of event attached to the element
 */
var attachAction = function(type, id, fn){
	var index = 0;
	var elem = false;
	if(typeof id == 'string'){
		var elem = document.getElementById(id);
	} else if(typeof id == 'object'){
		var elem = id;
	}
	if(elem && typeof fn == 'function'){
		if(typeof attachedEvent[id] != 'object'){
			attachedEvent[id] = {};
		}
		if(typeof attachedEvent[id][type] != 'object'){
			attachedEvent[id][type] = [];
		}
		attachedEvent[id][type].push(fn);
		index = attachedEvent[id][type].length-1;
		if(typeof window.addEventListener == 'function'){
			elem.addEventListener(type, attachedEvent[id][type][index], false);
		} else if(typeof window.attachEvent){
			elem.attachEvent('on'+type, attachedEvent[id][type][index]);
		}
	}
	return index;
};

/**
 * Polyfill for event remover
 * @param {string} type - The event name (like 'click')
 * @param {string|object} id - The ID of a DOM element, or the DOM elemnet itself
 * @return {void}
 */
var detachAllActions = function(type, id){
	var elem = false;
	if(typeof id == 'string'){
		var elem = document.getElementById(id);
	} else if(typeof id == 'object'){
		var elem = id;
	}
	if(elem && typeof attachedEvent[id] == 'object' && typeof attachedEvent[id][type] == 'object'){
		for(var index in attachedEvent[id][type]){
			if(typeof window.removeEventListener == 'function'){
				elem.removeEventListener(type, attachedEvent[id][type][index]);
			} else if(typeof window.detachEvent){
				elem.detachEvent('on'+type, attachedEvent[id][type][index]);
			}
		}
	}
};

/**
 * Help to display HTML text for a JS variable
 * @param {string} text - Any text
 * @return {string}
 */
var parseHTML = function(text) {
	text = ''+text;
	return text
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll("'", '&#39;')
		.replaceAll('  ', '&nbsp;&nbsp;')
	;
};

/**
 * Help to display HTML text for a JS variable, and convert line breaks
 * @param {string} text - Any text
 * @return {string}
 */
var JStoHTML = function(text){
	//text = php_htmlentities(text, true); //Need to enable double encoding
	if(typeof text == 'undefined'){
		text = '';
	}
	text = parseHTML(text);
	text = lnTobr(text);
	return text;
};

/**
 * Convert line break into DOM element BR
 * @param {string} text - Any text
 */
var lnTobr = function(str) {
	return (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1<br />$2');
};

/**
 * Replace all instance found in a string
 * @param {string} find - The search string
 * @param {string} replace - The replacement string 
 * @return {string}
 */
String.prototype.replaceAll = function(find, replace) {
	find = find.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
	return this.replace(new RegExp(find, 'gi'), replace);
};

/**
 * Convert time in MM:SS
 * @param {number} duration - Duration in seconds
 * @return {string}
 */
var convertDuration = function(duration){
	duration = Math.abs(parseInt(duration, 10));
	var minutes = Math.floor(duration / 60);
	var seconds = duration - (60*minutes);
	if(seconds<10){
		seconds = '0'+seconds;
	}
	return minutes+':'+seconds;
};
