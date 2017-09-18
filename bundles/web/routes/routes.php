<?php
/**
 * @author Bruno Martin <brunomartin@gmail.com>
 */

namespace bundles\web\routes;

$deezer = \Deezer::getInstance();

//For SDK JS demo page
$deezer->setRouteGET('/', '\bundles\web\controllers\ControllerWeb', 'web');

//The channel file
$deezer->setRouteGET('/channel.html', '\bundles\web\controllers\ControllerWeb', 'channel');

//Get dynamic translation for Javascript
$deezer->setRouteGET('/translation/web.js', '\bundles\web\controllers\ControllerWeb', 'translation');
