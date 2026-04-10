"use client";
import { useState } from "react";

export default function PaymentPage() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleWhatsApp = () => {
    setLoading(true);
    
    // මෙතන ඔයාගේ WhatsApp අංකය දෙන්න (උදා: 94712345678)
    const myWhatsApp = "94760829235"; 
    
    const message = `*අලුත් රිසිට් පතක් ආවා!*%0A%0A*නම:* ${name}%0A*දුරකථන අංකය:* ${phone}%0A%0A(කරුණාකර රිසිට් පත මෙතනින් එවන්න)`;
    const url = `https://wa.me/${myWhatsApp}?text=${message}`;
    
    window.open(url, "_blank");
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold text-blue-600 mb-6 text-center">මුදල් ගෙවූ රිසිට්පත එවන්න</h1>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">ඔබේ නම</label>
            <input 
              type="text" 
              className="w-full p-3 border border-gray-300 rounded-lg mt-1"
              placeholder="නම ඇතුළත් කරන්න"
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">දුරකථන අංකය</label>
            <input 
              type="text" 
              className="w-full p-3 border border-gray-300 rounded-lg mt-1"
              placeholder="07XXXXXXXX"
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">රිසිට් පත තෝරන්න</label>
            <input 
              type="file" 
              accept="image/*"
              className="w-full p-2 border border-dashed border-blue-400 rounded-lg mt-1 bg-blue-50"
              onChange={(e) => setImage(e.target.files ? e.target.files[0] : null)}
            />
          </div>

          <button 
            onClick={handleWhatsApp}
            disabled={!name || !phone || !image || loading}
            className="w-full bg-green-500 text-white font-bold py-3 rounded-lg hover:bg-green-600 transition-all disabled:bg-gray-400"
          >
            {loading ? "සකසමින් පවතිී..." : "WHATSAPP හරහා එවන්න"}
          </button>
        </div>
        
        <p className="text-xs text-gray-400 mt-4 text-center">
          මුලින් විස්තර පුරවා රිසිට් පත තෝරන්න. පසුව WhatsApp බොත්තම ඔබන්න.
        </p>
      </div>
    </div>
  );
}