<?php
// sync_db.php - The Artisan Database Driver
$json = file_get_contents('php://input');
if ($json && json_decode($json)) {
    file_put_contents('database.json', $json);
    header('Content-Type: application/json');
    echo json_encode(['status' => 'synchronized']);
} else {
    http_response_code(400);
}
?>
