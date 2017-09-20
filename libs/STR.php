<?php
/**
 * @author Bruno Martin <brunomartin@gmail.com>
 */

namespace libs;

/**
 * String manipulation
 */
class STR {

	/**
	 * Convert a text to HTML entities, readable by HTML, INPUT, TEXTAREA
	 * @static
	 * @return string
	 */
	public static function toHTML($text) {
		$text = htmlspecialchars($text, ENT_HTML5 | ENT_QUOTES);
		$text = nl2br($text);
		$text = self::breakLineConverter($text, ''); 
		return $text;
	}

	/**
	 * Convert a text to JS entities, readable by JS
	 * Note, use quotes "..." around the JS variable while displaying
	 * @static
	 * @param string $text Any text
	 * @return string
	 */
	public static function toJS($text) {
		$text = json_encode($text);
		$text = str_replace("\\r\\n", "\\n", $text);
		//Cancel the quote " added by json_encode
		$text = preg_replace("/^\"|\"$/u", '', $text);
		return $text;
	}

	/**
	 * Convert "any_SHORT description " to "AnyShortDescription"
	 * @static
	 * @param string $text Any text
	 * @return string
	 */
	public static function textToFirstUC($text){
		$text = str_replace('_', ' ', $text);
		$text = ucwords(strtolower($text));
		$text = str_replace(' ', '', $text);
		return $text;
	}

	/**
	 * Delete any line return
	 * @static
	 * @param string $text Any text
	 * @param string $replace The replaced string
	 * @return string
	 */
	public static function breakLineConverter($text, $replace) {
		return str_replace(array("\r\n", "\r", "\n", CHR(10), CHR(13)), $replace, $text); 
	}

	/**
	 * 191 is limited by MySQL for UTF8 Indexing
	 * @static
	 * @param string $text Any text
	 * @return boolean
	 */
	public static function validEmail($text){
		return is_string($text) && preg_match("/^.{1,191}$/u", $text) && filter_var($text, FILTER_VALIDATE_EMAIL) && preg_match("/^.{1,100}@.*\..{2,4}$/ui", $text) && preg_match("/^[_a-z0-9-%+]+(\.[_a-z0-9-%+]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,4})$/ui", $text);
	}

	/**
	 * Get an hazard alphanumeric mix of lengh X
	 * @static
	 * @param integer $lengh The length of the string we want to receive
	 * @return string
	 */
	public static function random($lengh=16) {
		$characters = '123456789abcdefghijklmnopqrstuvwxyz';
		$string = '';
		for($p=0; $p<$lengh; $p++) {
			$string .= $characters[mt_rand(0,mb_strlen($characters)-1)];
		}
		return ''.$string; //To be sure it will return a string
	}

}
