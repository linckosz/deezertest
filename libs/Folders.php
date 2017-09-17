<?php
/**
 * @author Bruno Martin <brunomartin@gmail.com>
 */

namespace libs;

/**
 * 
 */
class Folders {

	/**
	 * The absolute Path
	 * @access protected
	 */
	protected $folder = false;

	/**
	 * Constructor
	 * @return void
	 */
	public function __construct($folder = false){
		$this->setPath($folder);
	}

	/**
	 * Return the Path string
	 * @return string
	 */
	public function getPath(){
		return $this->folder;
	}

	/**
	 * Check if the directory exists
	 * @access protected
	 * @return boolean
	 */
	protected function checkPath($folder){
		if(!is_dir($folder)){
			return false;
		}
		return true;
	}

	/**
	 * Set the Path
	 * @return boolean
	 */
	public function setPath($folder){
		$this->folder = false;
		if($this->checkPath($folder)){
			$this->folder = $folder;
			return true;
		}
		return false;
	}

	/**
	 * Set teh CHMOD of the directory
	 * @return boolean
	 */
	public function setCHMOD($chmod = 0750){
		if($this->folder !== false){
			if($this->checkPath($this->folder)){
				return chmod($this->folder, $chmod);
			}
		}
		return false;
	}

	/**
	 * Includes into PHP code all '*.php' files in the directory
	 * @access protected
	 * @return boolean
	 */
	protected function includeFiles($folder){
		if($this->checkPath($folder)){
			$files = glob($folder.'/*');
			if (is_array($files) && count($files) > 0) {
				foreach($files as $file) {
					if(is_dir($file)){
						$this->includeFiles($file);
					} else {
						if(preg_match("/.+\.php\b/ui", $file)){
							include_once($file);
						}
					}
				}
			}
		}
		return true;
	}

	/**
	 * Return the list of all files in teh directory
	 * @return array
	 */
	public function loopFolder($fullpath=false){
		$list = array();
		if($this->folder !== false){
			if($this->checkPath($this->folder)){
				$files = glob($this->folder.'/*');
				if (is_array($files) && count($files) > 0) {
					foreach($files as $file) {
						if(!is_dir($file)){
							if($fullpath){
								$list[] = $file;
							} else {
								$list[] = basename($file);
							}
						}
					}
				}
			}
		}
		return $list;
	}	

	/**
	 * Includes into PHP code all '*.php' files in the directory, and its subdirectories
	 * @return boolean
	 */
	public function includeRecursive(){
		if($this->folder !== false){
			return $this->includeFiles($this->folder);
		}
		return false;
	}

	/**
	 * Create the directory if it does not exits
	 * @return boolean
	 */
	public function createPath($folder, $chmod=0755){
		$this->folder = false;
		if(!is_dir($folder)){
			if(mkdir($folder, $chmod, true)){
				return $this->setPath($folder);
			}
		}
		return $this->setPath($folder);
	}

	/**
	 * Create a symlink if it does not exist
	 * @return boolean
	 */
	public function createSymlink($target, $link){
		if(!is_dir($link)){
			if($this->createPath($link)){ //Create recursive path
				if(rmdir($link)){ //Remove last directory to then build it as a symlink
					if(symlink($target, $link)){
						return $this->setPath($link);
					}
				}
			}
		}
		return false;
	}

}
