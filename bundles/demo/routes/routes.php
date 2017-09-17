<?php
/**
 * @author Bruno Martin <brunomartin@gmail.com>
 */

namespace bundles\demo\routes;

$deezer = \Deezer::getInstance();

//For demo
$deezer->setRouteGET('/', '\bundles\demo\controllers\ControllerDemo', 'demo');

