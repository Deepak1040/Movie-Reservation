package com.example.online.Service;

import com.google.zxing.*;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;

import java.awt.image.BufferedImage;

public class QRGeneratorService {

    public static BufferedImage generateQRCodeImage(String content) throws Exception {
        BitMatrix matrix = new MultiFormatWriter().encode(content, BarcodeFormat.QR_CODE, 150, 150);
        return MatrixToImageWriter.toBufferedImage(matrix);
    }
}
