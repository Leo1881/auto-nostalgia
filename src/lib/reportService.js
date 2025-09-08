import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { supabase } from "./supabase";

class ReportService {
  async generateAssessmentReport(assessmentData) {
    const { assessment, vehicle, customer, assessor } = assessmentData;

    // Validate required data
    if (!assessment) {
      throw new Error("Assessment data is required");
    }
    if (!vehicle) {
      throw new Error("Vehicle data is required");
    }
    if (!customer) {
      throw new Error("Customer data is required");
    }
    if (!assessor) {
      throw new Error("Assessor data is required");
    }

    // Create a new PDF document
    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - margin * 2;
    let yPosition = margin;

    // Add company header
    pdf.setFontSize(24);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(220, 38, 38); // Red color
    pdf.text("Auto Nostalgia", margin, yPosition);

    yPosition += 15;
    pdf.setFontSize(16);
    pdf.setTextColor(0, 0, 0);
    pdf.text("Vehicle Assessment Report", margin, yPosition);

    yPosition += 20;

    // Add report details
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "bold");
    pdf.text("Report Details:", margin, yPosition);
    yPosition += 8;

    pdf.setFont("helvetica", "normal");
    pdf.text(`Report ID: ${assessment.id}`, margin, yPosition);
    yPosition += 6;
    pdf.text(
      `Assessment Date: ${new Date(
        assessment.completion_date || assessment.created_at
      ).toLocaleDateString()}`,
      margin,
      yPosition
    );
    yPosition += 6;
    pdf.text(
      `Assessment Type: ${assessment.assessment_type
        .replace(/_/g, " ")
        .replace(/\b\w/g, (l) => l.toUpperCase())}`,
      margin,
      yPosition
    );
    yPosition += 15;

    // Add vehicle information
    pdf.setFont("helvetica", "bold");
    pdf.text("Vehicle Information:", margin, yPosition);
    yPosition += 8;

    pdf.setFont("helvetica", "normal");
    pdf.text(`Make: ${vehicle.make}`, margin, yPosition);
    yPosition += 6;
    pdf.text(`Model: ${vehicle.model}`, margin, yPosition);
    yPosition += 6;
    pdf.text(`Year: ${vehicle.year}`, margin, yPosition);
    yPosition += 6;
    pdf.text(`Registration: ${vehicle.registration_number}`, margin, yPosition);
    yPosition += 6;
    pdf.text(`VIN: ${vehicle.vin}`, margin, yPosition);
    yPosition += 6;
    pdf.text(
      `Mileage: ${vehicle.mileage?.toLocaleString()} km`,
      margin,
      yPosition
    );
    yPosition += 6;
    pdf.text(`Color: ${vehicle.color}`, margin, yPosition);
    yPosition += 15;

    // Add customer information
    pdf.setFont("helvetica", "bold");
    pdf.text("Customer Information:", margin, yPosition);
    yPosition += 8;

    pdf.setFont("helvetica", "normal");
    pdf.text(
      `Name: ${customer.full_name || "Not provided"}`,
      margin,
      yPosition
    );
    yPosition += 6;
    pdf.text(`Email: ${customer.email || "Not provided"}`, margin, yPosition);
    yPosition += 6;
    pdf.text(`Phone: ${customer.phone || "Not provided"}`, margin, yPosition);
    yPosition += 6;
    pdf.text(
      `Location: ${customer.city || "Not provided"}, ${
        customer.province || "Not provided"
      }`,
      margin,
      yPosition
    );
    yPosition += 15;

    // Add assessor information
    pdf.setFont("helvetica", "bold");
    pdf.text("Assessor Information:", margin, yPosition);
    yPosition += 8;

    pdf.setFont("helvetica", "normal");
    pdf.text(
      `Name: ${assessor.full_name || "Not provided"}`,
      margin,
      yPosition
    );
    yPosition += 6;
    pdf.text(`Email: ${assessor.email || "Not provided"}`, margin, yPosition);
    yPosition += 6;
    pdf.text(`Phone: ${assessor.phone || "Not provided"}`, margin, yPosition);
    yPosition += 15;

    // Add assessment results
    pdf.setFont("helvetica", "bold");
    pdf.text("Assessment Results:", margin, yPosition);
    yPosition += 8;

    pdf.setFont("helvetica", "normal");
    pdf.text(
      `Vehicle Value: R ${
        assessment.vehicle_value?.toLocaleString() || "Not assessed"
      }`,
      margin,
      yPosition
    );
    yPosition += 6;

    // Add Assessment Notes with proper text wrapping
    pdf.setFont("helvetica", "bold");
    pdf.text("Assessment Notes:", margin, yPosition);
    yPosition += 8;

    pdf.setFont("helvetica", "normal");
    const notesText = assessment.assessment_notes || "No notes provided";
    const maxLineWidth = contentWidth - 10; // Leave some margin
    const lines = pdf.splitTextToSize(notesText, maxLineWidth);

    // Add each line of text
    for (let i = 0; i < lines.length; i++) {
      // Check if we need a new page
      if (yPosition > pageHeight - margin - 20) {
        pdf.addPage();
        yPosition = margin;
      }

      pdf.text(lines[i], margin + 5, yPosition);
      yPosition += 6;
    }

    yPosition += 10;

    // Add vehicle images if available
    const vehicleImages = [
      vehicle.image_1_url,
      vehicle.image_2_url,
      vehicle.image_3_url,
      vehicle.image_4_url,
      vehicle.image_5_url,
      vehicle.image_6_url,
    ].filter((url) => url && url.trim() !== "");

    if (vehicleImages.length > 0) {
      pdf.setFont("helvetica", "bold");
      pdf.text("Vehicle Images:", margin, yPosition);
      yPosition += 10;

      // Add images in a grid (2 per row)
      const imageWidth = 80;
      const imageHeight = 60;
      const imagesPerRow = 2;
      const imageSpacing = 10;

      for (let i = 0; i < vehicleImages.length; i++) {
        const row = Math.floor(i / imagesPerRow);
        const col = i % imagesPerRow;
        const x = margin + col * (imageWidth + imageSpacing);
        const y = yPosition + row * (imageHeight + 10);

        // Check if we need a new page
        if (y + imageHeight > pageHeight - margin) {
          pdf.addPage();
          yPosition = margin;
        }

        try {
          // Add image placeholder (actual image loading would require additional setup)
          pdf.rect(x, y, imageWidth, imageHeight);
          pdf.setFontSize(8);
          pdf.text(`Image ${i + 1}`, x + 5, y + imageHeight + 5);
          pdf.text(
            `(Available at: ${vehicleImages[i]})`,
            x + 5,
            y + imageHeight + 10
          );
        } catch (error) {
          console.error("Error adding image to PDF:", error);
          pdf.rect(x, y, imageWidth, imageHeight);
          pdf.setFontSize(8);
          pdf.text(
            `Image ${i + 1} - Error loading`,
            x + 5,
            y + imageHeight + 5
          );
        }
      }
    }

    // Add footer
    const footerY = pageHeight - 20;
    pdf.setFontSize(10);
    pdf.setTextColor(128, 128, 128);
    pdf.text(`Generated on ${new Date().toLocaleString()}`, margin, footerY);
    pdf.text(
      `Auto Nostalgia Assessment Report`,
      pageWidth - margin - 80,
      footerY
    );

    return pdf;
  }

  async saveReportToStorage(assessmentData) {
    try {
      const { assessment, vehicle } = assessmentData;

      // Generate the PDF
      const pdf = await this.generateAssessmentReport(assessmentData);
      const pdfBlob = pdf.output("blob");

      // Create filename
      const filename = `assessment_reports/${assessment.id}_${
        vehicle.registration_number
      }_${Date.now()}.pdf`;

      console.log("🔍 Attempting to upload to storage bucket: reports");
      console.log("🔍 Filename:", filename);
      console.log("🔍 File size:", pdfBlob.size, "bytes");

      // Check current user's role
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        console.log("🔍 Current user role:", profile?.role);
        console.log("🔍 User ID:", user.id);
      }

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("reports")
        .upload(filename, pdfBlob, {
          contentType: "application/pdf",
          cacheControl: "3600",
        });

      if (uploadError) {
        console.error("Error uploading report to storage:", uploadError);
        console.error("Upload error details:", {
          message: uploadError.message,
          details: uploadError.details,
          hint: uploadError.hint,
          code: uploadError.code,
        });
        throw new Error("Failed to upload report to storage");
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("reports")
        .getPublicUrl(filename);

      // Update assessment_requests table with report info
      const { error: updateError } = await supabase
        .from("assessment_requests")
        .update({
          report_url: urlData.publicUrl,
          report_generated_at: new Date().toISOString(),
          report_version: 1,
        })
        .eq("id", assessment.id);

      if (updateError) {
        console.error(
          "Error updating assessment with report info:",
          updateError
        );
        throw new Error("Failed to update assessment with report info");
      }

      return urlData.publicUrl;
    } catch (error) {
      console.error("Error saving report to storage:", error);
      throw error;
    }
  }

  async downloadReport(assessmentData, filename = null) {
    try {
      // First save the report to storage
      const reportUrl = await this.saveReportToStorage(assessmentData);

      // Then download it for the user
      const pdf = await this.generateAssessmentReport(assessmentData);

      if (!filename) {
        const { assessment, vehicle } = assessmentData;
        filename = `assessment_report_${vehicle.registration_number}_${assessment.id}.pdf`;
      }

      pdf.save(filename);
      return { success: true, reportUrl };
    } catch (error) {
      console.error("Error generating and saving report:", error);
      throw error;
    }
  }

  async downloadSavedReport(reportUrl, filename = null) {
    try {
      if (!reportUrl) {
        throw new Error("No report URL provided");
      }

      // Download the file from storage
      const response = await fetch(reportUrl);
      if (!response.ok) {
        throw new Error("Failed to fetch report from storage");
      }

      const blob = await response.blob();

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename || "assessment_report.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      return true;
    } catch (error) {
      console.error("Error downloading saved report:", error);
      throw error;
    }
  }

  async generateReportBlob(assessmentData) {
    try {
      const pdf = await this.generateAssessmentReport(assessmentData);
      return pdf.output("blob");
    } catch (error) {
      console.error("Error generating report blob:", error);
      throw error;
    }
  }
}

export const reportService = new ReportService();
