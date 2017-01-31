<?php

ini_set('display_errors','0');
ini_set('log_errors','1');

include_once('../lib/ListMonthLogs.class.php');

$server = $_REQUEST['server'];
$channel = $_REQUEST['channel'];
$date = $_REQUEST['date'];

if (get_magic_quotes_gpc()) {
	$server = stripslashes($server);
	$channel = stripslashes($channel);
	$date = stripslashes($date);
}

$dates = ListMonthLogs::getList($server, $channel, $date);

echo json_encode($dates);

?>
