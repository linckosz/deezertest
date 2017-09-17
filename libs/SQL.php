<?php
/**
 * @author Bruno Martin <brunomartin@gmail.com>
 */

namespace libs;

use \config\Database;

/**
 * It connects to multiple databse 
 */
class SQL {

	/**
	 * Singleton for each connection to keep it alive
	 * @access protected
	 * @static
	 */
	protected static $singleton = array(); //Only need to start one connection per database

	/**
	 * Start the Databse connection
	 * @static
	 * @return PDO
	 */
	public static function getDatabase($database){
		if(!isset(self::$singleton[$database])){
			self::$singleton[$database] = false;
			if($connection = Database::getConnection($database)){
				self::$singleton[$database] = new \PDO($connection['driver'].':host='.$connection['host'].';dbname='.$connection['database'].';charset=utf8mb4', $connection['username'], $connection['password']);
				self::$singleton[$database]->setAttribute(\PDO::ATTR_ERRMODE, \PDO::ERRMODE_EXCEPTION);
				self::$singleton[$database]->setAttribute(\PDO::ATTR_EMULATE_PREPARES, false);
			}
		}
		return self::$singleton[$database];
	}

}
