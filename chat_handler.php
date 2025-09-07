<?php
include "config.php";
// --- CONFIGURATION FOR GOOGLE GENERATIVE AI ---

// Paste your actual Google Generative Language API Key here.
$apiKey = "AIzaSyA_ex68LduETbMJIQB9n8Os_jirEbcZiYU"; // <-- YOUR GOOGLE KEY GOES HERE

// The AI model to use. 'gemini-pro' is a great choice for chat.
$model = "gemini-1.5-flash";

// The API endpoint for Google's Generative AI
$apiUrl = "https://generativelanguage.googleapis.com/v1/models/{$model}:generateContent?key={$apiKey}";

// --- END OF CONFIGURATION ---


// Set the content type of the response to JSON
header('Content-Type: application/json');

// Get the user's message from the POST request
$json_data = file_get_contents('php://input');
$data = json_decode($json_data);


if (!isset($data->message) || empty(trim($data->message))) {
    echo json_encode(['error' => 'No message provided.']);
    exit;
}
$userMessage = $data->message;

// --- PREPARE THE API REQUEST FOR GOOGLE ---;

// Google's API has a different structure for the payload.
// It uses a 'contents' array with 'parts'.
// Fetch all transactions
$sql = "SELECT * FROM money ORDER BY time DESC";
$result = $con->query($sql);

$transactionSummary = "";

if ($result && $result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $transactionSummary .= "- ₹" . $row['amount'] . " on " . $row['time'] . " for " . $row['purpose'] . "\n";
    }
} else {
    $transactionSummary = "No transactions found.";
}

// Merge user input + full transaction history
$finalPrompt = "User's Question:\n" . $userMessage . "\n\n";
$finalPrompt .= "Full Transaction History:\n" . $transactionSummary . "\n\n";
$finalPrompt .= "Answer the user's question based on the full transaction history above.";

$payload = [
    'contents' => [
        [
            'role' => 'user',
            'parts' => [
                ['text' => $finalPrompt]
            ]
        ]
    ]
];


// The headers for the API request are simpler for Google, as the key is in the URL.
$headers = [
    'Content-Type: application/json'
];

// --- SEND THE REQUEST USING cURL ---
$ch = curl_init();

curl_setopt($ch, CURLOPT_URL, $apiUrl);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);

// Execute the request
$response = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curl_error = curl_error($ch);
curl_close($ch);

// --- HANDLE THE RESPONSE ---

if ($response === false) {
    // cURL error
    echo json_encode(['error' => 'cURL error: ' . $curl_error]);
} elseif ($http_code != 200) {
    // API returned an error
    echo json_encode(['error' => 'API Error: ' . $response, 'status_code' => $http_code]);
} else {
    // Success! Extract the bot's reply from Google's response format.
    $responseData = json_decode($response, true);
    
    // Google's response structure is different from OpenAI's.
    // We look for candidates -> content -> parts -> text
    if (isset($responseData['candidates'][0]['content']['parts'][0]['text'])) {
        $botMessage = $responseData['candidates'][0]['content']['parts'][0]['text'];
        echo json_encode(['reply' => $botMessage]);
    } else {
        // Handle cases where the API might have blocked the response (e.g., safety settings)
        // or another unexpected format.
        $errorMessage = 'Could not parse AI response.';
        if(isset($responseData['promptFeedback']['blockReason'])){
            $errorMessage .= ' Reason: ' . $responseData['promptFeedback']['blockReason'];
        }
        echo json_encode(['error' => $errorMessage, 'response_data' => $responseData]);
    }
}

?>