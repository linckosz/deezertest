<?php
/**
 * @author Bruno Martin <brunomartin@gmail.com>
 */

namespace bundles\api\models\data;

use \libs\Render;
use \bundles\api\models\ModelDeezer;

/**
 * Song model
 */
class Song extends ModelDeezer {

	/**
	 * Table name
	 * @access protected
	 * @static
	 */
	protected static $table = 'song';

	/**
	 * Which attribute will be visible by the client
	 * @access protected
	 * @static
	 */
	protected static $visible = array(
		'id',
		'md5',
		'name',
		'duration',
	);

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

		if(isset($form->duration)){
			$error = true;
			if(is_numeric($form->duration)){
				$error = false;
				$bind['duration'] = $model->duration = abs((int) $form->duration);
			}
			if($error){
				$errfield = 'duration';
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
