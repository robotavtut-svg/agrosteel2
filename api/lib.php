<?php
// Спільні функції: капча, ліміти, відповіді.
const CAPTCHA_TTL = 300;               // капча діє 5 хвилин
const CAPTCHA_ALPHA = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

$CFG = require __DIR__ . '/config.php';
date_default_timezone_set('Europe/Kyiv');

function data_dir() {
    $d = __DIR__ . '/data';
    if (!is_dir($d)) { @mkdir($d, 0750, true); }
    return $d;
}
function json_out($code, $arr) {
    http_response_code($code);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    echo json_encode($arr, JSON_UNESCAPED_UNICODE);
    exit;
}
function b64u($s) { return rtrim(strtr(base64_encode($s), '+/', '-_'), '='); }
function b64u_dec($s) { return base64_decode(strtr($s, '-_', '+/')); }
function sign($s) { global $CFG; return b64u(hash_hmac('sha256', $s, $CFG['secret'] . $CFG['bot_token'], true)); }

function client_ip() { return $_SERVER['REMOTE_ADDR'] ?? '?'; }

// Ліміт запитів з однієї адреси за 10 хвилин
function rate_limited($key, $max) {
    $f = data_dir() . '/rl_' . md5($key . client_ip());
    $fh = @fopen($f, 'c+');
    if (!$fh) return false;
    flock($fh, LOCK_EX);
    $now = time();
    $arr = json_decode(stream_get_contents($fh), true);
    if (!is_array($arr)) $arr = [];
    $arr = array_values(array_filter($arr, function ($t) use ($now) { return $t > $now - 600; }));
    $arr[] = $now;
    ftruncate($fh, 0); rewind($fh); fwrite($fh, json_encode($arr));
    flock($fh, LOCK_UN); fclose($fh);
    return count($arr) > $max;
}

// Прибирання старих службових файлів (іноді)
function cleanup() {
    if (random_int(1, 20) !== 1) return;
    foreach (glob(data_dir() . '/{used_*,rl_*}', GLOB_BRACE) ?: [] as $f) {
        if (@filemtime($f) < time() - 700) @unlink($f);
    }
}

// Нова капча: щоразу випадкові символи й спотворення. Відповідь лежить лише в підписаному токені (у вигляді хешу).
function make_captcha() {
    cleanup();
    $text = '';
    for ($i = 0; $i < 5; $i++) $text .= CAPTCHA_ALPHA[random_int(0, strlen(CAPTCHA_ALPHA) - 1)];
    $exp = time() + CAPTCHA_TTL;
    $nonce = bin2hex(random_bytes(8));
    $payload = b64u(json_encode(['e' => $exp, 'n' => $nonce, 'h' => sign($text . '|' . $nonce . '|' . $exp)]));
    $token = $payload . '.' . sign($payload);

    $g = '';
    for ($i = 0; $i < 7; $i++) {
        $g .= sprintf('<path d="M%d %d Q%d %d %d %d" stroke="hsl(%d,40%%,45%%)" stroke-width="%d" fill="none"/>',
            random_int(0, 180), random_int(0, 60), random_int(0, 180), random_int(0, 60), random_int(0, 180), random_int(0, 60), random_int(0, 359), random_int(1, 2));
    }
    for ($i = 0; $i < 25; $i++) {
        $g .= sprintf('<circle cx="%d" cy="%d" r="%d" fill="hsl(%d,40%%,50%%)"/>', random_int(0, 180), random_int(0, 60), random_int(1, 2), random_int(0, 359));
    }
    $t = '';
    for ($i = 0; $i < 5; $i++) {
        $t .= sprintf('<text x="%d" y="%d" font-family="Arial,sans-serif" font-size="%d" font-weight="700" fill="hsl(%d,55%%,28%%)" transform="rotate(%d %d 32)">%s</text>',
            14 + $i * 32 + random_int(0, 5), 40 + random_int(0, 9), 30 + random_int(0, 7), random_int(0, 359), random_int(-20, 20), 24 + $i * 32, $text[$i]);
    }
    $svg = '<svg xmlns="http://www.w3.org/2000/svg" width="180" height="60" viewBox="0 0 180 60"><rect width="180" height="60" fill="#eef1f3"/>' . $g . $t . '</svg>';
    return ['token' => $token, 'image' => 'data:image/svg+xml;base64,' . base64_encode($svg)];
}

// Перевірка: підпис, термін, одноразовість, відповідь
function check_captcha($token, $answer) {
    $parts = explode('.', (string)$token);
    if (count($parts) !== 2) return false;
    list($payload, $sig) = $parts;
    if (!hash_equals(sign($payload), $sig)) return false;
    $d = json_decode(b64u_dec($payload), true);
    if (!is_array($d) || !isset($d['e'], $d['n'], $d['h'])) return false;
    if (time() > (int)$d['e'] || !preg_match('/^[0-9a-f]{16}$/', $d['n'])) return false;
    // одноразовий токен: друга спроба з ним недійсна
    $fh = @fopen(data_dir() . '/used_' . $d['n'], 'x');
    if (!$fh) return false;
    fclose($fh);
    $a = strtoupper(trim((string)$answer));
    return hash_equals($d['h'], sign($a . '|' . $d['n'] . '|' . $d['e']));
}
