"use client";
import { useState, useEffect, Suspense } from "react";

function PaymentContent() {
  const [cart, setCart] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState(""); // Address අලුතින්
  const [email, setEmail] = useState("");     // Email අලුතින්
  const [paymentMethod, setPaymentMethod] = useState("Bank Transfer");
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem("cart") || "[]");
    setCart(savedCart);
  }, []);

  const totalPrice = cart.reduce((sum, item) => sum + parseInt(item.price), 0);

  // Phone Number එක වැලිඩේට් කරන ෆන්ක්ෂන් එක
  const isPhoneValid = (num: string) => /^\d{10}$/.test(num);

  const handleOrder = async () => {
    if (cart.length === 0) return alert("කරුණාකර අවම වශයෙන් එක් පොතක්වත් තෝරන්න.");
    if (!isPhoneValid(phone)) return alert("කරුණාකර නිවැරදි ඉලක්කම් 10ක දුරකථන අංකයක් ඇතුළත් කරන්න.");
    if (!address.trim()) return alert("කරුණාකර බෙදාහැරිය යුතු ලිපිනය (Address) ඇතුළත් කරන්න.");
    if (!email.trim() || !email.includes("@")) return alert("කරුණාකර නිවැරදි Email ලිපිනයක් ඇතුළත් කරන්න.");

    setLoading(true);
    let receiptUrl = "COD ඇණවුමකි (No Receipt)";

    try {
      if (paymentMethod === "Bank Transfer") {
        if (!image) { alert("රිසිට් පත අප්ලෝඩ් කරන්න."); setLoading(false); return; }
        const formData = new FormData();
        formData.append("file", image);
        formData.append("upload_preset", "my_receipts");
        const res = await fetch("https://api.cloudinary.com/v1_1/dua7odtea/image/upload", { method: "POST", body: formData });
        const data = await res.json();
        receiptUrl = data.secure_url;
      }

      const bookList = cart.map(item => `• ${item.name} (Rs. ${item.price})`).join("%0A");
      const myWhatsApp = "94716373716";
      
      // WhatsApp මැසේජ් එකට අලුත් විස්තර එකතු කිරීම
      const message = `*අලුත් පොත් ඇණවුමක්!*%0A%0A*තෝරාගත් පොත්:*%0A${bookList}%0A%0A*මුළු මුදල:* Rs. ${totalPrice}%0A%0A*පාරිභෝගික විස්තර:*%0A👤 නම: ${name}%0A📞 දුරකථන: ${phone}%0A🏠 ලිපිනය: ${address}%0A📧 Email: ${email}%0A💳 ගෙවීම් ක්‍රමය: ${paymentMethod}%0A%0A*රිසිට් පත:* ${receiptUrl}`;
      
      window.open(`https://wa.me/${myWhatsApp}?text=${message}`, "_blank");

      localStorage.removeItem("cart");
      setTimeout(() => { window.location.href = "/"; }, 2000);

    } catch (err) { alert("දෝෂයක් ඇතිවිය."); } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans">
      <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
        <h2 className="text-xl font-bold text-gray-800 text-center mb-4 text-blue-600 italic uppercase tracking-tighter">Confirm Your Order</h2>
        
        <div className="bg-blue-50 p-4 rounded-xl mb-4 border border-blue-100 max-h-40 overflow-y-auto shadow-inner">
          {cart.map((item, index) => (
            <div key={index} className="flex justify-between border-b border-blue-100 py-1 last:border-0">
              <span className="text-sm font-medium text-blue-900">{item.name}</span>
              <span className="text-sm font-bold text-blue-600">Rs. {item.price}</span>
            </div>
          ))}
          <div className="mt-2 text-right font-black text-blue-700">Total: Rs. {totalPrice}</div>
        </div>

        <button onClick={() => window.location.href = "/"} className="w-full mb-4 py-2 text-xs font-bold text-blue-500 border-2 border-dashed border-blue-200 rounded-xl hover:bg-blue-50 transition-colors">
          + තවත් පොත් එක් කරන්න
        </button>

        <div className="space-y-3">
          <input type="text" placeholder="පාරිභෝගික නම" className="w-full p-3 border rounded-xl outline-blue-400 text-sm" onChange={(e) => setName(e.target.value)} />
          
          <div className="relative">
             <input type="tel" placeholder="දුරකථන අංකය (උදා: 0716373716)" className={`w-full p-3 border rounded-xl outline-blue-400 text-sm ${phone && !isPhoneValid(phone) ? 'border-red-500' : ''}`} onChange={(e) => setPhone(e.target.value)} />
             {phone && !isPhoneValid(phone) && <span className="text-[10px] text-red-500 mt-1 block ml-1">අංක 10ක් තිබිය යුතුය</span>}
          </div>

          <input type="email" placeholder="ඊමේල් ලිපිනය" className="w-full p-3 border rounded-xl outline-blue-400 text-sm" onChange={(e) => setEmail(e.target.value)} />
          
          <textarea placeholder="බෙදාහැරිය යුතු ලිපිනය (Address)" className="w-full p-3 border rounded-xl outline-blue-400 text-sm h-20" onChange={(e) => setAddress(e.target.value)}></textarea>
          
          <select className="w-full p-3 border rounded-xl font-semibold bg-gray-50 text-sm" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
            <option value="Bank Transfer">Bank Transfer (බැංකු තැන්පතු)</option>
            <option value="Cash on Delivery (COD)">Cash on Delivery (COD)</option>
          </select>

          {paymentMethod === "Bank Transfer" && (
            <div className="p-3 border-2 border-dashed border-blue-200 rounded-xl bg-blue-50/50">
              <p className="text-[10px] font-bold mb-1 text-gray-500 uppercase">බැංකු රිසිට් පත මෙතනට දාන්න:</p>
              <input type="file" accept="image/*" className="w-full text-xs" onChange={(e) => setImage(e.target.files ? e.target.files[0] : null)} />
            </div>
          )}

          <button 
            onClick={handleOrder} 
            disabled={!name || !isPhoneValid(phone) || !address || !email || (paymentMethod === "Bank Transfer" && !image) || loading} 
            className="w-full bg-green-500 text-white font-black py-4 rounded-xl hover:bg-green-600 disabled:bg-gray-300 shadow-lg uppercase transition-all"
          >
            {loading ? "Processing..." : "Confirm & Send WhatsApp"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PaymentPage() {
  return <Suspense fallback={<div>Loading...</div>}><PaymentContent /></Suspense>;
}