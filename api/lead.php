<?php
require __DIR__ . '/lib.php';
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') json_out(405, ['error' => 'method']);
if (rate_limited('l', 10)) json_out(429, ['error' => 'limit']);

$raw = file_get_contents('php://input', false, null, 0, 10001);
if ($raw === false || strlen($raw) > 10000) json_out(413, ['error' => 'big']);
$d = json_decode($raw, true);
if (!is_array($d)) json_out(400, ['error' => 'bad']);

if (!empty($d['website'])) json_out(200, ['ok' => true]);   // пастка для ботів: мовчки ігноруємо

// Капчу вимкнено. Щоб увімкнути: у config.php поставте 'captcha' => true (і поверніть поле капчі у форму).
if (!empty($CFG['captcha']) && !check_captcha($d['token'] ?? '', $d['captcha'] ?? '')) json_out(400, ['error' => 'captcha']);

$name  = mb_substr(trim((string)($d['name'] ?? '')), 0, 100);
$phone = mb_substr(trim((string)($d['phone'] ?? '')), 0, 30);
$msg   = mb_substr(trim((string)($d['message'] ?? '')), 0, 1000);
if ($name === '' || strlen(preg_replace('/\D/', '', $phone)) < 10) json_out(400, ['error' => 'fields']);

function h($s) { return htmlspecialchars($s, ENT_NOQUOTES, 'UTF-8'); }
$text = "🔔 <b>Нова заявка з сайту AGROSTEEL</b>\n\n"
      . "👤 <b>Ім'я:</b> " . h($name) . "\n"
      . "📞 <b>Телефон:</b> " . h($phone) . "\n"
      . "💬 <b>Що потрібно:</b> " . h($msg !== '' ? $msg : '—') . "\n\n"
      . "🕒 " . date('d.m.Y H:i');

$url = 'https://api.telegram.org/bot' . $CFG['bot_token'] . '/sendMessage';
$post = json_encode(['chat_id' => $CFG['chat_id'], 'text' => $text, 'parse_mode' => 'HTML', 'disable_web_page_preview' => true], JSON_UNESCAPED_UNICODE);
$ok = false; $err = '';
if (function_exists('curl_init')) {
    $ch = curl_init($url);
    curl_setopt_array($ch, [CURLOPT_POST => true, CURLOPT_POSTFIELDS => $post, CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
        CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 10, CURLOPT_CONNECTTIMEOUT => 5]);
    $resp = curl_exec($ch);
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $err = curl_error($ch);
    curl_close($ch);
    $ok = ($resp !== false && $code === 200);
    if (!$ok) $err .= ' HTTP ' . $code . ' ' . substr((string)$resp, 0, 200);
} else {
    $ctx = stream_context_create(['http' => ['method' => 'POST', 'header' => "Content-Type: application/json\r\n", 'content' => $post, 'timeout' => 10, 'ignore_errors' => true]]);
    $resp = @file_get_contents($url, false, $ctx);
    $ok = ($resp !== false && strpos($resp, '"ok":true') !== false);
    if (!$ok) $err = substr((string)$resp, 0, 200);
}
if (!$ok) {
    @file_put_contents(data_dir() . '/error.log', date('c') . ' ' . $err . "\n", FILE_APPEND);   // токен у лог не пишеться
    json_out(502, ['error' => 'telegram']);
}
json_out(200, ['ok' => true]);
