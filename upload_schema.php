<?php
$host = 'ftpupload.net';
$ip = gethostbyname($host);
$ftp = @ftp_connect($ip, 21, 15);
if (!$ftp) { echo "FAIL\n"; exit(1); }
ftp_login($ftp, 'ezyro_42298504', 'ca9fd3c22faca');
ftp_pasv($ftp, false);
$put = @ftp_put($ftp, 'htdocs/check_schema.php', 'C:\xampp\htdocs\karpin\public\check_schema.php', FTP_BINARY);
echo $put ? "OK\n" : "FAIL\n";
ftp_close($ftp);
