<?php
/**
 * @author Bruno Martin <brunomartin@gmail.com>
 */

namespace libs;

/**
 * Application output
 */
class Render {

	/**
	 * Output parameters
	 * @access protected
	 */
	protected $info = array(
		'msg' => '',
		'error' => false,
		'status' => 200,
		'http' => true, //At false, we force to use a 200 HTTP code, it can give more flexibility in reponse handling on Front
	);

	/**
	 * Constructor
	 * @param string $msg String information
	 * @param mixed $data Data t send back to the client
	 * @param boolean $error Precise if it's an error
	 * @param integer $status HTTPS status code
	 * @param boolean $http At true, we use a real HTTP status response
	 * @return void
	 */
	public function __construct($msg, $data=null, $error=false, $status=200, $http=true){
		$this->info['msg'] = $msg;
		$this->info['data'] = $data;
		$this->info['error'] = (bool) $error;
		$this->info['status'] = intval($status);
		$this->info['http'] = (bool) $http;
	}

	/**
	 * Render the page with the appropriate header
	 * @param boolean|string $format We tell in which format the page must be displayed
	 * @return mixed String output
	 */
	public function render($format=false){
		ob_clean();

		if($this->info['http']){
			http_response_code($this->info['status']);
		} else {
			http_response_code(200);
		}
		
		if($format=='json'){
			header('Content-type: application/json; charset=UTF-8');
			echo json_encode($this->info, JSON_UNESCAPED_UNICODE);
		} else if($format=='html'){
			header('Content-type: text/html; charset=UTF-8');
			print_r($this->info['msg']);
		} else {
			//Default is plain/text
			header('Content-type: text/plain; charset=UTF-8');
			print_r($this->info['msg']);
		}
		
		return exit(0);
	}
	
}
