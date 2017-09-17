<?php
/**
 * @author Bruno Martin <brunomartin@gmail.com>
 */

namespace config;

/**
 * Autoload a Class, the namespace must respect the directory tree
 * @return void
 */
function my_autoload($ClassName){
	$path = dirname(__FILE__).'/..';
	$ClassName = str_replace('\\', '/', $ClassName);
	if(file_exists($path.'/'.$ClassName.'.php')){
		include_once($path.'/'.$ClassName.'.php');
	}
}

//Start the spl autoload
spl_autoload_register('\config\my_autoload');

