<?php
/**
 * @author Bruno Martin <brunomartin@gmail.com>
 */

error_reporting(0); //Disable error message to avoid it to be sent to the client side
session_start();
$path = dirname(__FILE__);
require_once $path.'/config/Autoload.php';
require_once $path.'/config/Database.php';
require_once $path.'/deezer.php';
require_once $path.'/config/Error.php';

$deezer = \Deezer::getInstance();

//Change language, teh default is English
$param = \Deezer::getParam();
if(isset($param->lang)){
	$_SESSION['language'] = $deezer->setLanguage($param->lang); 
} else if(isset($_SESSION['language'])){
	$_SESSION['language'] = $deezer->setLanguage($_SESSION['language']);
}

$deezer->loadBundles(array('web', 'communication'));
$deezer->launch();
