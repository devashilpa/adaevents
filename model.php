<?php
header('Content-Type: application/json; charset=utf-8');

$to = 'your-email@example.com';
$from = 'no-reply@example.com';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Submit the model form using the website.']);
    exit;
}

$name = trim($_POST['name'] ?? '');
$age = trim($_POST['age'] ?? '');
$gender = trim($_POST['gender'] ?? '');
$phone = trim($_POST['phone'] ?? '');
$email = trim($_POST['email'] ?? '');
$city = trim($_POST['city'] ?? '');
$height = trim($_POST['height'] ?? '');
$level = trim($_POST['level'] ?? '');
$instagram = trim($_POST['instagram'] ?? '');
$experience = trim($_POST['experience'] ?? '');
$message = trim($_POST['message'] ?? '');

if ($name === '' || $phone === '' || $city === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(422);
    echo json_encode(['success' => false, 'message' => 'Please complete the required fields with a valid email address.']);
    exit;
}

$subject = 'ADA Fashion Event — Model Registration';
$body = "Name: $name\nAge: $age\nGender: $gender\nPhone: $phone\nEmail: $email\nCity: $city\nHeight: $height\nExperience level: $level\nInstagram: $instagram\nPrevious ramp walk experience: $experience\n\nMessage:\n$message";
$headers = "From: ADA Fashion Event <$from>\r\n";
$headers .= "Reply-To: $email\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8";

if (mail($to, $subject, $body, $headers)) {
    echo json_encode(['success' => true, 'message' => 'Thank you. Your model registration has been sent.']);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Email could not be sent. Please try again later.']);
}
