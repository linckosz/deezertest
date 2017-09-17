<?php
/**
 * @author Bruno Martin <brunomartin@gmail.com>
 */

namespace bundles\api\models\data;

use \libs\Render;
use \bundles\api\models\ModelDeezer;
use \bundles\api\models\data\Song;
use \bundles\api\models\data\User;

/**
 * Playlist model
 */
class Playlist extends ModelDeezer {

	/**
	 * Table name
	 * @access protected
	 * @static
	 */
	protected static $table = 'playlist';

	/**
	 * Which attribute will be visible by the client
	 * @access protected
	 * @static
	 */
	protected static $visible = array(
		'id',
		'md5',
		'user_id',
		'name',
		'favorite',
	);

	/**
	 * When toVisible() is called, convert fields to integer format if the field exists only
	 * @access protected
	 */
	protected $model_integer = array(
		'user_id',
	);

	/**
	 * When toVisible() is called, convert fields to boolean format if the field exists only
	 * @access protected
	 */
	protected $model_boolean = array(
		'favorite',
	);

/////////////////////////////////////////////////////////////////////

	/**
	 * Return all songs attached to a Playlist
	 * Relationship Many(Playlist) to Many(Song)
	 * @return Song[]
	 */
	public function relation_song(){
		$sql = '
			SELECT `song`.*
			FROM `song`
			INNER JOIN
				`playlist_x_song`
				ON `song`.`id` = `playlist_x_song`.`song_id`
			WHERE
				`playlist_x_song`.`playlist_id` = :playlist_id
				AND `playlist_x_song`.`attached` = 1
			;
		';
		$bind = array(
			'playlist_id' => $this->id,
		);
		return Song::hydrate($sql, $bind);
	}

	/**
	 * Insert/Update pivot table
	 * @return boolean
	 */
	public function pivot_song($song_id, $song_md5, $pivot_attributes){
		if(is_string($song_md5) && strlen($song_md5)>=16){ //Update is authorized at 16 characters
			//Check if the song exists
			if(Song::findMD5($song_id, $song_md5)){
				//Check if the pivot exists
				$sql = '
					SELECT *
					FROM `playlist_x_song`
					WHERE
						`playlist_id` = :playlist_id
						AND `song_id` = :song_id
					LIMIT 1
					;
				';
				$bind = array(
					'playlist_id' => $this->id,
					'song_id' => $song_id,
				);
				$where = array(
					'playlist_id' => $this->id,
					'song_id' => $song_id,
				);
				$insert = true;
				if(ModelDeezer::hydrate($sql, $bind, true, false)){
					$insert = false;
				}
				foreach ($pivot_attributes as $key => $value) {
					$bind[$key] = $value;
				}
				static::saveRelation('playlist_x_song', $bind, $where, $insert);
				return true;
			}
		}
		return false;
	}

	/**
	 * Update "belongs to" relationship
	 * @return boolean
	 */
	public function pivot_user($user_id, $suser_md5, $pivot_attributes){
		if(is_string($suser_md5) && strlen($suser_md5)>=16){ //Update is authorized at 16 characters
			//Check if the user exists
			if(User::findMD5($user_id, $suser_md5)){
				$bind = array();
				if(isset($pivot_attributes->attached)){
					if($pivot_attributes->attached){
						$bind['user_id'] = $user_id;
					} else {
						$bind['user_id'] = null;
					}
				}
				if($this->save($bind)){
					return true;
				}
			}
		}
		return false;
	}

/////////////////////////////////////////////////////////////////////

	/**
	 * Prepare the modle instance with the data sent via POST
	 * @static
	 * @return mixed Playlist / JSON string output
	 */
	public static function setItem($form){
		$deezer = \Deezer::getInstance();

		$model = false;
		$errfield = 'undefined';
		$error = false;
		$new = true;
		$bind = array();

		//Convert to object
		$form = json_decode(json_encode($form, JSON_FORCE_OBJECT));
		foreach ($form as $key => $value) {
			if(!is_numeric($value) && empty($value)){ //Exclude 0 to become an empty string
				$form->$key = '';
			}
		}

		$md5 = false;
		if(isset($form->md5) && is_string($form->md5) && strlen($form->md5)==32){
			$md5 = $form->md5;
		}
		if(isset($form->id)){
			$new = false;
			$error = true;
			if($md5 && is_numeric($form->id)){
				$id = (int) $form->id;
				if($model = static::findMD5($id, $md5)){
					$error = false;
				}
			}
			if($error){
				$errfield = 'id';
				goto failed;
			}
		} else {
			$model = new self;
		}

		if(isset($form->name)){
			$error = true;
			if(is_string($form->name)){
				$error = false;
				$bind['name'] = $model->name = STR::breakLineConverter($form->name, ' ');
			}
			if($error){
				$errfield = 'name';
				goto failed;
			}
		}

		//[toto] We should add a condition to avoid the creation of 2 favorite lists
		if(isset($form->favorite)){
			$error = true;
			if(is_bool($form->favorite) || is_numeric($form->favorite)){
				$error = false;
				$bind['favorite'] = $model->favorite = (bool) $form->favorite;
			}
			if($error){
				$errfield = 'favorite';
				goto failed;
			}
		}

		return $model->save($bind);

		failed:
		$errmsg = $deezer->getTranslation(4); //Operation failed.
		$errmsg .= "\n[".static::getTable().' - '.$errfield.']';
		\libs\Watch::php(array($errmsg, $form), 'failed', __FILE__, __LINE__, true);

		return (new Render($errmsg))->render('json');
	}

}
