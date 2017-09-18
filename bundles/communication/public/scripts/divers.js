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
 * Polyfill for event listener
 * @param {string} type - The event name (like 'click')
 * @param {string|object} id - The ID of a DOM element, or the DOM elemnet itself
 * @param {function} fn - The function to launch when the event is fired
 * @return {void}
 */
var attachAction = function(type, id, fn){
	var elem = false;
	if(typeof id == 'string'){
		var elem = document.getElementById(id);
	} else if(typeof id == 'object'){
		var elem = id;
	}
	if(elem && typeof fn == 'function'){
		if(typeof window.addEventListener == 'function'){
			elem.addEventListener(type, fn, false);
		} else if(typeof window.attachEvent){
			elem.attachEvent('on'+type, fn);
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

var lnTobr = function(str) {
	return (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1<br />$2');
}

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
}
