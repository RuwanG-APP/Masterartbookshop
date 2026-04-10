"use client";
import { useState } from "react";

export default function PaymentPage() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [method, setMethod] = useState("COD");
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleOrder = async () => {
    setLoading(true);
    let receiptUrl = "";

    // බැංකු ගෙවීමක් නම් පින්තූරය Cloudinary වලට upload කරනවා
         
if (method === "Bank" && image) {
  const formData = new FormData();
  formData.append("file", image);
  formData.append("upload_preset", "my_receipts"); // මේ නම ස්ක්‍රීන්ෂොට් එකේ විදිහටම තියෙන්න ඕනේ

  try {
    const res = await fetch("https://api.cloudinary.com/v1_1/dua7odtea/image/upload", {
      method: "POST",
      body: formData,
    });

        const data = await res.json();
        
        if (data.secure_url) {
          receiptUrl = data.secure_url;
        } else {
          alert("පින්තූරය upload වුණේ නැහැ. කරුණාකර Cloudinary Preset එක 'Unsigned' ද කියා පරීක්ෂා කරන්න.");
          setLoading(false);
          return;
        }
      } catch (err) {
        alert("සම්බන්ධතා ගැටලුවක්! නැවත උත්සාහ කරන්න.");
        setLoading(false);
        return;
      }
    }

    // WhatsApp පණිවිඩය සකස් කිරීම
    // මෙතනට ඔයාගේ ඇත්තම WhatsApp අංකය දාන්න (උදා: 94716373716)
    const myWhatsApp = "94760829235"; 
    
    const paymentMsg = method === "COD" ? "භාණ්ඩ ලැබුණු පසු මුදල් ගෙවීම (COD)" : "බැංකු තැන්පතු (Bank Transfer)";
    const receiptLink = receiptUrl ? `%0A*රිසිට් පත:* ${receiptUrl}` : "";

    const message = `*අලුත් ඇණවුමක්!*%0A%0A*නම:* ${name}%0A*දුරකථන:* ${phone}%0A*ගෙවීම් ක්‍රමය:* ${paymentMsg}${receiptLink}`;
    
    window.open(`https://wa.me/${myWhatsApp}?text=${message}`, "_blank");
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold text-blue-600 mb-6 text-center">ඇණවුම තහවුරු කරන්න</h1>
        
        <div className="space-y-4">
          <input type="text" placeholder="ඔබේ නම" className="w-full p-3 border rounded-lg focus:outline-blue-500" onChange={(e) => setName(e.target.value)} />
          <input type="text" placeholder="දුරකථන අංකය" className="w-full p-3 border rounded-lg focus:outline-blue-500" onChange={(e) => setPhone(e.target.value)} />

          <div className="p-3 border rounded-lg bg-gray-50">
            <p className="text-sm font-medium mb-2 text-gray-600">ගෙවීම් ක්‍රමය තෝරන්න:</p>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="method" value="COD" checked={method === "COD"} onChange={() => setMethod("COD")} /> COD
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="method" value="Bank" checked={method === "Bank"} onChange={() => setMethod("Bank")} /> Bank Transfer
              </label>
            </div>
          </div>

          {method === "Bank" && (
            <div className="p-3 border-2 border-dashed border-blue-200 rounded-lg bg-blue-50 animate-pulse">
              <p className="text-sm font-medium mb-1 text-blue-700">බැංකු රිසිට් පත මෙතනට දාන්න:</p>
              <input type="file" accept="image/*" className="w-full text-sm" onChange={(e) => setImage(e.target.files ? e.target.files[0] : null)} />
            </div>
          )}

          <button 
            onClick={handleOrder}
            disabled={!name || !phone || (method === "Bank" && !image) || loading}
            className="w-full bg-green-500 text-white font-bold py-3 rounded-lg hover:bg-green-600 transition-all disabled:bg-gray-400 shadow-md"
          >
            {loading ? "සැකසෙමින් පවතී..." : "WHATSAPP හරහා ඇණවුම් කරන්න"}
          </button>
        </div>
      </div>
    </div>
  );
}