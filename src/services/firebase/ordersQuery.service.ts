import { collection, getDocs, orderBy, query, where } from "firebase/firestore";

import { firestore } from "../../lib/firebaseClient";

export async function fetchOrdersForUser(userId: string) {
  const ordersRef = collection(firestore, "orders");
  const q = query(ordersRef, where("buyerId", "==", userId), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((docSnapshot) => {
    const data = docSnapshot.data();
    return {
      id: docSnapshot.id,
      status: data.status as string,
      status_th: statusToThai(data.status as string),
      paymentMethod: data.paymentMethod as string,
      paymentMethod_th: paymentMethodToThai(data.paymentMethod as string),
      total: data.total as number,
      updatedAt: data.updatedAt?.toDate?.() ?? null,
    };
  });
}

function statusToThai(status: string) {
  const map: Record<string, string> = {
    pending: "รอการยืนยัน",
    awaiting_payment: "รอชำระเงิน",
    paid: "ชำระแล้ว",
    processing: "กำลังแพ็คสินค้า",
    shipping: "กำลังจัดส่ง",
    completed: "จัดส่งสำเร็จ",
    cancelled: "ยกเลิก",
    refunded: "คืนเงินแล้ว",
  };
  return map[status] ?? status;
}

function paymentMethodToThai(method: string) {
  const map: Record<string, string> = {
    cod: "เก็บเงินปลายทาง",
    credit: "บัตรเครดิต/เดบิต",
    promptpay: "พร้อมเพย์",
    bank_transfer: "โอนผ่านธนาคาร",
  };
  return map[method] ?? method;
}


