<?php
/**
 * @author Bruno Martin <brunomartin@gmail.com>
 */

namespace libs;

use \libs\Folders;

/**
 * it helps to watch variables
 */
class Watch {

	/**
	 * Cleaner help to clean the complete page at the very first call
	 * @access protected
	 * @static
	 */
	protected static $cleaner = false;

	/**
	 * Function to watch variables
	 * @example \libs\Watch::php(true, '$var', __FILE__, __LINE__, false, false, true);
	 * @static
	 * @return void
	 */
	public static function php($var='yes', $comment='undefined', $filename=__FILE__, $fileline=__LINE__, $error=false, $reset=false, $cleaner=false){
		$deezer = \Deezer::getInstance();

		if($cleaner && !self::$cleaner){
			self::$cleaner = true;
			$reset = true;
		}

		if($error){
			$logPath = $deezer->getPath().'/logs/php';
			$fic = $logPath.'/logPHP_'.date('ymd').'.txt';
		} else {
			$logPath = $deezer->getPath().'/logs';
			$fic = $logPath.'/watchPHP_'.date('ymd').'.txt';
		}

		$folder = new Folders;
		$folder->createPath($logPath, 0770);

		if(file_exists($fic)){
			$truncate = 500000;
			if($reset){ $truncate = 0; }
			if(filesize($fic)>$truncate*2){ //Help to never get a file higher than 1MB, avoid to fulfill the server space in case of heavy bug
				if($fp = fopen($fic, 'r+')){ //We open the file in read/write, and place the cursor at the beginning
					@ftruncate($fp, $truncate); //Cut the file in half (like that it keep all first alerts)
					fclose($fp); //CLose the file
				}
			}
		}
		
		$dt = date("Y-m-d H:i:s (T)");

		$userid = 'unknown'; //User ID
		$username = 'unknown'; //User Name
		if($deezer->checkData('user') && $user = $deezer->getData('user')){
			if(isset($user->id)){
				$userid = $user->id;
			}
			if(isset($user->name)){
				$username = $user->name;
			}
		}
		
		$userip = 'unknown'; // User IP
		if(isset($_SERVER) && isset($_SERVER['REMOTE_ADDR'])){
			$userip = $_SERVER['REMOTE_ADDR'];
		}
		
		if(is_array($var) || is_object($var)){
			$msg = (string) print_r($var, true);
		} else {
			$msg = (string) $var;
		}
		if($error){
			if(function_exists('\config\getTraceAsString')){
				$msg .= "\n".\config\getTraceAsString(new \Exception, 30);
			}
		} else {
			if(function_exists('\config\getTraceAsString')){
				//$msg .= "\n".\config\getTraceAsString(new \Exception, 30);
			}
		}

		$comment = (string)$comment;
		
		if(is_file($filename)){
			$path_parts = pathinfo($filename);
			$basename = $path_parts['basename'].' ('.$fileline.')';
		} else {
			$basename = 'undefined';
		}
		
		$msg = "
$comment =>
$basename | $dt | $userid | $username | $userip
-------------------------------------
$msg
-------------------------------------

";

		error_log($msg, 3, $fic);
	}

	/**
	 * Catch JS error message
	 * @example \libs\Watch::js();
	 * @static
	 * @return void
	 */
	public static function js(){
		$deezer = \Deezer::getInstance();
		$logPath = $deezer->getPath().'/logs/js';
		$dt = date("Y-m-d H:i:s (T)");

		$errmsg = \Deezer::getParam();
		if(isset($errmsg->param)){
			$errmsg = $errmsg->param;
		}

		$userid = 'unknown'; //User ID
		$username = 'unknown'; //User Name
		if($deezer->checkData('user') && $user = $deezer->getData('user')){
			if(isset($user->id)){
				$userid = $user->id;
			}
			if(isset($user->name)){
				$username = $user->name;
			}
		}
		
		$userip = 'unknown'; // User IP
		if(isset($_SERVER) && isset($_SERVER['REMOTE_ADDR'])){
			$userip = $_SERVER['REMOTE_ADDR'];
		}

		$uri = $_SERVER['REQUEST_URI'];
		$method = $_SERVER['REQUEST_METHOD'];
		
		$err  = "DATE: $dt\n";
		$err .= "USER: $userid / $username / $userip\n";
		$err .= "URI : [$method] $uri\n";
		$err .= "$errmsg\n\n\n";

$err = str_replace("\n","
",$err);

		$folder = new Folders;
		$folder->createPath($logPath, 0770);

		$fic = $logPath.'/logJS_'.date('ymd').'.txt';
		if(file_exists($fic)){
			if(filesize($fic)>1000000){ //Help to never get a file higher than 1MB, avoid to fulfill the server space in case of heavy bug
				if($fp = fopen($fic, 'r+')){ //We open the file in read/write, and place the cursor at the beginning
					@ftruncate($fp, 500000); //Cut the file in half (like that it keep all first alerts)
					fclose($fp); //CLose the file
				}
			}
		}

		error_log($err, 3, $fic);
	}

}
