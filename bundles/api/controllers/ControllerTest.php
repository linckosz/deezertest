<?php
/**
 * @author Bruno Martin <brunomartin@gmail.com>
 */

namespace bundles\api\controllers;

use \libs\Controller;
use \libs\Folders;
use \libs\Render;
use \libs\SQL;
use \libs\STR;
use \bundles\api\models\ModelDeezer;
use \bundles\api\models\data\Playlist;
use \bundles\api\models\data\Song;
use \bundles\api\models\data\User;

/**
 * Controller used to Debug purpose only
 * Unit test, or scenaios, can be added in this controller
 */
class ControllerTest extends Controller {

	/**
	 * You can write everything you need to test/debug
	 * From client side, launch it with the javascript function:
	 * commmunication_ajax.send('/test');
	 * @return mixed JSON string output
	 */
	public function test(){
		$deezer = \Deezer::getInstance();
		$tp = null;

		//Do your cook here

		\libs\Watch::php( $tp, time(), __FILE__, __LINE__, false, false, true);
		return (new Render('test'))->render('json');
	}

}
