import { NextResponse } from "next/server";
import jsPDF from "jspdf";
import { doc, getDoc } from "firebase/firestore";

import { firestore } from "@/lib/firebaseClient";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ orderId: string }> },
) {
  const { orderId } = await params;

  try {
    const orderRef = doc(firestore, "orders", orderId);
    const snapshot = await getDoc(orderRef);

    if (!snapshot.exists()) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const order = snapshot.data();
    console.log("Order data:", JSON.stringify(order, null, 2));

    // Create PDF using jsPDF
    const doc = new jsPDF();
    let yPosition = 20;

    // Helper function to add text and move down
    const addText = (text: string, fontSize: number = 10, isBold: boolean = false, align: 'left' | 'center' | 'right' = 'left') => {
      doc.setFontSize(fontSize);
      if (isBold) {
        doc.setFont(undefined, 'bold');
      } else {
        doc.setFont(undefined, 'normal');
      }
      doc.text(text, 20, yPosition, { align });
      yPosition += fontSize * 0.4;
    };

    // Header
    addText("PlantHub", 20, true, 'center');
    yPosition += 5;
    addText("ใบเสร็จรับเงิน / INVOICE", 14, true, 'center');
    yPosition += 10;

    // Order info
    let createdAt = "-";
    try {
      if (order.createdAt?.toDate) {
        createdAt = order.createdAt.toDate().toLocaleString("th-TH");
      } else if (order.createdAt instanceof Date) {
        createdAt = order.createdAt.toLocaleString("th-TH");
      } else if (order.createdAt) {
        createdAt = new Date(order.createdAt).toLocaleString("th-TH");
      }
    } catch (dateError) {
      console.warn("Date parsing error:", dateError);
      createdAt = new Date().toLocaleString("th-TH");
    }

    addText(`เลขที่ใบเสร็จ: ${order.invoiceNumber ?? order.id}`);
    addText(`วันที่ออกใบเสร็จ: ${createdAt}`);
    yPosition += 5;

    // Customer info
    addText("ข้อมูลลูกค้า", 12, true);
    addText(order.shippingAddress?.fullName ?? "-");
    addText(order.shippingAddress?.addressLine1 ?? "-");
    if (order.shippingAddress?.addressLine2) {
      addText(order.shippingAddress.addressLine2);
    }
    addText(
      `${order.shippingAddress?.district ?? ""} ${order.shippingAddress?.province ?? ""} ${
        order.shippingAddress?.postalCode ?? ""
      }`,
    );
    addText(`โทรศัพท์: ${order.shippingAddress?.phone ?? "-"}`);
    yPosition += 5;

    // Items
    addText("รายละเอียดสินค้า", 12, true);
    yPosition += 5;

    if (order.items && Array.isArray(order.items)) {
      order.items.forEach((item: any, index: number) => {
        addText(`${index + 1}. ${item.name || "สินค้า"}`, 10, true);
        addText(`จำนวน: ${item.quantity || 0} × ฿${(item.price || 0).toLocaleString("th-TH")}`);
        addText(`ยอดรวม: ฿${((item.price || 0) * (item.quantity || 0)).toLocaleString("th-TH")}`);
        yPosition += 3;
      });
    } else {
      addText("ไม่มีรายการสินค้า");
    }

    yPosition += 5;
    addText("สรุปยอดชำระ", 12, true);
    addText(`ยอดสินค้า: ฿${(order.subtotal ?? 0).toLocaleString("th-TH")}`);
    addText(`ส่วนลด: ฿${(order.discountAmount ?? 0).toLocaleString("th-TH")}`);
    addText(`ค่าจัดส่ง: ฿${(order.deliveryFee ?? 40).toLocaleString("th-TH")}`);
    yPosition += 3;
    addText(`ยอดชำระทั้งหมด: ฿${(order.total ?? 0).toLocaleString("th-TH")}`, 12, true);

    yPosition += 5;
    const paymentMethodText = order.paymentMethod === 'cod' ? 'เก็บเงินปลายทาง' :
                             order.paymentMethod === 'credit' ? 'บัตรเครดิต' :
                             order.paymentMethod === 'promptpay' ? 'พร้อมเพย์' :
                             order.paymentMethod === 'bank_transfer' ? 'โอนธนาคาร' : order.paymentMethod ?? "-";
    
    addText(`วิธีชำระเงิน: ${paymentMethodText}`);
    addText(`สถานะการชำระเงิน: ${order.paymentStatus ?? "-"}`);

    yPosition += 10;
    addText("ใบเสร็จนี้จัดทำโดยระบบอัตโนมัติของ PlantHub", 8, false, 'center');

    // Generate PDF buffer
    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="invoice-${orderId}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Failed to generate invoice", error);
    return NextResponse.json({ 
      error: "Failed to generate invoice", 
      details: error instanceof Error ? error.message : String(error) 
    }, { status: 500 });
  }
}

