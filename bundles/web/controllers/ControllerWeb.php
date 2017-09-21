<?php
/**
 * @author Bruno Martin <brunomartin@gmail.com>
 */

namespace bundles\web\controllers;

use \libs\Controller;

/**
 * SDK JS page Controller
 */
class ControllerWeb extends Controller {

	/**
	 * It displays a page with requestes features from Deezer as a JS button
	 * @return void
	 */
	public function web(){
		$deezer = \Deezer::getInstance();
		$data = array(
			'deezer_api_id' => $deezer->getApiID(),
			'open_player' => $deezer->getTranslation(2000), //Open Player
			'deezer_authorized' => $deezer->getToken(),
			'remove' => $deezer->getTranslation(2004), //remove
			'add_song' => $deezer->getTranslation(2007), //Add a song
			'back_playlist' => $deezer->getTranslation(2008), //Back to my playlist
			'language' => $deezer->getTranslation(2009), //Français
			'language_switch' => $deezer->getTranslation(2010), //fr
		);
		$this->view('/bundles/web/view/web.html', $data);
	}

	/**
	 * It displays a page with requestes features from Deezer as a JS button
	 * @return void
	 */
	public function channel(){
		//http://developers.deezer.com/sdk/javascript
		$cache_expire = 60*60*24*365;
		header('Pragma: public');
		header('Cache-Control: max-age='.$cache_expire);
		header('Expires: '.gmdate('D, d M Y H:i:s', time()+$cache_expire).' GMT');
		header('Content-type: text/html; charset=UTF-8');
		$this->view('/bundles/web/view/channel.html');
	}

	/**
	 * It displays all dynamic translated sentences for javascript
	 * @return javascript
	 */
	public function translation(){
		$deezer = \Deezer::getInstance();
		header('Content-type: application/javascript; charset=UTF-8');
		echo ''
			.'web_translation.list[2001] = "'.$deezer->getTranslation(2001, 'js').'";'."\n" //Fetching your information...
			.'web_translation.list[2002] = "'.$deezer->getTranslation(2002, 'js').'";'."\n" //Welcome back
			.'web_translation.list[2003] = "'.$deezer->getTranslation(2003, 'js').'";'."\n" //Login cancelled or unauthorized.
			.'web_translation.list[2005] = "'.$deezer->getTranslation(2005, 'js').'";'."\n" //Do you really want to remove this song from the playlist?
		;
		return exit(0);
	}

}
