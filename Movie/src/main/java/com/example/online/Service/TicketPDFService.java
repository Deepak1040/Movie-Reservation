package com.example.online.Service;

import org.apache.pdfbox.pdmodel.*;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.graphics.image.LosslessFactory;
import org.apache.pdfbox.pdmodel.graphics.image.PDImageXObject;
import org.springframework.stereotype.Service;

import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;

@Service
public class TicketPDFService {

    public byte[] generateTicketPDF(String qrContent, String movie, String theater, String seat, String time) throws Exception {
        if (qrContent == null || qrContent.isBlank()) {
            throw new IllegalArgumentException("QR content cannot be null or blank");
        }

        BufferedImage qrImage = QRGeneratorService.generateQRCodeImage(qrContent);

        try (PDDocument doc = new PDDocument();
             ByteArrayOutputStream output = new ByteArrayOutputStream()) {

            PDPage page = new PDPage(PDRectangle.A6);
            doc.addPage(page);

            try (PDPageContentStream content = new PDPageContentStream(doc, page)) {

                // Write text block
                content.beginText();
                content.setFont(PDType1Font.HELVETICA_BOLD, 12);
                content.setLeading(14.5f);
                content.newLineAtOffset(40, 300);
                content.showText("Movie: " + movie);
                content.newLine();
                content.showText("Theater: " + theater);
                content.newLine();
                content.showText("Seat: " + seat);
                content.newLine();
                content.showText("Time: " + time);
                content.endText();

                // Add QR Code image
                if (qrImage != null) {
                    PDImageXObject pdImage = LosslessFactory.createFromImage(doc, qrImage);
                    content.drawImage(pdImage, 170, 170, 100, 100);
                }
            }

            doc.save(output);
            return output.toByteArray();
        }
    }
}
