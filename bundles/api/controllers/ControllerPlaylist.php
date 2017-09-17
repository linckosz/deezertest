<?php
/**
 * @author Bruno Martin <brunomartin@gmail.com>
 */

namespace bundles\api\controllers;

use \libs\Render;
use \libs\Controller;
use \bundles\api\models\ModelDeezer;
use \bundles\api\models\data\Playlist;
use \bundles\api\models\data\Song;
use \bundles\api\models\data\User;

/**
 * Controller for special commands on Playlist
 */
class ControllerPlaylist extends Controller {

	/**
	 * Return all songs from user's favorite list
	 * @return mixed JSON string output
	 */
	public function favoriteSongs(){
		$result = new \stdClass;
		$param = \Deezer::getParam();
		$item = false;
		if(isset($param->param) && isset($param->param->read) && isset($param->param->read->user)){
			foreach ($param->param->read->user as $value) {
				$item = $value;
				//Only grab one instance
				break;
			}
		}
		if(is_object($item)){
			if(isset($item->id) && isset($item->md5) && is_string($item->md5) && strlen($item->md5)>=8){ //Read is authorized at 8 characters
				//Check first that we have the user access
				if($user = User::find($item->id, $item->md5)){
					if($playlist = $user->relation_playlist_favorite()){
						if(!isset($result->read)){ $result->read = new \stdClass; }
						if(!isset($result->read->playlist)){ $result->read->playlist = new \stdClass; }
						$result->read->playlist->{$playlist->id} = $playlist->toVisible();
						if($songs = $playlist->relation_song()){
							foreach ($songs as $song) {
								if(!isset($result->read)){ $result->read = new \stdClass; }
								if(!isset($result->read->song)){ $result->read->song = new \stdClass; }
								$result->read->song->{$song->id} = $song->toVisible();
							}
						}
					}
				}
			}
		}

		return (new Render('ok', $result))->render('json');
	}

	/**
	 * Return all songs from a list
	 * @return mixed JSON string output
	 */
	public function songs(){
		$result = new \stdClass;
		$param = \Deezer::getParam();
		$item = false;
		if(isset($param->param) && isset($param->param->read) && isset($param->param->read->playlist)){
			foreach ($param->param->read->playlist as $value) {
				$item = $value;
				//Only grab one instance
				break;
			}
		}
		if(is_object($item)){
			if(isset($item->id) && isset($item->md5) && is_string($item->md5) && strlen($item->md5)>=8){ //Read is authorized at 8 characters
				if($playlist = Playlist::find($item->id, $item->md5)){
					if(!isset($result->read)){ $result->read = new \stdClass; }
					if(!isset($result->read->playlist)){ $result->read->playlist = new \stdClass; }
					$result->read->playlist->{$playlist->id} = $playlist->toVisible();
					if($songs = $playlist->relation_song()){
						foreach ($songs as $song) {
							if(!isset($result->read)){ $result->read = new \stdClass; }
							if(!isset($result->read->song)){ $result->read->song = new \stdClass; }
							$result->read->song->{$song->id} = $song->toVisible();
						}
					}
				}
			}
		}

		return (new Render('ok', $result))->render('json');
	}

}
