<?php
/**
 * @author Bruno Martin <brunomartin@gmail.com>
 */

namespace bundles\communication\routes;

$deezer = \Deezer::getInstance();

//For debugging
$deezer->setRoutePost('/debug/js', '\bundles\communication\controllers\ControllerDebug', 'js');
