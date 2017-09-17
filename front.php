<?php
/**
 * @author Bruno Martin <brunomartin@gmail.com>
 */

/*
	SETUP INFORMATION:

	1) This is the entry point of apache server, make sure that it is specified in nginx configuration file properly
	   This structure avoid to have duplication of liraries for Front and Back, any update can be reflected in both immediatly.
	   The code can be accessible remotly via GlusterFS (or similar), 
>		fastcgi_index  front.php;

	2) Make sure that some folders does have permission for apache to work in it.
	   Here are some commands to execute before to launch the appalication:
		# cd /{path to this directory}
		# sh permission root

	3) The application has been developed and tested on the following system (LNMP):
		CentOS 6.9 (64bit)
		nginx 1.10.2
		MariaDB Server 10.2.6
		Server API FPM/FastCGI
		PHP 7.0.20
		PHP Modules
			bcmath bz2 calendar Core ctype curl date dba dom enchant exif fileinfo filter ftp gd geoip gettext hash iconv igbinary imagick imap interbase intl json json_post ldap libxml maxminddb mbstring mcrypt memcache memcached mongodb msgpack mysqli mysqlnd OAuth openssl pcntl pcre PDFlib PDO PDO_Firebird pdo_mysql pdo_sqlite Phar pinyin posix pspell readline recode Reflection session shmop SimpleXML snmp soap sockets SPL sqlite3 ssh2 standard sysvmsg sysvsem sysvshm tidy tokenizer uploadprogress wddx xdebug xdiff xml xmlreader xmlrpc xmlwriter xsl Zend OPcache zip zlib Xdebug Zend OPcache

	4) It's accessible via:
		Note: The domain is not registered, and it's using a SSL self-certificate.
		IP (CN): 120.234.18.50
>		hostname: deezer.bru
>		port: 80/443

	5) Because the domain is not registered, make sure the host file on the host machine is pointing to the correct IP.
	
	6) To test the application, you can visit one of this page
>		https://deezer.bru

*/

error_reporting(0); //Disable error message to avoid it to be sent to the client side
$path = dirname(__FILE__);
require_once $path.'/config/Autoload.php';
require_once $path.'/config/Database.php';
require_once $path.'/deezer.php';
require_once $path.'/config/Error.php';

$deezer = \Deezer::getInstance();
//$deezer->setLanguage('fr'); //Default is English
$deezer->loadBundles(array('web'));
$deezer->launch();
