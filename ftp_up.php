<?php
$ftp = ftp_connect(gethostbyname('ftpupload.net'), 21, 30);
ftp_login($ftp, 'ezyro_42298504', 'ca9fd3c22faca');
ftp_pasv($ftp, false);
ftp_put($ftp, 'karpin-posyandu.unaux.com/htdocs/api-proxy.php', 'C:\xampp\htdocs\karpin\public\api-proxy.php', FTP_BINARY);
ftp_close($ftp);
echo "OK";
