<?php
header('Content-Type: application/json; charset=utf-8');

$to = 'your-email@example.com';
$from = 'no-reply@example.com';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Submit the contact form using the website.']);
    exit;
}

$name = trim($_POST['name'] ?? '');
$brand = trim($_POST['brand'] ?? '');
$phone = trim($_POST['phone'] ?? '');
$email = trim($_POST['email'] ?? '');
$type = trim($_POST['type'] ?? '');
$message = trim($_POST['message'] ?? '');

if ($name === '' || $phone === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(422);
    echo json_encode(['success' => false, 'message' => 'Please enter your name, phone number, and a valid email address.']);
    exit;
}

$subject = 'ADA Fashion Event — Contact Enquiry';
$body = "Name: $name\nBrand: $brand\nPhone: $phone\nEmail: $email\nEnquiry type: $type\n\nMessage:\n$message";
$headers = "From: ADA Fashion Event <$from>\r\n";
$headers .= "Reply-To: $email\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8";

if (mail($to, $subject, $body, $headers)) {
    echo json_encode(['success' => true, 'message' => 'Thank you. Your enquiry has been sent.']);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Email could not be sent. Please try again later.']);
}
