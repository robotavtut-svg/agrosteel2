<?php
require __DIR__ . '/lib.php';
if (rate_limited('c', 60)) json_out(429, ['error' => 'limit']);
json_out(200, make_captcha());
