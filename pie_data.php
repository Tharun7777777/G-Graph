<?php
include 'config.php';

$sql = "SELECT purpose AS category, SUM(amount) AS total FROM money GROUP BY purpose";
$result = $con->query($sql);

$data = [];

while ($row = $result->fetch_assoc()) {
    $data[] = $row;
}

header('Content-Type: application/json');
echo json_encode($data);

$con->close();
?>
