<?php

include_once(dirname(__FILE__).'/PathValidator.class.php');

// Load config file
if (!array_key_exists('irc-logviewer-config', $GLOBALS))
	$GLOBALS['irc-logviewer-config'] = parse_ini_file("config.ini", true);

class ListMonthLogs {

	public function getList($server, $channel, $date) {

		$monthlogs = array();
		$baseLogDir = $GLOBALS['irc-logviewer-config']['irc-logviewer']['irc_log_dir'];
		$datestring = date('Y-m-d', strtotime($date));
		list($year, $month) = explode('-', $datestring);
                //list($year, $month) = explode('-', $date);
		
		// This will throw an exception if the $server or $channel names are not valid
		PathValidator::validateChannelLogDir($baseLogDir, $server, $channel);

		// Loop through each file in the log directory and look for matches using searchInFile()
		// If a match is found a SearchResult object will be pushed into $this->searchResults
		$logDir = $baseLogDir."/".addslashes($server)."/".addslashes($channel);

		$pathToFile = "";
		$dirHandle = opendir($logDir);
		$i = 0;
		$gotten = false;
		$dirHandle = opendir($logDir);
		$i = 0;
		while(($filename = readdir($dirHandle)) !== false) {
                    if (is_file($logDir."/".$filename)) { // Only open files	                            
                        $dateFromFilename = preg_replace('/^(.*)(\d{4})(.*?)(\d{2})(.*?)(\d{2}?)(.*?)$/', "$2-$4-$6", $filename);
                        if (substr_compare($datestring,$dateFromFilename,0,7)==0) {
                            	if (array_key_exists($dateFromFilename, $monthlogs))
                                	$monthlogs[$dateFromFilename] .= $filename;
                            	else
                                	$monthlogs[$dateFromFilename] = $filename;
				$gotten = true;
                        }
                    }		
		}
		closedir($dirHandle);		
		if (!$gotten)
			throw new Exception("NONE GOTTEN [".$date."]");
		/*
		$files = glob($logDir."/*$year?$month?[0123][0-9]*");		
		foreach($files as $filename) {
                            throw new Exception("Files ".$files." Files Files");
			if (is_file($filename)) { // Only open files
				// Get the day from the filename (this is why filenames must have the date
				// in them, in the e.g. "mylog_YYYY-MM-DD.log" or "mylogYYYYMMDD.txt", etc..
				$dateFromFilename = preg_replace('/^(.*)(\d{4})(.*?)(\d{2})(.*?)(\d{2}?)(.*?)$/', "$2-$4-$6", $filename);
				$monthlogs[$dateFromFilename] = filesize($filename);
			}
		}
		*/

		return $monthlogs;
	}
}

?>
