<?php
/**
 * @author Bruno Martin <brunomartin@gmail.com>
 */

namespace bundles\api\models\data;

use \libs\Render;
use \bundles\api\models\ModelDeezer;
use \bundles\api\models\data\Playlist;

/**
 * User model
 */
class User extends ModelDeezer {

	/**
	 * Table name
	 * @access protected
	 * @static
	 */
	protected static $table = 'user';

	/**
	 * Which attribute will be visible by the client
	 * @access protected
	 * @static
	 */
	protected static $visible = array(
		'id',
		'md5',
		'name',
		'email',
	);

	/**
	 * CRUD restriction
	 * @access protected
	 * @static
	 */
	protected static $crud = 2; //CRU

/////////////////////////////////////////////////////////////////////

	/**
	 * Return all user's playlist
	 * Relationship One(User) to Many(Playlist)
	 * @return Playlist
	 */
	public function relation_playlist(){
		$sql = '
			SELECT `playlist`.*
			FROM `playlist`
			INNER JOIN
				`user`
				ON `playlist`.`user_id` = `user`.`id`
			WHERE
				`user`.`id` = :user_id
			;
		';
		$bind = array(
			'user_id' => $this->id,
		);
		return Playlist::hydrate($sql, $bind);
	}

	/**
	 * Return the favorite playlist of a user
	 * Relationship One(User) to Many(Playlist)
	 * @return Playlist
	 */
	public function relation_playlist_favorite(){
		$sql = '
			SELECT `playlist`.*
			FROM `playlist`
			INNER JOIN
				`user`
				ON `playlist`.`user_id` = `user`.`id`
			WHERE
				`playlist`.`favorite` = 1
				AND `user`.`id` = :user_id
			LIMIT 1
			;
		';
		$bind = array(
			'user_id' => $this->id,
		);
		return Playlist::hydrate($sql, $bind, true);
	}

/////////////////////////////////////////////////////////////////////

	/**
	 * Prepare the modle instance with the data sent via POST
	 * @static
	 * @param object $form The information received via POST
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

		if($new){
			if(isset($form->password)){
				$error = true;
				if(is_string($form->password)){
					$error = false;
					$bind['password'] = $model->password = password_hash($form->password, PASSWORD_BCRYPT);
				}
				if($error){
					$errfield = 'password';
					goto failed;
				}
			}

			if(isset($form->email)){
				$error = true;
				if(STR::validEmail($form->email)){
					$error = false;
					$bind['email'] = $model->email = trim($form->email);
				}
				if($error){
					$errfield = 'email';
					goto failed;
				}
			}
		}

		return $model->save($bind);

		failed:
		$errmsg = $deezer->getTranslation(4); //Operation failed.
		$errmsg .= "\n[".static::getTable().' - '.$errfield.']';
		\libs\Watch::php(array($errmsg, $form), 'failed', __FILE__, __LINE__, true);

		return (new Render($errmsg))->render('json');
	}

	/**
	 * Disable deletion
	 * @return boolean
	 */
	public function delete(){ return false; }
	
	/**
	 * Disable restoration
	 * @return boolean
	 */
	public function restore(){ return false; }

}
