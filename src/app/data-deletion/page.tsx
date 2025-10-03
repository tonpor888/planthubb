'use client';

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function DataDeletionPage() {
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
          <h1 className="text-4xl font-bold text-slate-900 mb-2">การลบข้อมูลผู้ใช้</h1>
          <p className="text-slate-500 mb-8">คำแนะนำการลบข้อมูลส่วนบุคคลของคุณ</p>

          <div className="prose prose-slate max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">ข้อมูลที่เราเก็บจากการเข้าสู่ระบบ Facebook</h2>
              <p className="text-slate-700 mb-4">
                เมื่อคุณเข้าสู่ระบบผ่าน Facebook เราเก็บข้อมูลต่อไปนี้:
              </p>
              <ul className="list-disc pl-6 text-slate-700 space-y-2">
                <li>ชื่อและนามสกุล</li>
                <li>อีเมล</li>
                <li>รูปโปรไฟล์</li>
                <li>Facebook User ID</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">วิธีการลบข้อมูลของคุณ</h2>
              
              <div className="bg-emerald-50 rounded-2xl p-6 border border-emerald-100 mb-6">
                <h3 className="text-lg font-semibold text-emerald-900 mb-3">ตัวเลือกที่ 1: ลบผ่านเว็บไซต์ PlantHub</h3>
                <ol className="list-decimal pl-6 text-slate-700 space-y-2">
                  <li>เข้าสู่ระบบที่ <a href="https://planthubb-sooty.vercel.app" className="text-emerald-600 hover:underline">planthubb-sooty.vercel.app</a></li>
                  <li>คลิกที่รูปโปรไฟล์ของคุณที่มุมขวาบน</li>
                  <li>เลือก "โปรไฟล์ของฉัน"</li>
                  <li>เลื่อนลงมาด้านล่างและคลิก "ลบบัญชี"</li>
                  <li>ยืนยันการลบบัญชี</li>
                </ol>
                <p className="text-slate-700 mt-4 text-sm">
                  ⏱️ ข้อมูลทั้งหมดจะถูกลบภายใน 24 ชั่วโมง
                </p>
              </div>

              <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100 mb-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-3">ตัวเลือกที่ 2: ติดต่อฝ่ายสนับสนุน</h3>
                <p className="text-slate-700 mb-4">
                  ส่งอีเมลมาที่: <a href="mailto:donny21001@gmail.com" className="text-blue-600 hover:underline font-semibold">donny21001@gmail.com</a>
                </p>
                <p className="text-slate-700 mb-3">กรุณาระบุข้อมูลต่อไปนี้:</p>
                <ul className="list-disc pl-6 text-slate-700 space-y-2">
                  <li>หัวข้อ: "ขอลบข้อมูลบัญชี PlantHub"</li>
                  <li>อีเมลที่ใช้สมัครสมาชิก</li>
                  <li>ชื่อบัญชีของคุณ</li>
                </ul>
                <p className="text-slate-700 mt-4 text-sm">
                  ⏱️ เราจะดำเนินการภายใน 7 วันทำการ
                </p>
              </div>

              <div className="bg-rose-50 rounded-2xl p-6 border border-rose-100">
                <h3 className="text-lg font-semibold text-rose-900 mb-3">ตัวเลือกที่ 3: ยกเลิกการเชื่อมต่อจาก Facebook</h3>
                <ol className="list-decimal pl-6 text-slate-700 space-y-2">
                  <li>เปิด Facebook และไปที่ <strong>Settings & Privacy</strong> → <strong>Settings</strong></li>
                  <li>คลิก <strong>Apps and Websites</strong> ในเมนูด้านซ้าย</li>
                  <li>ค้นหา <strong>PlantHub</strong> ในรายการแอพ</li>
                  <li>คลิก <strong>Remove</strong> เพื่อยกเลิกการเชื่อมต่อ</li>
                  <li>เลือก <strong>Delete your activity</strong> เพื่อลบข้อมูลทั้งหมด</li>
                </ol>
                <p className="text-slate-700 mt-4 text-sm">
                  ⚠️ หมายเหตุ: การยกเลิกการเชื่อมต่อจาก Facebook จะลบสิทธิ์การเข้าถึง 
                  แต่ไม่ได้ลบข้อมูลบัญชีใน PlantHub โดยอัตโนมัติ
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">ข้อมูลที่จะถูกลบ</h2>
              <p className="text-slate-700 mb-4">
                เมื่อคุณลบบัญชี ข้อมูลต่อไปนี้จะถูกลบถาวร:
              </p>
              <ul className="list-disc pl-6 text-slate-700 space-y-2">
                <li>ข้อมูลโปรไฟล์ (ชื่อ, อีเมล, รูปภาพ)</li>
                <li>ที่อยู่จัดส่งที่บันทึกไว้</li>
                <li>ประวัติการสั่งซื้อ (ยกเว้นข้อมูลที่จำเป็นต่อการดำเนินงานทางธุรกิจตามกฎหมาย)</li>
                <li>การตั้งค่าบัญชี</li>
                <li>ข้อมูลการเข้าสู่ระบบ</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">ข้อมูลที่อาจเก็บไว้</h2>
              <p className="text-slate-700 mb-4">
                เราอาจเก็บข้อมูลบางส่วนไว้ตามที่กฎหมายกำหนด:
              </p>
              <ul className="list-disc pl-6 text-slate-700 space-y-2">
                <li>บันทึกการทำธุรกรรมเพื่อวัตถุประสงค์ทางบัญชีและภาษี (7 ปี)</li>
                <li>ข้อมูลที่จำเป็นสำหรับการระงับข้อพิพาททางกฎหมาย</li>
                <li>บันทึกการติดต่อฝ่ายสนับสนุนลูกค้า</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">คำถามที่พบบ่อย</h2>
              
              <div className="space-y-4">
                <div className="border-l-4 border-emerald-500 pl-4">
                  <h3 className="font-semibold text-slate-900 mb-2">นานแค่ไหนที่ข้อมูลจะถูกลบ?</h3>
                  <p className="text-slate-700">
                    ข้อมูลจะถูกลบภายใน 24 ชั่วโมงหลังจากคุณขอลบบัญชี หรือภายใน 7 วันทำการหากติดต่อผ่านอีเมล
                  </p>
                </div>

                <div className="border-l-4 border-emerald-500 pl-4">
                  <h3 className="font-semibold text-slate-900 mb-2">ฉันสามารถกู้คืนบัญชีได้หรือไม่?</h3>
                  <p className="text-slate-700">
                    เมื่อลบบัญชีแล้ว ข้อมูลจะถูกลบถาวรและไม่สามารถกู้คืนได้ 
                    คุณจะต้องสมัครสมาชิกใหม่หากต้องการใช้บริการอีกครั้ง
                  </p>
                </div>

                <div className="border-l-4 border-emerald-500 pl-4">
                  <h3 className="font-semibold text-slate-900 mb-2">คำสั่งซื้อที่กำลังดำเนินการจะเป็นอย่างไร?</h3>
                  <p className="text-slate-700">
                    หากคุณมีคำสั่งซื้อที่กำลังดำเนินการอยู่ กรุณารอให้คำสั่งซื้อเสร็จสมบูรณ์ก่อนลบบัญชี 
                    หรือติดต่อฝ่ายสนับสนุนเพื่อขอยกเลิกคำสั่งซื้อ
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">ติดต่อเรา</h2>
              <p className="text-slate-700 mb-4">
                หากคุณมีคำถามเพิ่มเติมเกี่ยวกับการลบข้อมูล กรุณาติดต่อเราที่:
              </p>
              <div className="bg-emerald-50 rounded-2xl p-6 border border-emerald-100">
                <p className="text-slate-900 font-semibold mb-2">PlantHub Support</p>
                <p className="text-slate-700">📧 อีเมล: <a href="mailto:donny21001@gmail.com" className="text-emerald-600 hover:underline">donny21001@gmail.com</a></p>
                <p className="text-slate-700">🌐 เว็บไซต์: <a href="https://planthubb-sooty.vercel.app" className="text-emerald-600 hover:underline">planthubb-sooty.vercel.app</a></p>
                <p className="text-slate-700 mt-3">เวลาทำการ: จันทร์ - ศุกร์, 9:00 - 18:00 น.</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
