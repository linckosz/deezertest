<?php
/**
 * @author Bruno Martin <brunomartin@gmail.com>
 */

namespace bundles\communication\controllers;

use \libs\Controller;
use \libs\Render;

/**
 * Grab outside debugging information
 */
class ControllerDebug extends Controller {

	//This function help to test some code scenario
	/**
	 * Record JS code sent by the client
	 * @return mixed JSON string output
	 */
	public function js(){
		\libs\Watch::js();
		return (new Render('debug'))->render('json');
	}

}
