import { supabase } from "../../lib/supabase";

class EmailService {
  constructor() {
    this.baseUrl = import.meta.env.VITE_SUPABASE_URL || "";
  }

  /**
   * Send customer welcome email
   * @param {Object} customerData - Customer information
   * @param {string} customerData.email - Customer email
   * @param {string} customerData.full_name - Customer full name
   * @param {string} loginUrl - Login URL for the customer
   */
  async sendCustomerWelcomeEmail(customerData, loginUrl) {
    try {
      const response = await fetch(`${this.baseUrl}/functions/v1/send-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          template: "customer_welcome",
          recipient_email: customerData.email,
          recipient_name: customerData.full_name,
          subject: "Welcome to Auto Nostalgia! 🚗✨",
          variables: {
            login_url: loginUrl,
            recipient_email: customerData.email,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Email service error: ${response.status}`);
      }

      const result = await response.json();
      console.log("Customer welcome email sent:", result);
      return result;
    } catch (error) {
      console.error("Error sending customer welcome email:", error);
      throw error;
    }
  }

  /**
   * Send assessor application pending email
   * @param {Object} assessorData - Assessor information
   * @param {string} assessorData.email - Assessor email
   * @param {string} assessorData.full_name - Assessor full name
   */
  async sendAssessorApplicationPendingEmail(assessorData) {
    try {
      const response = await fetch(`${this.baseUrl}/functions/v1/send-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          template: "assessor_application_pending",
          recipient_email: assessorData.email,
          recipient_name: assessorData.full_name,
          subject: "Application Received - Auto Nostalgia Assessor Program",
          variables: {
            recipient_email: assessorData.email,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Email service error: ${response.status}`);
      }

      const result = await response.json();
      console.log("Assessor application pending email sent:", result);
      return result;
    } catch (error) {
      console.error("Error sending assessor application pending email:", error);
      throw error;
    }
  }

  /**
   * Send admin notification about new assessor application
   * @param {Object} assessorData - Assessor application data
   * @param {Array} adminEmails - Array of admin email addresses
   */
  async sendAdminAssessorNotificationEmail(assessorData, adminEmails) {
    try {
      const emailPromises = adminEmails.map(async (adminEmail) => {
        const response = await fetch(
          `${this.baseUrl}/functions/v1/send-email`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            },
            body: JSON.stringify({
              template: "admin_assessor_notification",
              recipient_email: adminEmail,
              recipient_name: "Admin",
              subject:
                "New Assessor Application Requires Review - Auto Nostalgia",
              variables: {
                assessor_name: assessorData.full_name,
                assessor_email: assessorData.email,
                assessor_phone: assessorData.phone || "Not provided",
                assessor_location:
                  assessorData.city && assessorData.province
                    ? `${assessorData.city}, ${assessorData.province}`
                    : "Not provided",
                assessor_experience: assessorData.experience || "Not provided",
                application_date: new Date().toLocaleDateString(),
                admin_panel_url: `${window.location.origin}/admin`,
                recipient_email: adminEmail,
              },
            }),
          }
        );

        if (!response.ok) {
          throw new Error(`Email service error: ${response.status}`);
        }

        return response.json();
      });

      const results = await Promise.all(emailPromises);
      console.log("Admin assessor notification emails sent:", results);
      return results;
    } catch (error) {
      console.error("Error sending admin assessor notification emails:", error);
      throw error;
    }
  }

  /**
   * Send assessor approval confirmation email
   * @param {Object} assessorData - Assessor information
   * @param {string} loginUrl - Login URL for the assessor
   */
  async sendAssessorApprovalEmail(assessorData, loginUrl) {
    try {
      const response = await fetch(`${this.baseUrl}/functions/v1/send-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          template: "assessor_approval",
          recipient_email: assessorData.email,
          recipient_name: assessorData.full_name,
          subject:
            "Congratulations! Your Assessor Application is Approved - Auto Nostalgia",
          variables: {
            login_url: loginUrl,
            recipient_email: assessorData.email,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Email service error: ${response.status}`);
      }

      const result = await response.json();
      console.log("Assessor approval email sent:", result);
      return result;
    } catch (error) {
      console.error("Error sending assessor approval email:", error);
      throw error;
    }
  }

  /**
   * Get admin email addresses from profiles table
   */
  async getAdminEmails() {
    try {
      const { data: adminProfiles, error } = await supabase
        .from("profiles")
        .select("email")
        .eq("role", "admin");

      if (error) {
        throw error;
      }

      return adminProfiles.map((profile) => profile.email);
    } catch (error) {
      console.error("Error fetching admin emails:", error);
      throw error;
    }
  }
}

export const emailService = new EmailService();
