<?php
header('Content-Type: application/json');
include 'config.php';

$query = "SELECT DATE(time) AS date, SUM(amount) AS total 
          FROM money
          WHERE MONTH(time) = MONTH(CURDATE()) AND YEAR(time) = YEAR(CURDATE()) 
          GROUP BY DATE(time)";

$result = $con->query($query);
$data = [];

while ($row = $result->fetch_assoc()) {
    $data[] = [
        'date' => $row['date'],
        'total' => $row['total']
    ];
}

echo json_encode($data);
?>
