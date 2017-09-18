<?php
/**
 * @author Bruno Martin <brunomartin@gmail.com>
 */

namespace bundles\demo\controllers;

use \libs\Controller;

/**
 * Mini API page Controller
 */
class ControllerDemo extends Controller {

	/**
	 * It displays a page with requestes features from Deezer as a JS button
	 * @return void
	 */
	public function demo(){
		$deezer = \Deezer::getInstance();
		$data = array(
			'page_clear' => $deezer->getTranslation(1000), //Clear
			'user_info' => $deezer->getTranslation(1001), //Get a user information (user.id:1)
			'song_info' => $deezer->getTranslation(1002), //Get a song information (song.id:1)
			'playlist_favorite_songs' => $deezer->getTranslation(1003), //Get all songs from a user's favorite playlist (user.id:1)
			'playlist_favorite_add' => $deezer->getTranslation(1004), //Add a song into a user's favorite playlist (playlist.id:1 / song.id:40)
			'playlist_favorite_remove' => $deezer->getTranslation(1005), //Remove a song from a user's favorite playlist (playlist.id:1 / song.id:40)
		);
		$this->view('/bundles/demo/view/demo.html', $data);
	}

}
