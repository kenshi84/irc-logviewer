<?php

// Search result object
class SearchResult {

	public $filename; // Name of logfile	
	public $date ; // Date log file relates to
	public $startTime; // Time of first mention of any keyword
	public $endTime; // Time of last mention of any keyword
	public $duration; // Duration between first timestamps (in seconds)	
	public $keywords = array(); // e.g. $keywords['example'] => 3; // Where 3 is the of lines they keyword "example" occured on
	public $keywordScore = 0; // For sorting. Assign higher rankings to better matches.	
	public $users = array(); // e.g. $users['joe'] => 5; // Where 5 is the number of lines a user contributed	
	
}

?>