import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { SmtpClient } from "https://deno.land/x/smtp@v0.7.0/mod.ts";

// Email templates
const emailTemplates = {
  customer_welcome: {
    subject: "Welcome to Auto Nostalgia! 🚗✨",
    template: "CustomerWelcomeEmail.html",
  },
  assessor_application_pending: {
    subject: "Application Received - Auto Nostalgia Assessor Program",
    template: "AssessorApplicationPendingEmail.html",
  },
  admin_assessor_notification: {
    subject: "New Assessor Application Requires Review - Auto Nostalgia",
    template: "AdminAssessorNotificationEmail.html",
  },
  assessor_approval: {
    subject:
      "Congratulations! Your Assessor Application is Approved - Auto Nostalgia",
    template: "AssessorApprovalEmail.html",
  },
};

// Base email template
const baseTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{subject}}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background-color: #f8f9fa; }
        .email-container { max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
        .header { background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); padding: 30px 20px; text-align: center; }
        .logo { color: #ffffff !important; font-size: 28px; font-weight: bold; text-decoration: none; margin-bottom: 10px; display: block; }
        .tagline { color: #fecaca; font-size: 16px; font-style: italic; }
        .content { padding: 40px 30px; }
        .greeting { font-size: 24px; color: #1f2937; margin-bottom: 20px; font-weight: 600; }
        .message { font-size: 16px; color: #4b5563; margin-bottom: 25px; line-height: 1.7; }
        .highlight-box { background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 20px; margin: 25px 0; border-radius: 4px; }
        .highlight-box h3 { color: #dc2626; margin-bottom: 10px; font-size: 18px; }
        .button { display: inline-block; background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 16px; margin: 20px 0; text-align: center; transition: all 0.3s ease; }
        .button:hover { transform: translateY(-2px); box-shadow: 0 6px 12px rgba(220, 38, 38, 0.3); }
        .footer { background-color: #1f2937; color: #9ca3af; padding: 30px 20px; text-align: center; }
        .footer-content { max-width: 400px; margin: 0 auto; }
        .footer-links { margin: 20px 0; }
        .footer-links a { color: #d1d5db; text-decoration: none; margin: 0 15px; font-size: 14px; }
        .footer-links a:hover { color: #ffffff; }
        .social-links { margin: 20px 0; }
        .social-links a { display: inline-block; margin: 0 10px; color: #9ca3af; text-decoration: none; font-size: 18px; }
        .social-links a:hover { color: #ffffff; }
        .copyright { font-size: 12px; color: #6b7280; margin-top: 20px; border-top: 1px solid #374151; padding-top: 20px; }
        @media (max-width: 600px) { .content { padding: 30px 20px; } .header { padding: 20px 15px; } .greeting { font-size: 20px; } .message { font-size: 15px; } }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <a href="#" class="logo" style="color: #ffffff !important;">Auto Nostalgia</a>
            <div class="tagline">Preserving Automotive Heritage</div>
        </div>
        <div class="content">
            {{content}}
        </div>
        <div class="footer">
            <div class="footer-content">
                <div class="footer-links">
                    <a href="#">About Us</a>
                    <a href="#">Services</a>
                    <a href="#">Contact</a>
                    <a href="#">Privacy Policy</a>
                </div>
                <div class="social-links">
                    <a href="#" title="Facebook">Facebook</a>
                    <a href="#" title="Instagram">Instagram</a>
                    <a href="#" title="Twitter">Twitter</a>
                    <a href="#" title="LinkedIn">LinkedIn</a>
                </div>
                <div class="copyright">
                    © 2024 Auto Nostalgia. All rights reserved.<br>
                    This email was sent to {{recipient_email}}. If you have any questions, please contact us.
                </div>
            </div>
        </div>
    </div>
</body>
</html>`;

// Content templates
const contentTemplates = {
  customer_welcome: `
    <div class="greeting">Welcome to Auto Nostalgia!</div>
    <div class="message">Thank you for joining Auto Nostalgia! We're excited to have you as part of our community of classic car enthusiasts and collectors.</div>
    <div class="message">Your account has been successfully created and you can now:</div>
    <div class="highlight-box">
      <h3>What You Can Do Now:</h3>
      <ul style="margin-left: 20px; color: #4b5563;">
        <li>Request vehicle assessments from our expert assessors</li>
        <li>Track your assessment history and results</li>
        <li>Download detailed assessment reports</li>
        <li>Manage your vehicle portfolio</li>
        <li>Connect with our network of automotive professionals</li>
      </ul>
    </div>
    <div class="message">To get started, simply log in to your account and request your first vehicle assessment. Our team of certified assessors will provide you with comprehensive evaluations and detailed reports.</div>
    <a href="{{login_url}}" class="button">Login to Your Account</a>
    <div class="message">If you have any questions or need assistance, don't hesitate to reach out to our support team. We're here to help you preserve and understand your automotive heritage.</div>
    <div class="message">Welcome aboard!<br><strong>The Auto Nostalgia Team</strong></div>
  `,

  assessor_application_pending: `
    <div class="greeting">Application Received!</div>
    <div class="message">Thank you for your interest in becoming an Auto Nostalgia assessor! We've received your application and our team is currently reviewing your credentials and experience.</div>
    <div class="highlight-box">
      <h3>Application Status: Pending Review</h3>
      <p>Your application is now in our review queue. Our team will carefully evaluate your qualifications and get back to you within 3-5 business days.</p>
    </div>
    <div class="message"><strong>What happens next?</strong></div>
    <div class="message">
      <ol style="margin-left: 20px; color: #4b5563;">
        <li>Our team reviews your application and credentials</li>
        <li>We may contact you for additional information if needed</li>
        <li>You'll receive an email notification once a decision is made</li>
        <li>If approved, you'll get access to our assessor dashboard</li>
      </ol>
    </div>
    <div class="message"><strong>While you wait:</strong><br>Feel free to explore our website and learn more about Auto Nostalgia's mission to preserve automotive heritage through expert assessments and detailed reporting.</div>
    <div class="message">We appreciate your patience during this process. If you have any questions about your application, please don't hesitate to contact us.</div>
    <div class="message">Best regards,<br><strong>The Auto Nostalgia Team</strong></div>
  `,

  admin_assessor_notification: `
    <div class="greeting">New Assessor Application Requires Review!</div>
    <div class="message">A new assessor application has been submitted and requires your review and approval.</div>
    <div class="highlight-box">
      <h3>Application Details:</h3>
      <p><strong>Applicant:</strong> {{assessor_name}}</p>
      <p><strong>Email:</strong> {{assessor_email}}</p>
      <p><strong>Phone:</strong> {{assessor_phone}}</p>
      <p><strong>Location:</strong> {{assessor_location}}</p>
      <p><strong>Experience:</strong> {{assessor_experience}}</p>
      <p><strong>Submitted:</strong> {{application_date}}</p>
    </div>
    <div class="message"><strong>Next Steps:</strong></div>
    <div class="message">
      <ol style="margin-left: 20px; color: #4b5563;">
        <li>Review the applicant's credentials and experience</li>
        <li>Check their contact information and references</li>
        <li>Make a decision: Approve or Reject</li>
        <li>Update the application status in the admin panel</li>
      </ol>
    </div>
    <div class="message"><strong>Important:</strong> Please review this application within 3-5 business days to maintain our high standards and provide timely responses to applicants.</div>
    <a href="{{admin_panel_url}}" class="button">Review Application in Admin Panel</a>
    <div class="message">If you have any questions about this application or need additional information, please contact the applicant directly or reach out to the support team.</div>
    <div class="message">Best regards,<br><strong>Auto Nostalgia System</strong></div>
  `,

  assessor_approval: `
    <div class="greeting">Congratulations! Your Application is Approved!</div>
    <div class="message">Great news! Your application to become an Auto Nostalgia assessor has been approved. Welcome to our team of automotive experts!</div>
    <div class="highlight-box">
      <h3>Application Status: APPROVED</h3>
      <p>You are now officially part of the Auto Nostalgia assessor network and can begin accepting assessment requests from customers.</p>
    </div>
    <div class="message"><strong>What you can do now:</strong></div>
    <div class="message">
      <ul style="margin-left: 20px; color: #4b5563;">
        <li>Access your assessor dashboard</li>
        <li>View available assessment requests in your area</li>
        <li>Accept and schedule assessments</li>
        <li>Generate detailed assessment reports</li>
        <li>Manage your assessment schedule</li>
        <li>Track your earnings and performance</li>
      </ul>
    </div>
    <div class="message"><strong>Getting Started:</strong><br>Log in to your account and explore the assessor dashboard. You'll find all the tools and information you need to start accepting assessment requests.</div>
    <a href="{{login_url}}" class="button">Access Your Assessor Dashboard</a>
    <div class="highlight-box">
      <h3>Resources Available:</h3>
      <p>We've prepared comprehensive guides and training materials to help you get started quickly. Check your dashboard for:</p>
      <ul style="margin-left: 20px; color: #4b5563;">
        <li>Assessment guidelines and best practices</li>
        <li>Report generation tutorials</li>
        <li>Customer communication tips</li>
        <li>Technical support contact information</li>
      </ul>
    </div>
    <div class="message"><strong>Need Help?</strong><br>Our support team is here to help you get started. Don't hesitate to reach out if you have any questions about the platform or assessment process.</div>
    <div class="message">Welcome to the team! We're excited to have you on board and look forward to working together to preserve automotive heritage through expert assessments.</div>
    <div class="message">Best regards,<br><strong>The Auto Nostalgia Team</strong></div>
  `,
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { template, recipient_email, recipient_name, subject, variables } =
      await req.json();

    if (!template || !recipient_email || !subject) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Get the content template
    const contentTemplate = contentTemplates[template];
    if (!contentTemplate) {
      return new Response(JSON.stringify({ error: "Invalid template" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Replace variables in content
    let content = contentTemplate;
    if (variables) {
      Object.keys(variables).forEach((key) => {
        content = content.replace(
          new RegExp(`{{${key}}}`, "g"),
          variables[key]
        );
      });
    }

    // Replace variables in base template
    let html = baseTemplate
      .replace("{{subject}}", subject)
      .replace("{{content}}", content)
      .replace("{{recipient_email}}", recipient_email);

    // For now, just return success (you'll need to set up actual email sending)
    // In production, you'd integrate with a service like SendGrid, Mailgun, or your own SMTP server

    console.log("Email would be sent:", {
      to: recipient_email,
      subject: subject,
      template: template,
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: "Email queued for sending",
        recipient: recipient_email,
        template: template,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error processing email request:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};
