<?php
/**
 * @author Bruno Martin <brunomartin@gmail.com>
 */

namespace config;

use \libs\Folder;
use \libs\Render;

/**
 * Grab any PHP error and store it into a file for debugging purpose
 * @param integer $errno Error code
 * @param string $errmsg Error message
 * @param string $filename Filename where the error happened
 * @param string $linenum Line where the error happened
 * @param string $vars Error details (traceability)
 * @param string $type Error type
 * @return void
 */
function userErrorHandler($errno, $errmsg, $filename, $linenum, $vars, $type='UNK'){
	if(!empty($errmsg)){
		$deezer = \Deezer::getInstance();
		$logPath = $deezer->getPath().'/logs/php';
		$dt = date("Y-m-d H:i:s (T)");
		$infos = $_SERVER['HTTP_USER_AGENT'];
		$errortype = array(
			E_WARNING            => 'Warning',
			E_NOTICE             => 'Notice',
			E_USER_ERROR         => 'User Error',
			E_USER_WARNING       => 'User Warning',
			E_USER_NOTICE        => 'User Notice',
			E_STRICT             => 'Runtime Notice',
			E_RECOVERABLE_ERROR  => 'Catchable Fatal Error',
			//The list below is not captures by this function
			E_ERROR              => 'Error',
			E_PARSE              => 'Parsing Error',
			E_CORE_ERROR         => 'Core Error',
			E_CORE_WARNING       => 'Core Warning',
			E_COMPILE_ERROR      => 'Compile Error',
			E_COMPILE_WARNING    => 'Compile Warning',
			1     => 'Error',
			2     => 'Warning',
			4     => 'Parsing Error',
			8     => 'Notice',
			16    => 'Core Error',
			32    => 'Core Warning',
			64    => 'Compile Error',
			128   => 'Compile Warning',
			256   => 'User Error',
			512   => 'User Warning',
			1024  => 'User Notice',
			2048  => 'Runtime Notice',
			4096  => 'Catchable Fatal Error',
			8192  => 'Depreciated',
			16384 => 'User Depreciated',
			32767 => 'All'
		);
		
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

		$var = null;
		if(is_array($vars) || is_object($vars)){
			//$var = (string) print_r($vars, true);
		} else {
			$var = (string) $vars;
		}
		
		$uri = $_SERVER['REQUEST_URI'];
		$method = $_SERVER['REQUEST_METHOD'];
		
		$err  = "DATE: $dt\n";
		$err .= "USER: $userid / $username / $userip\n";
		$err .= "BROW: $infos\n";
		$err .= "LINE: $linenum\n";
		$err .= "FILE: $filename\n";
		$err .= "URI : [$method] $uri\n";
		$err .= "MSG : $type: $errortype[$errno] => $errmsg\n";
		$err .= "DBT : $var\n\n\n";

$err = str_replace("\n","
",$err);

		$folder = new Folder;
		$folder->createPath($logPath, 0770);

		$fic = $logPath.'/logPHP_'.date('ymd').'.txt';
		if(file_exists($fic)){
			if(filesize($fic)>1000000){ //Help to never get a file higher than 1MB, avoid to fulfill the server space in case of heavy bug
				if($fp = fopen($fic, 'r+')){ //We open the file in read/write, and place the cursor at the beginning
					@ftruncate($fp, 500000); //Cut the file in half (like that it keep all first alerts)
					fclose($fp); //CLose the file
				}
			}
		}

		error_log($err, 3, $fic);

		//No need to stop the code for some alerts
		if(!in_array($errno, array(
			E_WARNING,
			E_NOTICE,
			E_USER_WARNING,
			E_USER_NOTICE
		))){
			sendMsg();
		}
	}
}

/**
 * Overwrite the shutdownHandler callback
 * @return void
 */
function shutdownHandler(){
	$lasterror = error_get_last();
	$exception = new \Exception();
	$dbt = getTraceAsString($exception, 10);
	userErrorHandler($lasterror['type'], $lasterror['message'], $lasterror['file'], $lasterror['line'], $dbt, 'SDH');
}

/**
 * Overwrite the exceptionHandler callback
 * @param Exception $exception Exception catched
 * @return void
 */
function exceptionHandler(\Throwable $exception) {
	$dbt = getTraceAsString($exception, 10);
	userErrorHandler(E_ERROR, 'Exception: '.$exception->getMessage(), $exception->getFile(), $exception->getLine(), $dbt, 'EXH');
}

/**
 * Inform the client about a PHP error
 * @return mixed JSON string output
 */
function sendMsg(){
	$deezer = \Deezer::getInstance();
	$msg = $deezer->getTranslation(2); //An error has occurred while processing your request, the Deezer team has been notified of the problem.
	return (new Render($msg, null, true, 422))->render('json');
}

/**
 * Get the traceability at the request moment
 * http://php.net/manual/fr/function.debug-backtrace.php
 * @example $trace = \config\getTraceAsString(new \Exception, 30);
 * @param Exception $e Exception catched
 * @param integer $count Number of trcaeable rows we want to display
 * @return string
 */
function getTraceAsString($e, $count=0){
	$trace = explode("\n", $e->getTraceAsString());
	array_shift($trace); // remove call to this method
	array_pop($trace); // remove {main}
	$length = count($trace);
	if($count > $length){ $count = $length; } //Get maximum of information
	$result = array();
	for ($i = 0; $i < $count; $i++){
		$result[] = ($i + 1)  . ')' . substr($trace[$i], strpos($trace[$i], ' ')); // replace '#someNum' with '$i)', set the right ordering
	}
	return "Debug backtrace on $count lines\n\t" . implode("\n\t", $result);
}

//Start PHP error monitoring
set_error_handler('\config\userErrorHandler');
register_shutdown_function('\config\shutdownHandler');
set_exception_handler('\config\exceptionHandler');

//Enable debugging messages
error_reporting(1);
