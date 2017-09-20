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
//$deezer->setLanguage('fr'); //Default is English
$deezer->loadBundles(array('web', 'communication'));
$deezer->launch();
