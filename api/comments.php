<?php
/**
 * API Buku Tamu — Jurnal Arif & Arum
 * GET  → daftar komentar (JSON)
 * POST → action: add | like | delete
 * Penyimpanan sederhana: file JSON di ../data/comments.json
 */
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-store');

$dataFile = __DIR__ . '/../data/comments.json';
$dataDir  = __DIR__ . '/../data';

if (!is_dir($dataDir)) { @mkdir($dataDir, 0755, true); }
if (!file_exists($dataFile)) { @file_put_contents($dataFile, '[]'); }

function respond(array $payload, int $code = 200): void {
    http_response_code($code);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function readComments(): array {
    global $dataFile;
    $raw = @file_get_contents($dataFile);
    $data = json_decode($raw ?: '[]', true);
    return is_array($data) ? $data : [];
}

function writeComments(array $comments): bool {
    global $dataFile;
    $fp = fopen($dataFile, 'c+');
    if (!$fp) return false;
    flock($fp, LOCK_EX);
    ftruncate($fp, 0);
    rewind($fp);
    fwrite($fp, json_encode(array_values($comments), JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
    fflush($fp);
    flock($fp, LOCK_UN);
    fclose($fp);
    return true;
}

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

/* ---------- GET: list ---------- */
if ($method === 'GET') {
    $comments = readComments();
    usort($comments, fn($a, $b) => strcmp($b['time'] ?? '', $a['time'] ?? ''));
    respond(['ok' => true, 'comments' => $comments]);
}

/* ---------- POST: add / like / delete ---------- */
if ($method !== 'POST') {
    respond(['ok' => false, 'error' => 'Method not allowed'], 405);
}

$rawInput = file_get_contents('php://input');
$input = json_decode($rawInput ?: '{}', true);
if (!is_array($input)) {
    respond(['ok' => false, 'error' => 'Body harus JSON'], 400);
}
$action = $input['action'] ?? 'add';
$comments = readComments();

if ($action === 'add') {
    $name = trim((string)($input['name'] ?? ''));
    $message = trim((string)($input['message'] ?? ''));

    $name = mb_substr(strip_tags($name), 0, 40);
    $message = mb_substr(strip_tags($message), 0, 280);

    if (mb_strlen($name) < 2 || mb_strlen($message) < 4) {
        respond(['ok' => false, 'error' => 'Nama min 2 huruf, pesan min 4 huruf'], 422);
    }

    $comment = [
        'id'      => uniqid('c-', true),
        'name'    => $name,
        'message' => $message,
        'time'    => (new DateTime('now', new DateTimeZone('Asia/Jakarta')))->format(DateTime::ATOM),
        'likes'   => 0,
    ];
    $comments[] = $comment;
    if (count($comments) > 200) { $comments = array_slice($comments, -200); } // cap penyimpanan
    writeComments($comments);
    respond(['ok' => true, 'comment' => $comment], 201);
}

if ($action === 'like') {
    $id = (string)($input['id'] ?? '');
    $found = false;
    foreach ($comments as &$c) {
        if (isset($c['id']) && (string)$c['id'] === $id) { $c['likes'] = (int)($c['likes'] ?? 0) + 1; $found = true; break; }
    }
    unset($c);
    if (!$found) respond(['ok' => false, 'error' => 'Komentar tidak ditemukan'], 404);
    writeComments($comments);
    respond(['ok' => true]);
}

if ($action === 'delete') {
    $id = (string)($input['id'] ?? '');
    $before = count($comments);
    $comments = array_values(array_filter($comments, fn($c) => (string)($c['id'] ?? '') !== $id));
    if (count($comments) === $before) respond(['ok' => false, 'error' => 'Komentar tidak ditemukan'], 404);
    writeComments($comments);
    respond(['ok' => true]);
}

respond(['ok' => false, 'error' => 'Action tidak dikenal'], 400);
