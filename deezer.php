<?php
/**
 * @author Bruno Martin <brunomartin@gmail.com>
 */

use \libs\Folders;
use \libs\Render;
use \libs\SQL;
use \libs\STR;

/**
 * A class to store and operation all general application information
 */
class Deezer {

	/**
	 * The singleton of the running application
	 * @access protected
	 * @static
	 */
	protected static $singleton = null;

	/**
	 * Store any kind of data, for a global access
	 * @access protected
	 * @static
	 */
	protected static $data = array();

	/**
	 * The root directory of the application
	 * @access protected
	 * @static
	 */
	protected static $path = null;

	/**
	 * The language, can be 'en' or 'fr'
	 * @access protected
	 * @static
	 */
	protected static $language = 'en';

	/**
	 * Keep a record of the data sent via POST or GET
	 * @access protected
	 * @static
	 */
	protected static $param = null;

	/**
	 * API ID of the application used for the domain
	 * @access protected
	 * @static
	 */
	protected static $deezer_api_id = '';

	/**
	 * SECRET of the application used for the domain
	 * @access protected
	 * @static
	 */
	protected static $deezer_secret = '';

	/**
	 * The APi key to secure all POST requests to the API
	 */
	const APIKEY = '38e30d84swe0ef799duy5cc4';

	/**
	 * All routes accepted
	 * @access protected
	 * @static
	 */
	protected static $route = array(
		'GET' => array(),
		'POST' => array(),
	);

	/**
	 * Constructor
	 * @access protected
	 * @return void
	 */
	protected function __construct(){
		if(!self::$singleton){
			self::$path = dirname(__FILE__);
			self::$singleton = $this;
			self::getParam();
			self::security();
		}
	}

	/**
	 * Return the application instance
	 * @static
	 * @return self
	 */
	public static function getInstance(){
		if(self::$singleton){
			return self::$singleton;
		}
		return new self;
	}

	/**
	 * Return the data sent via GET or POST
	 * @static
	 * @return object
	 */
	public static function getParam(){
		if(self::$param){
			return self::$param;
		}
		if(mb_strtolower($_SERVER['REQUEST_METHOD'])=='post'){
			self::$param = $_POST;
		} else if(mb_strtolower($_SERVER['REQUEST_METHOD'])=='get'){
			self::$param = $_GET;
		}
		//Force to object convertion
		self::$param = json_decode(json_encode(self::$param, JSON_FORCE_OBJECT));
		return self::$param;
	}

	/**
	 * We secure the connection for any POST request which are related to CRUD operations (Done only via POST)
	 * @return mixed JSON string output
	 */
	public function security(){
		if(mb_strtolower($_SERVER['REQUEST_METHOD'])=='post'){
			//Valid API key
			if(!isset(self::$param->key) || self::$param->key != self::APIKEY){
				$msg = $this->getTranslation(3); //You are not allowed to access the server.
				return (new Render($msg, null, true, 401))->render('json');
			}
		}
	}

	/**
	 * Check if a data exists in the application instance
	 * @return boolean
	 */
	public function checkData($key){
		if(is_string($key) && isset(self::$data[$key])){
			return true;
		}
		return false;
	}

	/**
	 * Return a data stored in the application instance
	 * @return mixed
	 */
	public function getData($key){
		if(is_string($key) && self::checkData($key)){
			return self::$data[$key];
		}
		return null;
	}

	/**
	 * Set a data stored in the application instance
	 * @return mixed
	 */
	public function setData($key, $value){
		return self::$data[$key] = $value;
	}

	/**
	 * Return the root directory of the application
	 * @return string
	 */
	public function getPath(){
		return self::$path;
	}

	/**
	 * Return the current timestamp in milliseconds
	 * @return integer
	 */
	public function microSeconds(){
		list($usec, $sec) = explode(' ', microtime());
		return (1000 * (int)$sec) + round(1000 * (float)$usec);
	}

	/**
	 * Load all bundles requested
	 * @return void
	 */
	public function loadBundles(array $bundles){
		foreach ($bundles as $bundle) {
			//Only accept routes from preloaded bundles
			$folder = new Folders($this->getPath().'/bundles/'.$bundle.'/routes');
			$folder->includeRecursive();

			//Include public files (create symlink at first launch only)
			if(is_dir($this->getPath().'/bundles/'.$bundle.'/public') && !is_dir($this->getPath().'/public/deezer/'.$bundle)){
				$folder = new Folders();
				$folder->createSymlink($this->getPath().'/bundles/'.$bundle.'/public', $this->getPath().'/public/deezer/'.$bundle);
			}
		}
	}

	/**
	 * Set a GET route access
	 * @return void
	 */
	public function setRouteGet(string $uri, string $controller, string $function){
		self::$route['GET'][$uri] = array($controller, $function);
	}

	/**
	 * Set a POST route access
	 * @return void
	 */
	public function setRoutePost(string $uri, string $controller, string $function){
		self::$route['POST'][$uri] = array($controller, $function);
	}

	/**
	 * Start the application
	 * @return mixed boolean / JSON string output
	 */
	public function launch(){
		$uri = strstr($_SERVER['REQUEST_URI'], '?', true); //Exclude everything after '?'
		if(!$uri){
			$uri = $_SERVER['REQUEST_URI'];
		}
		$method = $_SERVER['REQUEST_METHOD'];
		if(isset(self::$route[$method])){
			if(isset(self::$route[$method][$uri]) && class_exists(self::$route[$method][$uri][0], true)){
				$controller = new self::$route[$method][$uri][0];
				if(method_exists($controller, self::$route[$method][$uri][1])){
					$controller->{self::$route[$method][$uri][1]}();
					return true;
				}
			}
		}
		$msg = $this->getTranslation(1); //Sorry, we could not understand the request.
		return (new Render($msg, null, true, 404))->render('json');
	}

	/**
	 * Set the output language
	 * @return void
	 */
	public function setLanguage(string $language){
		//Must check that the column exists
		$db = SQL::getDatabase('data');
		$query = $db->prepare('DESCRIBE `translation`');
		$query->execute();
		$columns = $query->fetchAll(\PDO::FETCH_COLUMN);
		if($language!='id' && in_array($language, $columns)){
			self::$language = $language;
		}
	}

	/**
	 * Return a string in the instance language
	 * @return string
	 */
	public function getTranslation($id, $format=false){
		$db = SQL::getDatabase('data');
		$query = $db->prepare('SELECT `'.self::$language.'` FROM `translation` WHERE id=:id');
		$query->bindValue(':id', $id);
		$query->execute();
		$result = $query->fetch(\PDO::FETCH_ASSOC);
		$text = '';
		if(isset($result[self::$language])){
			$text = $result[self::$language];
		}
		if($format=='html'){
			$text = STR::toHTML($text);
		} else if($format=='js'){
			$text = STR::toJS($text);
		}
		return $text;
	}

	public function getApiID(){
		if(isset($_SERVER['DEEZER_API_ID'])){
			self::$deezer_api_id = $_SERVER['DEEZER_API_ID']; //The value is stored into NGINX configuration file 'nginx_fronf.conf'.
		}
		return self::$deezer_api_id;
	}

	public function getSecret(){
		if(isset($_SERVER['DEEZER_SECRET'])){
			self::$deezer_secret = $_SERVER['DEEZER_SECRET']; //The value is stored into NGINX configuration file 'nginx_fronf.conf'.
		}
		return self::$deezer_secret;
	}

}

/**
 * Initiate the singleton
 */
$deezer = \Deezer::getInstance();
