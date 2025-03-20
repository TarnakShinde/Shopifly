import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { supabase } from "../../../lib/supabase";
import { NextResponse } from "next/server";

export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get("orderId");

    if (!orderId) {
        return NextResponse.json(
            { error: "Order ID required" },
            { status: 400 }
        );
    }

    // Fetch order data from Supabase
    const { data: order, error } = await supabase
        .from("orders")
        .select(
            "id, total_price, created_at, shipping_details, products, paymentMode"
        )
        .eq("id", orderId)
        .single();

    if (error || !order) {
        console.error("Error fetching order:", error);
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Create a new PDF document
    const pdfDoc = await PDFDocument.create();

    // Embed fonts
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const page = pdfDoc.addPage([595, 842]); // A4 size

    // Define colors
    const primaryColor = rgb(0.11, 0.41, 0.69); // Dark blue like in your example
    const borderColor = rgb(0.8, 0.8, 0.8); // Light gray border
    const textColor = rgb(0, 0, 0); // Black text

    // Parse JSON data safely
    let shippingDetails;
    let products;

    try {
        shippingDetails =
            typeof order.shipping_details === "string"
                ? JSON.parse(order.shipping_details)
                : order.shipping_details;

        products =
            typeof order.products === "string"
                ? JSON.parse(order.products)
                : order.products;
    } catch (err) {
        console.error("Error parsing JSON data:", err);
        return NextResponse.json(
            { error: "Invalid order data format" },
            { status: 500 }
        );
    }

    // Format date safely
    const orderDate = order.created_at
        ? new Date(order.created_at).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
          })
        : "N/A";

    // Draw header background
    page.drawRectangle({
        x: 0,
        y: 792, // 842 - 50
        width: 595,
        height: 50,
        color: primaryColor,
    });

    // Draw header text
    page.drawText("INVOICE", {
        x: 37,
        y: 812,
        size: 24,
        font: helveticaBold,
        color: rgb(1, 1, 1), // White
    });

    // Draw invoice number (right aligned)
    const invoiceNumber = `#${order.id}`;
    const invoiceNumWidth = helveticaBold.widthOfTextAtSize(invoiceNumber, 16);
    page.drawText(invoiceNumber, {
        x: 595 - invoiceNumWidth - 37, // Right aligned with margin
        y: 812,
        size: 16,
        font: helveticaBold,
        color: rgb(1, 1, 1), // White
    });

    // Draw company info box
    page.drawRectangle({
        x: 37,
        y: 700,
        width: 250,
        height: 70,
        borderColor: borderColor,
        borderWidth: 1,
    });

    page.drawText("Shopifly", {
        x: 51,
        y: 745,
        size: 12,
        font: helveticaBold,
        color: textColor,
    });

    page.drawText("shopilfyecom@gmail.com | +91 9167831999", {
        x: 51,
        y: 730,
        size: 10,
        font: helveticaFont,
        color: textColor,
    });

    // Draw invoice details box
    page.drawRectangle({
        x: 308,
        y: 700,
        width: 250,
        height: 70,
        borderColor: borderColor,
        borderWidth: 1,
    });

    page.drawText("Invoice Details", {
        x: 320,
        y: 745,
        size: 12,
        font: helveticaBold,
        color: textColor,
    });

    page.drawText(`Date: ${orderDate}`, {
        x: 322,
        y: 730,
        size: 10,
        font: helveticaFont,
        color: textColor,
    });

    page.drawText(`Payment Mode: ${order.paymentMode || "N/A"}`, {
        x: 322,
        y: 715,
        size: 10,
        font: helveticaFont,
        color: textColor,
    });

    // Draw "Bill To" section
    page.drawText("Bill To:", {
        x: 37,
        y: 670,
        size: 12,
        font: helveticaBold,
        color: textColor,
    });

    if (shippingDetails && shippingDetails.fullName) {
        page.drawText(`${shippingDetails.fullName}`, {
            x: 37,
            y: 655,
            size: 12,
            font: helveticaBold,
            color: textColor,
        });

        // Extract and display address components separately for better formatting
        const address = shippingDetails.address || "";
        const city = shippingDetails.city || "";
        const zip = shippingDetails.zip || "";

        // Format address line
        page.drawText(`${address}, ${city}, ${zip}`, {
            x: 37,
            y: 640,
            size: 10,
            font: helveticaFont,
            color: textColor,
        });

        // Add email if available
        if (shippingDetails.email) {
            page.drawText(`Email: ${shippingDetails.email}`, {
                x: 37,
                y: 625,
                size: 10,
                font: helveticaFont,
                color: textColor,
            });
        }

        // Add phone if available
        if (shippingDetails.phone) {
            page.drawText(`Phone: ${shippingDetails.phone}`, {
                x: 37,
                y: 610,
                size: 10,
                font: helveticaFont,
                color: textColor,
            });
        }
    } else {
        page.drawText("No shipping details available", {
            x: 37,
            y: 655,
            size: 10,
            font: helveticaFont,
            color: textColor,
        });
    }

    // Draw table header
    const tableTop = 580;
    const tableLeft = 37;
    const tableWidth = 521;

    // Column widths (in proportion to the table)
    const colWidths = {
        no: tableWidth * 0.05, // 5% for number column
        desc: tableWidth * 0.55, // 55% for description column
        qty: tableWidth * 0.1, // 10% for quantity column
        price: tableWidth * 0.15, // 15% for unit price column
        amount: tableWidth * 0.15, // 15% for amount column
    };

    // Calculate column positions
    const colPos = {
        no: tableLeft,
        desc: tableLeft + colWidths.no,
        qty: tableLeft + colWidths.no + colWidths.desc,
        price: tableLeft + colWidths.no + colWidths.desc + colWidths.qty,
        amount:
            tableLeft +
            colWidths.no +
            colWidths.desc +
            colWidths.qty +
            colWidths.price,
    };

    // Draw table header background
    page.drawRectangle({
        x: tableLeft,
        y: tableTop - 20,
        width: tableWidth,
        height: 20,
        color: primaryColor,
    });

    // Table headers
    page.drawText("No.", {
        x: colPos.no + 5, // 5px padding
        y: tableTop - 10,
        size: 10,
        font: helveticaBold,
        color: rgb(1, 1, 1), // White
    });

    page.drawText("Item Description", {
        x: colPos.desc + 5,
        y: tableTop - 10,
        size: 10,
        font: helveticaBold,
        color: rgb(1, 1, 1), // White
    });

    page.drawText("Qty", {
        x: colPos.qty + 5,
        y: tableTop - 10,
        size: 10,
        font: helveticaBold,
        color: rgb(1, 1, 1), // White
    });

    page.drawText("Unit Price", {
        x: colPos.price + 5,
        y: tableTop - 10,
        size: 10,
        font: helveticaBold,
        color: rgb(1, 1, 1), // White
    });

    page.drawText("Amount", {
        x: colPos.amount + 5,
        y: tableTop - 10,
        size: 10,
        font: helveticaBold,
        color: rgb(1, 1, 1), // White
    });

    // Draw table rows
    let yPosition = tableTop - 40; // Start position for first item (with extra space)
    let totalAmount = 0;

    // Helper function to wrap long text
    const wrapText = (text, maxWidth, fontSize) => {
        const words = text.split(" ");
        const lines = [];
        let currentLine = words[0];

        for (let i = 1; i < words.length; i++) {
            const word = words[i];
            const width = helveticaFont.widthOfTextAtSize(
                `${currentLine} ${word}`,
                fontSize
            );

            if (width < maxWidth) {
                currentLine += ` ${word}`;
            } else {
                lines.push(currentLine);
                currentLine = word;
            }
        }

        lines.push(currentLine);
        return lines;
    };

    // Check if products array exists and has items
    if (Array.isArray(products) && products.length > 0) {
        products.forEach((item, index) => {
            if (item && item.product_name) {
                const quantity = item.quantity || 1;
                const price = parseFloat(
                    item.discounted_price || item.price || 0
                );
                const amount = price * quantity;
                totalAmount += amount;

                // Handle long product names with text wrapping
                const maxDescWidth = colWidths.desc - 10; // 10px padding
                const descLines = wrapText(item.product_name, maxDescWidth, 10);

                // Calculate row height based on number of lines
                const lineHeight = 14;
                const rowHeight = Math.max(20, descLines.length * lineHeight);

                // Draw item number
                page.drawText(`${index + 1}`, {
                    x: colPos.no + 5,
                    y: yPosition,
                    size: 10,
                    font: helveticaFont,
                    color: textColor,
                });

                // Draw wrapped description text
                descLines.forEach((line, lineIndex) => {
                    page.drawText(line, {
                        x: colPos.desc + 5,
                        y: yPosition - lineIndex * lineHeight,
                        size: 10,
                        font: helveticaFont,
                        color: textColor,
                    });
                });

                // Draw quantity
                page.drawText(`${quantity}`, {
                    x: colPos.qty + 5,
                    y: yPosition,
                    size: 10,
                    font: helveticaFont,
                    color: textColor,
                });

                // Draw unit price
                page.drawText(`INR ${price.toFixed(2)}`, {
                    x: colPos.price + 5,
                    y: yPosition,
                    size: 10,
                    font: helveticaFont,
                    color: textColor,
                });

                // Draw amount
                page.drawText(`INR ${amount.toFixed(2)}`, {
                    x: colPos.amount + 5,
                    y: yPosition,
                    size: 10,
                    font: helveticaFont,
                    color: textColor,
                });

                // Move down for the next item based on the calculated row height
                yPosition -= rowHeight + 10; // Add some padding between rows
            }
        });
    } else {
        page.drawText("No items in this order", {
            x: colPos.desc + 5,
            y: yPosition,
            size: 10,
            font: helveticaFont,
            color: textColor,
        });
        yPosition -= 30;
    }

    // Draw total box
    const totalY = yPosition - 20;
    page.drawRectangle({
        x: colPos.price,
        y: totalY - 20,
        width: colWidths.price + colWidths.amount,
        height: 30,
        borderColor: borderColor,
        borderWidth: 1,
    });

    page.drawText("TOTAL:", {
        x: colPos.price + 5,
        y: totalY - 5,
        size: 12,
        font: helveticaBold,
        color: textColor,
    });

    // Use the order.total_price if available, otherwise use calculated total
    const finalTotal =
        typeof order.total_price === "number" ? order.total_price : totalAmount;

    // Right align the total amount
    const totalText = `INR ${finalTotal.toFixed(2)}`;
    const totalTextWidth = helveticaBold.widthOfTextAtSize(totalText, 12);

    page.drawText(totalText, {
        x: colPos.amount + colWidths.amount - totalTextWidth - 5, // Right align with 5px padding
        y: totalY - 5,
        size: 12,
        font: helveticaBold,
        color: textColor,
    });

    // Serialize the PDFDocument to bytes (a Uint8Array)
    const pdfBytes = await pdfDoc.save();

    // Return the PDF as a response
    return new NextResponse(pdfBytes, {
        headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename="invoice-${order.id}.pdf"`,
        },
    });
}
