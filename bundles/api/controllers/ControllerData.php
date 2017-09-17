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
 * Crontoller for general CRUD operations on models
 */
class ControllerData extends Controller {

	/**
	 * Scan the data receive and launch the corresponding CRUD operations
	 * @return mixed JSON string output
	 */
	public function data(){
		$result = new \stdClass;
		$param = \Deezer::getParam();
		$data = false;
		if(isset($param->param)){
			$data = $param->param;
		}
		
		if(is_object($data)){

			//Read
			if(isset($data->read) && is_object($data->read)){
				foreach ($data->read as $table => $list) {
					$class = ModelDeezer::getClass($table);
					if($class){
						foreach ($list as $item) {
							if(isset($item->id) && isset($item->md5) && is_string($item->md5) && strlen($item->md5)>=8){ //Read is authorized at 8 characters
								if($model = $class::findMD5($item->id, $item->md5)){
									if(!isset($result->read)){ $result->read = new \stdClass; }
									if(!isset($result->read->$table)){ $result->read->$table = new \stdClass; }
									$result->read->$table->{$item->id} = $model->toVisible();
								} else {
									//attribute "delete" in case we need to clean front data
									if(!isset($result->delete)){ $result->delete = new \stdClass; }
									if(!isset($result->delete->$table)){ $result->delete->$table = new \stdClass; }
									$result->delete->$table->{$item->id} = true;
								}
							}
						}
					}
				}
			}

			//Insert or Update
			if(isset($data->set) && is_object($data->set)){
				if(!isset($result->read)){ $result->read = new \stdClass; }
				foreach ($data->set as $table => $list) {
					$class = ModelDeezer::getClass($table);
					if($class){
						if(!isset($result->read->$table)){ $result->read->$table = new \stdClass; }
						foreach ($list as $item) {
							if(
								   !isset($item->id) //insert
								|| (isset($item->md5) && is_string($item->md5) && strlen($item->md5)>=16) //Update is authorized at 16 characters
							){
								if($model = $class::setItem($item)){
									$model->setRelation($item);
									$result->read->$table->{$model->id} = $model->toVisible();
								}
							}
						}
					}
				}
			}

			//Restore
			if(isset($data->restore) && is_object($data->restore)){
				if(!isset($result->read)){ $result->read = new \stdClass; }
				foreach ($data->restore as $table => $list) {
					$class = ModelDeezer::getClass($table);
					if($class){
						if(!isset($result->read->$table)){ $result->read->$table = new \stdClass; }
						foreach ($list as $item) {
							if(isset($item->id) && isset($item->md5) && is_string($item->md5) && strlen($item->md5)==32){ //Restore is authorized at 32 characters
								if($model = $class::findMD5($item->id, $item->md5)){
									if($model->restore()){
										$result->read->$table->{$model->id} = $model->toVisible();
									}
								}
							}
						}
					}
				}
			}

			//Delete
			if(isset($data->delete) && is_object($data->delete)){
				if(!isset($result->delete)){ $result->delete = new \stdClass; }
				foreach ($data->delete as $table => $list) {
					$class = ModelDeezer::getClass($table);
					if($class){
						if(!isset($result->delete->$table)){ $result->delete->$table = new \stdClass; }
						foreach ($list as $item) {
							if(isset($item->id) && isset($item->md5) && is_string($item->md5) && strlen($item->md5)==32){ //Delete is authorized at 32 characters
								if($model = $class::findMD5($item->id, $item->md5)){
									$id = $model->id;
									if($model->delete()){
										$result->delete->$table->$id = true;
									}
								}
							}
						}
					}
				}
			}

		}

		if(isset($result->read)){
			foreach ($result->read as $table => $items) {
				if(empty((array)$result->read->$table)){
					unset($result->read->$table);
				}
			}
		}

		if(isset($result->delete)){
			foreach ($result->delete as $table => $items) {
				if(empty((array)$result->delete->$table)){
					unset($result->delete->$table);
				}
			}
		}

		return (new Render('ok', $result))->render('json');

	}

}
