#!/usr/bin/env node

/**
 * @fileoverview Email debug script for server testing
 * @description Tests email configuration and connection
 *
 * @module debug-email
 */

import { emailService } from "../services/emailService.js";
import { ENV, ENVIRONMENT } from "../config/environment.js";

console.log("Email Debug Test");
console.log("==================");
console.log(`Environment: ${ENVIRONMENT}`);
console.log(`Email Provider: ${ENV.EMAIL_PROVIDER}`);
console.log(`Email User: ${ENV.EMAIL_USER}`);
console.log(`Frontend URL: ${ENV.FRONTEND_URL}`);
console.log("");

console.log("EmailService Status:");
console.log(` Transporter exists: ${!!emailService.transporter}`);

if (emailService.transporter) {
  console.log(` Service: ${emailService.transporter.options?.service || "custom"}`);
  console.log(` Host: ${emailService.transporter.options?.host || "default"}`);
  console.log(` Port: ${emailService.transporter.options?.port || "default"}`);
  console.log(` Secure: ${emailService.transporter.options?.secure || false}`);
  console.log(` Auth User: ${emailService.transporter.options?.auth?.user || "not set"}`);
} else {
  console.log(" No transporter initialized!");
}

console.log("");
console.log("Testing SMTP Connection...");

try {
  const result = await emailService.testConnection();
  console.log("Connection Test Result:", result);

  if (result.success) {
    console.log("");
    console.log("Testing actual email send...");

    // Send test email
    const testResult = await emailService.sendPasswordResetEmail(
      ENV.EMAIL_USER, // Send to yourself
      "test-token-123",
      "Test User"
    );

    console.log("Email Send Result:", testResult);
  }
} catch (error) {
  console.log("Test Failed:", error.message);
  console.log("Full Error:", error);
}

console.log("");
console.log("Additional Diagnostics:");

// Check network connection to Gmail
console.log("Testing network connectivity to Gmail SMTP...");
try {
  const net = await import("net");
  const socket = new net.default.Socket();

  socket.setTimeout(5000);

  socket.connect(587, "smtp.gmail.com", () => {
    console.log("TCP connection to smtp.gmail.com:587 successful");
    socket.destroy();
  });

  socket.on("timeout", () => {
    console.log("TCP connection timeout (firewall issue?)");
    socket.destroy();
  });

  socket.on("error", (error) => {
    console.log("TCP connection failed:", error.message);
  });
} catch (netError) {
  console.log("Network test error:", netError.message);
}
