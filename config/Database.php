<?php
/**
 * This file should be read only from any developer,
 * and should not be pushed to Github because it contains passwords
 * @author Bruno Martin <brunomartin@gmail.com>
 */

namespace config;

/**
 * Information about all database connections
 */
class Database {

	/**
	 * 
	 * @access protected
	 * @static
	 */
	protected static $connections = array(
		'data' => array(
			'driver' => 'mysql',
			'host' => '192.168.1.160',
			'database' => 'demo_deezer',
			'username' => 'demo_deezer',
			'password' => 'deezer123456',
		),
	);

	/**
	 * Return connection information
	 * @static
	 * @param string $database Name of the Database
	 * @return self|boolean
	 */
	public static function getConnection($database){
		if(isset(self::$connections[$database])){
			return self::$connections[$database];
		}
		return false;
	}

};

		
