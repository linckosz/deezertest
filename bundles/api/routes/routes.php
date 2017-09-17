<?php
/**
 * @author Bruno Martin <brunomartin@gmail.com>
 */

namespace bundles\api\routes;

$deezer = \Deezer::getInstance();

//For debugging
$deezer->setRoutePost('/test', '\bundles\api\controllers\ControllerTest', 'test');

//Data manager
/**
 * Instead of using a HTTP request per single operation,
 * Here we  can regroup multiple CRUD operations on multiple objects in one HHTP request.
 * This methods help to reduce the bandwith usage as long as the CPU consumption on backend
 */
$deezer->setRoutePost('/data', '\bundles\api\controllers\ControllerData', 'data');

//Grab all songs from user's favorite playlist
$deezer->setRoutePost('/playlist/favoritesongs', '\bundles\api\controllers\ControllerPlaylist', 'favoriteSongs');

//Grab all songs from a playlist
$deezer->setRoutePost('/playlist/songs', '\bundles\api\controllers\ControllerPlaylist', 'songs');
