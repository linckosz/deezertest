<?php
/**
 * @author Bruno Martin <brunomartin@gmail.com>
 */

namespace bundles\api\models;

use \libs\SQL;
use \libs\STR;

/**
 * Abstract class for all models
 * @abstract
 */
abstract class ModelDeezer {

	/**
	 * Keep a record if the item has just been created
	 * @access protected
	 */
	protected $model_new = false;

	/**
	 * Attributes that will be visible on front only
	 * @access protected
	 * @static
	 */
	protected static $visible = array(
		'id',
		'md5',
		'created',
		'updated',
		'deleted',
	);

	/**
	 * When toVisible() is called, convert fields to integer format if the field exists only
	 * @access protected
	 * @static
	 */
	protected static $class_integer = array(
		'id',
		'created',
		'updated',
		'deleted',
	);

	/**
	 * When toVisible() is called, convert fields to integer format if the field exists only
	 * @access protected
	 */
	protected $model_integer = array();

	/**
	 * When toVisible() is called, convert fields to boolean format if the field exists only
	 * @access protected
	 * @static
	 */
	protected static $class_boolean = array();

	/**
	 * When toVisible() is called, convert fields to boolean format if the field exists only
	 * @access protected
	 */
	protected $model_boolean = array();

	/**
	 * CRUD restriction per model class
	 * 1:CRUD / 2: CRU / 3:CR
	 * @access protected
	 * @static
	 */
	protected static $crud = 1;

	/**
	 * Return the Table name
	 * @static
	 * @return static
	 */
	public static function getTable(){
		return static::$table;
	}

	/**
	 * Return the Class name
	 * @static
	 * @param string $table The table name of the Class
	 * @return string|boolean
	 */
	public static function getClass($table=false){
		if(!$table){
			$table = static::getTable();
		}
		$fullClass = '\\bundles\\api\\models\\data\\'.STR::textToFirstUC($table);
		if(class_exists($fullClass)){
			return $fullClass;
		}
		return false;
	}

	/**
	 * Return MySQL response, or hydrate models
	 * @static
	 * @param string $sql The raw SQL request
	 * @param array $bind An array of the variables to inject
	 * @param boolean $single True: We get only the instance / False: We get an array of instances
	 * @param boolean $hydrate True: We hydrate the instance / False: We don't hydrate
	 * @return array|object It can be a array of array(SQL direct response), an array of multiple model instances, an model instance
	 */
	public static function hydrate(string $sql, array $bind, bool $single=false, $hydrate=true){
		$db = SQL::getDatabase('data');
		$query = $db->prepare($sql);
		foreach ($bind as $key => $value) {
			$query->bindValue(':'.$key, $value);
		}
		$query->execute();

		$result = false;
		if($single){
			$row = $query->fetch(\PDO::FETCH_ASSOC);
			if($row && count($row)>=1){
				if(!$hydrate){
					return $row;
				}
				$class = static::getClass();
				$result = new $class;
				foreach ($row as $key => $value) {
					$result->$key = $value;
				}
			}
		} else {
			$rows =  $query->fetchAll(\PDO::FETCH_ASSOC);
			if($rows && count($rows)>=1){
				if(!$hydrate){
					return $rows;
				}
				$class = static::getClass();
				$result = array();
				$i = 0;
				foreach ($rows as $row) {
					$result[$i] = new $class;
					foreach ($row as $key => $value) {
						$result[$i]->$key = $value;
					}
					$i++;
				}
			}
		}

		return $result;
	}

	/**
	 * Save relation between 2 model instances
	 * @param string $table The table name of the Class
	 * @param array $bind An array of the variables to inject
	 * @param string $where Some "where" SQL conditions
	 * @param boolean $insert True: Insert a row / False: Update a row
	 * @return boolean
	 */
	public function saveRelation($table, $bind=array(), $where=array(), $insert=false){
		if($insert){
			$fields = '';
			$values = '';
			$comma = false;
			foreach ($bind as $key => $value) {
				if($comma){
					$fields .= ', ';
					$values .= ', ';
				}
				$fields .= '`'.$key.'`';
				$values .= ':'.$key;
				$comma = true;
			}
			$sql = 'INSERT INTO `'.$table.'` ('.$fields.') VALUES ('.$values.');';
		} else if(!empty($where)){
			$values = '';
			$comma = false;
			foreach ($bind as $key => $value) {
				if($comma){
					$values .= ', ';
				}
				$values .= '`'.$key.'`=:'.$key;
				$comma = true;
			}
			$sql = 'UPDATE `'.$table.'` SET '.$values;
			//Add Where condition
			$values = '';
			$and = false;
			foreach ($where as $key => $value) {
				$bind['w_'.$key] = $value;
				if($and){
					$values .= ' AND ';
				}
				$values .= '`'.$key.'`=:w_'.$key;
				$and = true;
			}
			$sql .= ' WHERE '.$values.' LIMIT 1;';
		} else {
			return false;
		}
		$db = SQL::getDatabase('data');
		$query = $db->prepare($sql);
		foreach ($bind as $key => $value) {
			$query->bindValue(':'.$key, $value);
		}
		$query->execute();
		return true;
	}

	/**
	 * Scanne all attributes '_attach/_detach' of a form to determine relation will be saved
	 * @param object $attributes List of item attributes
	 * @return void
	 */
	public function setRelation($attributes){
		foreach ($attributes as $attribute => $items) {
			//Attach
			if(($attribute=='_attach' || $attribute=='_detach') && is_object($items)){
				foreach ($items as $item) {
					$type = $item->{'0'};
					if(method_exists($this, 'pivot_'.$type)){
						$id = $item->{'1'};
						$md5 = $item->{'2'};
						$pivot_attributes = new \stdClass;
						if(isset($item->{'3'}) && is_object($item->{'3'})){
							$pivot_attributes = $item->{'3'};
						}
						unset($pivot_attributes->{static::getTable().'_id'});
						unset($pivot_attributes->{$type.'_id'});
						if($attribute=='_attach'){
							$pivot_attributes->attached = true;
						} else if($attribute=='_detach'){
							$pivot_attributes->attached = false;
						}
						$this->{'pivot_'.$type}($id, $md5, $pivot_attributes);
					}
				}
			}
		}
	}

	/**
	 * Return a instance by its ID
	 * @static
	 * @param integer $id Model ID
	 * @return static
	 */
	public static function find(int $id){
		$bind = array(
			'id' => $id,
		);
		$sql = 'SELECT * FROM `'.static::getTable().'` WHERE `id`=:id LIMIT 1;';
		return static::hydrate($sql, $bind, true);
	}

	/**
	 * Return a instance by its ID and its MD5 (CRUD check)
	 * @static
	 * @param integer $id Model ID
	 * @param string $id Model MD5
	 * @return boolean|static
	 */
	public static function findMD5(int $id, $md5){
		//Read is authorized at 8 characters
		if(strlen($md5)<8){
			return false;
		}
		$bind = array(
			'id' => $id,
			'md5' => $md5.'%',
		);
		$sql = 'SELECT * FROM `'.static::getTable().'` WHERE `id`=:id AND `md5` LIKE :md5 LIMIT 1;';
		return static::hydrate($sql, $bind, true);
	}

	/**
	 * Return all columns of a model Table
	 * @return array
	 */
	public function getColumns(){
		$db = SQL::getDatabase('data');
		$query = $db->prepare('DESCRIBE `'.static::getTable().'`');
		$query->execute();
		return $query->fetchAll(\PDO::FETCH_COLUMN);
	}

	/**
	 * Soft deletion of an model instance
	 * @return boolean|static
	 */
	public function delete(){
		$return = false;
		if(isset($this->id) && is_null($this->deleted)){
			$micro_seconds = $deezer->microSeconds();
			$bind = array(
				'deleted' => $micro_seconds,
				'updated' => $micro_seconds,
				'id' => $this->id,
			);
			$sql = 'UPDATE `'.static::getTable().'` SET `deleted`=:deleted, `updated`=:updated WHERE `id`=:id LIMIT 1;';
			if($return = static::hydrate($sql, $bind, true, false)){
				foreach ($bind as $key => $value) {
					$this->$key = $value;
				}
			}
		}
		return $return;
	}

	/**
	 * Restoration of a model instance
	 * @return boolean|static
	 */
	public function restore(){
		$return = false;
		if(isset($this->id) && !is_null($this->deleted)){
			$micro_seconds = $deezer->microSeconds();
			$bind = array(
				'deleted' => null,
				'updated' => $micro_seconds,
				'id' => $this->id,
			);
			$sql = 'UPDATE `'.static::getTable().'` SET `deleted`=:deleted, `updated`=:updated WHERE `id`=:id LIMIT 1;';
			if($return = static::hydrate($sql, $bind, true, false)){
				foreach ($bind as $key => $value) {
					$this->$key = $value;
				}
			}
		}
		return $return;
	}

	/**
	 * Insert/Udate a model instance into the database
	 * @param array $bind An array of the variables to inject
	 * @return $this
	 */
	public function save($bind=array()){
		$deezer = \Deezer::getInstance();
		$micro_seconds = $deezer->microSeconds();

		$this->model_new = $new = !isset($this->id);
		if($new && (!isset($this->md5) || strlen($this->md5)!=32)){
			$bind['md5'] = md5(uniqid('', true));
			$bind['created'] = $micro_seconds;
		}
		$bind['updated'] = $micro_seconds;

		$columns = $this->getColumns();
		//Insure to not send to mysql any field that does not exists (for example parent_type)
		foreach ($bind as $key => $value) {
			if(!in_array($key, $columns)){
				unset($bind[$key]);
			}
		}

		//Make sure we don't modif some attributes for existing objects
		if(!$new){
			unset($bind['id']);
			unset($bind['md5']);
			unset($bind['created']);
		}
		unset($bind['deleted']);

		//Delete any unchanged attribute (can save some SQL requests)
		foreach ($bind as $key => $value) {
			if(isset($this->$key) && $this->$key==$value){
				unset($bind[$key]);
			}
		}

		//To avoid any SQL injection, make sure that key are in a correct format
		foreach ($bind as $key => $value) {
			if(!preg_match("/^[a-zA-Z0-9_-]+$/ui", $key)){
				unset($bind[$key]);
			}
		}

		$return = true;
		if(count($bind)>0){
			$return = false;
			try {
				if($new){
					$fields = '';
					$values = '';
					$comma = false;
					foreach ($bind as $key => $value) {
						if($comma){
							$fields .= ', ';
							$values .= ', ';
						}
						$fields .= '`'.$key.'`';
						$values .= ':'.$key;
						$comma = true;
					}
					$sql = 'INSERT INTO `'.static::getTable().'` ('.$fields.') VALUES ('.$values.');';
					if($model = static::hydrate($sql, $bind, true, true)){
						//It insures that we will get the generated ID
						foreach ($model as $key => $value) {
							$this->$key = $value;
						}
					}
				} else {
					$values = '';
					$comma = false;
					foreach ($bind as $key => $value) {
						if($comma){
							$values .= ', ';
						}
						$values .= '`'.$key.'`=:'.$key;
						$comma = true;
					}
					$sql = 'UPDATE `'.static::getTable().'` SET '.$values.' WHERE `id`=:id LIMIT 1;';
					$bind['id'] = $this->id;
					if($return = static::hydrate($sql, $bind, true, false)){
						foreach ($bind as $key => $value) {
							$this->$key = $value;
						}
					}
				}
			} catch(\Exception $e){
				\libs\Watch::php(\config\getTraceAsString($e, 10), 'Exception: '.$e->getLine().' / '.$e->getMessage(), __FILE__, __LINE__, true);
			}
		}

		return $this;
		
	}

	/**
	 * Return a cleaned version of the model object ready for client output
	 * @return object
	 */
	public function toVisible(){

		$visible = new \stdClass;
		foreach (static::$visible as $value) {
			if(isset(static::$class_integer[$value])){
				$visible->$value = (int) $this->$value;
			}
			else if(isset(static::$model_integer[$value])){
				$visible->$value = (int) $this->$value;
			}
			if(isset(static::$class_boolean[$value])){
				$visible->$value = (int) $this->$value;
			}
			else if(isset(static::$model_boolean[$value])){
				$visible->$value = (int) $this->$value;
			} else {
				$visible->$value = $this->$value;
			}
		}

		//CRUD
		//Note => For the demo, we give full right, but for Production we should have a pivot tabe that keep trak of specific case (if any, need to care about inheritage too)
		if(isset($visible->md5)){
			if(static::$crud == 2){ //CRU
				$visible->md5 = substr($visible->md5, 0, 16);
			} else if(static::$crud == 3){ //CR
				$visible->md5 = substr($visible->md5, 0, 8);
			}
		}

		return $visible;
	}


}
