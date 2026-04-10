"use client";
import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function PaymentContent() {
  const searchParams = useSearchParams();
  const bookName = searchParams.get("book") || "පොතක් තෝරා නැත";
  const bookPrice = searchParams.get("price") || "0.00";

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Bank Transfer"); // Default එක Bank Transfer
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleOrder = async () => {
    setLoading(true);
    let receiptUrl = "COD ඇණවුමකි (No Receipt)";

    try {
      // 1. Bank Transfer නම් විතරක් Cloudinary වලට රිසිට් එක අප්ලෝඩ් කරනවා
      if (paymentMethod === "Bank Transfer") {
        if (!image) {
          alert("කරුණාකර බැංකු රිසිට් පත අප්ලෝඩ් කරන්න.");
          setLoading(false);
          return;
        }
        
        const formData = new FormData();
        formData.append("file", image);
        formData.append("upload_preset", "my_receipts"); 

        const res = await fetch("https://api.cloudinary.com/v1_1/dua7odtea/image/upload", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        receiptUrl = data.secure_url;
      }

      // 2. WhatsApp මැසේජ් එක සකස් කිරීම
      const myWhatsApp = "94760829235"; 
      const message = `*අලුත් පොත් ඇණවුමක්!*%0A%0A*පොත:* ${bookName}%0A*මිල:* Rs. ${bookPrice}%0A%0A*නම:* ${name}%0A*දුරකථන:* ${phone}%0A*ගෙවීම් ක්‍රමය:* ${paymentMethod}%0A%0A*රිසිට් පත:* ${receiptUrl}`;
      
      window.open(`https://wa.me/${myWhatsApp}?text=${message}`, "_blank");

    } catch (err) {
      alert("දෝෂයක් ඇතිවිය. නැවත උත්සාහ කරන්න.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">ඇණවුම තහවුරු කරන්න</h2>
        
        <div className="bg-blue-50 p-4 rounded-xl mb-6 border border-blue-100">
          <p className="text-blue-900 font-bold text-lg">{bookName}</p>
          <p className="text-blue-600 font-bold text-xl mt-1">Rs. {bookPrice}</p>
        </div>

        <div className="space-y-4">
          <input type="text" placeholder="ඔබේ නම" className="w-full p-4 border border-gray-300 rounded-xl outline-blue-500" onChange={(e) => setName(e.target.value)} />
          <input type="text" placeholder="දුරකථන අංකය" className="w-full p-4 border border-gray-300 rounded-xl outline-blue-500" onChange={(e) => setPhone(e.target.value)} />

          {/* 👇 COD / Bank Transfer තෝරන තැන */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-600 ml-1">ගෙවීම් ක්‍රමය තෝරන්න:</label>
            <select 
              className="w-full p-4 border border-gray-300 rounded-xl outline-blue-500 font-semibold bg-gray-50"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              <option value="Bank Transfer">Bank Transfer (බැංකු තැන්පතු)</option>
              <option value="Cash on Delivery (COD)">Cash on Delivery (COD)</option>
            </select>
          </div>

          {/* 👇 Bank Transfer නම් විතරක් රිසිට් එක පෙන්වනවා */}
          {paymentMethod === "Bank Transfer" && (
            <div className="p-4 border-2 border-dashed border-blue-200 rounded-xl bg-blue-50/50">
              <p className="text-sm font-semibold mb-2 text-gray-600">බැංකු රිසිට් පත (Receipt) මෙතනට දාන්න:</p>
              <input type="file" accept="image/*" className="w-full text-sm text-gray-500" onChange={(e) => setImage(e.target.files ? e.target.files[0] : null)} />
            </div>
          )}

          <button 
            onClick={handleOrder}
            disabled={!name || !phone || (paymentMethod === "Bank Transfer" && !image) || loading}
            className="w-full bg-green-500 text-white font-black py-4 rounded-xl hover:bg-green-600 transition-all disabled:bg-gray-300 shadow-lg text-lg"
          >
            {loading ? "මොහොතක් රැඳී සිටින්න..." : "ඇණවුම සම්පූර්ණ කරන්න"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center h-screen">ලෝඩ් වෙමින් පවතී...</div>}>
      <PaymentContent />
    </Suspense>
  );
}