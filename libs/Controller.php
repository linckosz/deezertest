<?php
/**
 * @author Bruno Martin <brunomartin@gmail.com>
 */

namespace libs;

use \libs\Render;

/**
 * Abstract clas of all Controllers
 * @abstract
 */
abstract class Controller {

	/**
	 * Fallback if no route matches
	 * @return mixed JSON string output
	 */
	public function __call($method, $args=array()){
		$msg = (\Deezer::getInstance())->getTranslation(1); //Sorry, we could not understand the request.
		return (new Render($msg, null, true, 404))->render('json');
	}

	/**
	 * Process the content of a page with variables before to output it
	 * @return mixed HTML string output
	 */
	public function view($view, $data=array()){
		$deezer = \Deezer::getInstance();
		$msg = '';
		if(is_file($deezer->getPath().$view)){
			$msg = file_get_contents($deezer->getPath().$view);
			//Replace HTML variables
			foreach ($data as $key => $value) {
				$msg = str_replace('{{ '.$key.' }}', $value, $msg);
			}
			//Make sure we always load on Front the last updated version of the file
			if(preg_match_all('/(\[\{ (.+?) \}\])/i', $msg, $matches, PREG_SET_ORDER)){
				foreach ($matches as $match) {
					$search = $match[1];
					$file = $match[2];
					$time = time();
					if(is_file($deezer->getPath().'/public'.$file)){
						$time = filemtime($deezer->getPath().'/public'.$file);
					}
					$file .= '?'.$time;
					$msg = str_replace($search, $file, $msg);
				}
				
			}
		}
		return (new Render($msg))->render('html');
	}

}
