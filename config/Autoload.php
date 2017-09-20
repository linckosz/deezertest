<?php
/**
 * @author Bruno Martin <brunomartin@gmail.com>
 */

namespace config;

/**
 * Autoload a Class, the namespace must respect the directory tree
 * @param string $name Name of the Class
 * @return void
 */
function my_autoload($name){
	$path = dirname(__FILE__).'/..';
	$name = str_replace('\\', '/', $name);
	if(file_exists($path.'/'.$name.'.php')){
		include_once($path.'/'.$name.'.php');
	}
}

//Start the spl autoload
spl_autoload_register('\config\my_autoload');

