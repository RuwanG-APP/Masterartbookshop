"use client";
import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

// පරාමිතීන් කියවීමට වෙනම කොටසක් (Next.js වල හොඳම ක්‍රමය)
function PaymentContent() {
  const searchParams = useSearchParams();
  const bookName = searchParams.get("book") || "පොතක් තෝරා නැත";
  const bookPrice = searchParams.get("price") || "0.00";

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleOrder = async () => {
    if (!image) return alert("කරුණාකර බැංකු රිසිට් පත අප්ලෝඩ් කරන්න.");
    setLoading(true);

    try {
      // 1. Cloudinary අප්ලෝඩ් එක
      const formData = new FormData();
      formData.append("file", image);
      formData.append("upload_preset", "my_receipts"); // ඔයාගේ Unsigned Preset එක

      const res = await fetch("https://api.cloudinary.com/v1_1/dua7odtea/image/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (data.secure_url) {
        // 2. WhatsApp මැසේජ් එක සකස් කිරීම
        const myWhatsApp = "94716373716"; // ඔයාගේ WhatsApp අංකය
        const message = `*අලුත් පොත් ඇණවුමක්!*%0A%0A*පොත:* ${bookName}%0A*මිල:* Rs. ${bookPrice}%0A%0A*පාරිභෝගික නම:* ${name}%0A*දුරකථන:* ${phone}%0A%0A*රිසිට් පත:* ${data.secure_url}`;
        
        window.open(`https://wa.me/${myWhatsApp}?text=${message}`, "_blank");
      } else {
        alert("රිසිට් එක අප්ලෝඩ් වුණේ නැහැ. නැවත උත්සාහ කරන්න.");
      }
    } catch (err) {
      alert("දෝෂයක් ඇතිවිය. කරුණාකර නැවත උත්සාහ කරන්න.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">ඇණවුම තහවුරු කරන්න</h2>
        
        {/* තෝරාගත් පොතේ විස්තර */}
        <div className="bg-blue-50 p-4 rounded-xl mb-6 border border-blue-100">
          <p className="text-blue-900 font-bold text-lg leading-tight">{bookName}</p>
          <p className="text-blue-600 font-bold text-xl mt-1">Rs. {bookPrice}</p>
        </div>

        <div className="space-y-4">
          <input type="text" placeholder="ඔබේ නම" className="w-full p-3 border border-gray-300 rounded-lg outline-blue-500" onChange={(e) => setName(e.target.value)} />
          <input type="text" placeholder="දුරකථන අංකය" className="w-full p-3 border border-gray-300 rounded-lg outline-blue-500" onChange={(e) => setPhone(e.target.value)} />

          <div className="p-4 border-2 border-dashed border-blue-200 rounded-xl bg-blue-50/50">
            <p className="text-sm font-semibold mb-2 text-gray-600">බැංකු රිසිට් පත (Receipt) මෙතනට දාන්න:</p>
            <input type="file" accept="image/*" className="w-full text-sm text-gray-500" onChange={(e) => setImage(e.target.files ? e.target.files[0] : null)} />
          </div>

          <button 
            onClick={handleOrder}
            disabled={!name || !phone || !image || loading}
            className="w-full bg-green-500 text-white font-bold py-4 rounded-xl hover:bg-green-600 transition-all disabled:bg-gray-300 shadow-lg"
          >
            {loading ? "රිසිට් පත යවමින්..." : "ඇණවුම සම්පූර්ණ කරන්න"}
          </button>
        </div>
      </div>
    </div>
  );
}

// Next.js වල useSearchParams පාවිච්චි කරන විට Suspense අවශ්‍ය වේ
export default function PaymentPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center h-screen">Loading...</div>}>
      <PaymentContent />
    </Suspense>
  );
}