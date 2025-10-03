'use client';

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/40 via-white to-white">
      <div className="mx-auto max-w-4xl px-4 py-12">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-emerald-600 transition hover:text-emerald-700 mb-8"
        >
          <ArrowLeft className="h-4 w-4" /> กลับหน้าแรก
        </Link>

        <div className="rounded-3xl border border-emerald-100 bg-white p-8 md:p-12 shadow-lg">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">นโยบายความเป็นส่วนตัว</h1>
          <p className="text-slate-500 mb-8">อัปเดตล่าสุด: 3 ตุลาคม 2025</p>

          <div className="prose prose-slate max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">1. ข้อมูลที่เราเก็บรวบรวม</h2>
              <p className="text-slate-700 mb-4">
                PlantHub เก็บรวบรวมข้อมูลส่วนบุคคลเมื่อคุณ:
              </p>
              <ul className="list-disc pl-6 text-slate-700 space-y-2">
                <li>สมัครสมาชิกหรือเข้าสู่ระบบ (อีเมล, ชื่อ-นามสกุล, รูปโปรไฟล์)</li>
                <li>เข้าสู่ระบบผ่าน Facebook (ข้อมูลพื้นฐานจาก Facebook)</li>
                <li>ทำการสั่งซื้อสินค้า (ที่อยู่จัดส่ง, เบอร์โทรศัพท์)</li>
                <li>ติดต่อฝ่ายสนับสนุนลูกค้า</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">2. วิธีการใช้ข้อมูลของคุณ</h2>
              <p className="text-slate-700 mb-4">
                เราใช้ข้อมูลของคุณเพื่อ:
              </p>
              <ul className="list-disc pl-6 text-slate-700 space-y-2">
                <li>ดำเนินการและจัดส่งคำสั่งซื้อของคุณ</li>
                <li>ติดต่อสื่อสารเกี่ยวกับคำสั่งซื้อและบริการ</li>
                <li>ปรับปรุงประสบการณ์การใช้งานเว็บไซต์</li>
                <li>ส่งข้อเสนอพิเศษและโปรโมชั่น (หากคุณอนุญาต)</li>
                <li>ป้องกันการฉ้อโกงและรักษาความปลอดภัย</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">3. การเข้าสู่ระบบผ่าน Facebook</h2>
              <p className="text-slate-700 mb-4">
                เมื่อคุณเลือกเข้าสู่ระบบผ่าน Facebook เราจะเข้าถึงข้อมูลพื้นฐาน:
              </p>
              <ul className="list-disc pl-6 text-slate-700 space-y-2">
                <li>ชื่อและนามสกุล</li>
                <li>อีเมล</li>
                <li>รูปโปรไฟล์</li>
                <li>Facebook User ID</li>
              </ul>
              <p className="text-slate-700 mt-4">
                เราจะไม่โพสต์บน Facebook ของคุณหรือเข้าถึงข้อมูลส่วนตัวอื่นๆ โดยไม่ได้รับอนุญาต
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">4. การแชร์ข้อมูล</h2>
              <p className="text-slate-700 mb-4">
                เราจะไม่ขาย แลกเปลี่ยน หรือเผยแพร่ข้อมูลส่วนบุคคลของคุณให้กับบุคคลที่สาม ยกเว้น:
              </p>
              <ul className="list-disc pl-6 text-slate-700 space-y-2">
                <li>ผู้ให้บริการจัดส่งสินค้า (เพื่อการจัดส่ง)</li>
                <li>ระบบชำระเงิน (เพื่อประมวลผลการชำระเงิน)</li>
                <li>กรณีที่กฎหมายกำหนด</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">5. ความปลอดภัยของข้อมูล</h2>
              <p className="text-slate-700">
                เราใช้มาตรการรักษาความปลอดภัยที่เหมาะสมเพื่อปกป้องข้อมูลของคุณจากการเข้าถึง การใช้งาน 
                หรือการเปิดเผยที่ไม่ได้รับอนุญาต ข้อมูลทั้งหมดจะถูกเข้ารหัสและเก็บไว้บน Firebase 
                ซึ่งเป็นแพลตฟอร์มที่มีมาตรฐานความปลอดภัยสูง
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">6. สิทธิของคุณ</h2>
              <p className="text-slate-700 mb-4">คุณมีสิทธิ:</p>
              <ul className="list-disc pl-6 text-slate-700 space-y-2">
                <li>เข้าถึงและแก้ไขข้อมูลส่วนบุคคลของคุณ</li>
                <li>ลบบัญชีและข้อมูลของคุณ</li>
                <li>ยกเลิกการรับอีเมลการตลาด</li>
                <li>ถอนความยินยอมการใช้ข้อมูล</li>
              </ul>
              <p className="text-slate-700 mt-4">
                หากต้องการใช้สิทธิเหล่านี้ กรุณาติดต่อเราที่: <a href="mailto:donny21001@gmail.com" className="text-emerald-600 hover:underline">donny21001@gmail.com</a>
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">7. คุกกี้</h2>
              <p className="text-slate-700">
                เราใช้คุกกี้เพื่อปรับปรุงประสบการณ์การใช้งานเว็บไซต์ของคุณ รวมถึงจดจำการตั้งค่า 
                และรักษาเซสชันการเข้าสู่ระบบ คุณสามารถปิดการใช้งานคุกกี้ผ่านการตั้งค่าเบราว์เซอร์ของคุณ
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">8. การเปลี่ยนแปลงนโยบาย</h2>
              <p className="text-slate-700">
                เราอาจปรับปรุงนโยบายความเป็นส่วนตัวนี้เป็นครั้งคราว การเปลี่ยนแปลงใดๆ 
                จะมีผลทันทีที่เราโพสต์นโยบายที่แก้ไขบนหน้านี้
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">9. ติดต่อเรา</h2>
              <p className="text-slate-700 mb-4">
                หากคุณมีคำถามเกี่ยวกับนโยบายความเป็นส่วนตัวนี้ กรุณาติดต่อเราที่:
              </p>
              <div className="bg-emerald-50 rounded-2xl p-6 border border-emerald-100">
                <p className="text-slate-900 font-semibold mb-2">PlantHub</p>
                <p className="text-slate-700">อีเมล: donny21001@gmail.com</p>
                <p className="text-slate-700">เว็บไซต์: https://planthubb-sooty.vercel.app</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
