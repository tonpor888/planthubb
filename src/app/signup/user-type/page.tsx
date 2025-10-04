'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthContext } from '../../providers/AuthProvider';
import { ArrowLeft, ShoppingBag, Store, Users, Heart, Star, CheckCircle } from 'lucide-react';

export default function UserTypeSelectionPage() {
  const router = useRouter();
  const { firebaseUser, profile } = useAuthContext();
  const [selectedType, setSelectedType] = useState<'customer' | 'seller' | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleContinue = () => {
    if (!selectedType) return;
    
    setIsLoading(true);
    
    if (selectedType === 'seller') {
      router.push('/signup/seller');
    } else {
      router.push('/signup/customer');
    }
  };

  const userTypes = [
    {
      id: 'customer',
      title: 'ผู้ซื้อ',
      description: 'ซื้อพืชและผลิตภัณฑ์จากร้านค้าต่างๆ',
      icon: ShoppingBag,
      color: 'emerald',
      features: [
        'ค้นหาพืชที่ต้องการได้ง่าย',
        'เปรียบเทียบราคาจากร้านค้าต่างๆ',
        'ระบบชำระเงินที่ปลอดภัย',
        'ติดตามสถานะการสั่งซื้อ',
        'รีวิวและให้คะแนนร้านค้า'
      ]
    },
    {
      id: 'seller',
      title: 'ผู้ขาย',
      description: 'ขายพืชและผลิตภัณฑ์ในร้านค้าของคุณ',
      icon: Store,
      color: 'blue',
      features: [
        'สร้างร้านค้าออนไลน์ของคุณ',
        'จัดการสินค้าและสต็อก',
        'รับคำสั่งซื้อและจัดการออเดอร์',
        'ระบบรายงานยอดขาย',
        'ติดต่อลูกค้าโดยตรง'
      ]
    }
  ];

  const getColorClasses = (color: string, isSelected: boolean) => {
    const colors = {
      emerald: {
        bg: isSelected ? 'bg-emerald-500' : 'bg-emerald-50',
        border: isSelected ? 'border-emerald-500' : 'border-emerald-200',
        text: isSelected ? 'text-white' : 'text-emerald-700',
        icon: isSelected ? 'text-white' : 'text-emerald-600',
        hover: 'hover:bg-emerald-100 hover:border-emerald-300'
      },
      blue: {
        bg: isSelected ? 'bg-blue-500' : 'bg-blue-50',
        border: isSelected ? 'border-blue-500' : 'border-blue-200',
        text: isSelected ? 'text-white' : 'text-blue-700',
        icon: isSelected ? 'text-white' : 'text-blue-600',
        hover: 'hover:bg-blue-100 hover:border-blue-300'
      }
    };
    return colors[color as keyof typeof colors];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-lime-50">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23d1fae5%22%20fill-opacity%3D%220.1%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50"></div>
      
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4 py-12">
        <div className="w-full max-w-4xl">
          {/* Header */}
          <div className="text-center mb-8">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 transition-colors mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              กลับไปหน้าก่อนหน้า
            </Link>
            
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-lime-400 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Users className="w-10 h-10 text-white" />
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              เลือกประเภทการใช้งาน
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              เลือกประเภทการใช้งานที่เหมาะสมกับคุณ เพื่อให้เราได้เตรียมฟีเจอร์ที่เหมาะสำหรับคุณ
            </p>
          </div>

          {/* User Type Cards */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {userTypes.map((type) => {
              const Icon = type.icon;
              const colors = getColorClasses(type.color, selectedType === type.id);
              
              return (
                <div
                  key={type.id}
                  onClick={() => setSelectedType(type.id as 'customer' | 'seller')}
                  className={`relative cursor-pointer transition-all duration-200 ${colors.bg} ${colors.border} border-2 rounded-3xl p-8 ${colors.hover} ${
                    selectedType === type.id ? 'ring-4 ring-opacity-20 ring-emerald-500' : ''
                  }`}
                >
                  {/* Selection Indicator */}
                  {selectedType === type.id && (
                    <div className="absolute top-4 right-4">
                      <CheckCircle className="w-6 h-6 text-emerald-500" />
                    </div>
                  )}
                  
                  {/* Icon */}
                  <div className={`w-16 h-16 ${colors.bg === 'bg-emerald-500' || colors.bg === 'bg-blue-500' ? 'bg-white/20' : colors.bg} rounded-2xl flex items-center justify-center mb-6`}>
                    <Icon className={`w-8 h-8 ${colors.icon}`} />
                  </div>
                  
                  {/* Content */}
                  <div className="mb-6">
                    <h3 className={`text-2xl font-bold mb-2 ${colors.text}`}>
                      {type.title}
                    </h3>
                    <p className={`text-lg ${colors.text} opacity-80`}>
                      {type.description}
                    </p>
                  </div>
                  
                  {/* Features */}
                  <div className="space-y-3">
                    {type.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${colors.icon === 'text-white' ? 'bg-white' : colors.icon}`}></div>
                        <span className={`text-sm ${colors.text} opacity-90`}>
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Continue Button */}
          <div className="text-center">
            <button
              onClick={handleContinue}
              disabled={!selectedType || isLoading}
              className="bg-gradient-to-r from-emerald-500 to-lime-400 text-white font-semibold py-4 px-12 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
            >
              {isLoading ? (
                <div className="flex items-center gap-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>กำลังดำเนินการ...</span>
                </div>
              ) : (
                'ดำเนินการต่อ'
              )}
            </button>
            
            {!selectedType && (
              <p className="text-sm text-gray-500 mt-4">
                กรุณาเลือกประเภทการใช้งาน
              </p>
            )}
          </div>

          {/* Footer */}
          <div className="text-center mt-8">
            <p className="text-xs text-gray-500">
              คุณสามารถเปลี่ยนประเภทการใช้งานได้ในภายหลัง
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
