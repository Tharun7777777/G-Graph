<?php
include 'config.php';

header('Content-Type: application/json');

$currentMonth = date('m');
$currentYear = date('Y');

$startDate = date("$currentYear-$currentMonth-01");
$endDate = date("Y-m-t", strtotime($startDate)); // Last day of month

// Initialize array for all days
$dates = [];
$period = new DatePeriod(
    new DateTime($startDate),
    new DateInterval('P1D'),
    new DateTime(date('Y-m-d', strtotime($endDate . ' +1 day')))
);

foreach ($period as $date) {
    $dates[$date->format('Y-m-d')] = 0;
}

// Fetch actual spending
$sql = "SELECT DATE(time) as date, SUM(amount) as total FROM money 
        WHERE time BETWEEN '$startDate' AND '$endDate'
        GROUP BY DATE(time)";

$result = $con->query($sql);

while($row = $result->fetch_assoc()) {
    $dates[$row['date']] = (float)$row['total'];
}

// Prepare final output
$output = [];
foreach ($dates as $date => $total) {
    $output[] = [
        'date' => $date,
        'total' => $total
    ];
}

echo json_encode($output);
?>
