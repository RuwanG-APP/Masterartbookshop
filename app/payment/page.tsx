"use client";
import { useState, useEffect, Suspense } from "react";

function PaymentContent() {
  const [cart, setCart] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Bank Transfer");
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem("cart") || "[]");
    setCart(savedCart);
  }, []);

  const totalPrice = cart.reduce((sum, item) => sum + parseInt(item.price), 0);

  const handleOrder = async () => {
    if (cart.length === 0) return alert("කරුණාකර අවම වශයෙන් එක් පොතක්වත් තෝරන්න.");
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
      const message = `*අලුත් පොත් ඇණවුමක්!*%0A%0A*තෝරාගත් පොත්:*%0A${bookList}%0A%0A*මුළු මුදල:* Rs. ${totalPrice}%0A*නම:* ${name}%0A*දුරකථන:* ${phone}%0A*ගෙවීම් ක්‍රමය:* ${paymentMethod}%0A%0A*රිසිට් පත:* ${receiptUrl}`;
      
      window.open(`https://wa.me/${myWhatsApp}?text=${message}`, "_blank");

      // ඕඩර් එක අවසන් නිසා Cart එක හිස් කරමු
      localStorage.removeItem("cart");

      // තත්පර 2කින් ආපහු මුල් පිටුවට (Return)
      setTimeout(() => { window.location.href = "/"; }, 2000);

    } catch (err) { alert("දෝෂයක් ඇතිවිය."); } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans">
      <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
        <h2 className="text-xl font-bold text-gray-800 text-center mb-4 text-blue-600 italic uppercase tracking-tighter">Confirm Your Order</h2>
        
        {/* තෝරාගත් පොත් ලැයිස්තුව */}
        <div className="bg-blue-50 p-4 rounded-xl mb-4 border border-blue-100 max-h-40 overflow-y-auto">
          {cart.map((item, index) => (
            <div key={index} className="flex justify-between border-b border-blue-200 py-1 last:border-0">
              <span className="text-sm font-medium text-blue-900">{item.name}</span>
              <span className="text-sm font-bold text-blue-600">Rs. {item.price}</span>
            </div>
          ))}
          <div className="mt-2 text-right font-black text-blue-700">Total: Rs. {totalPrice}</div>
        </div>

        <button onClick={() => window.location.href = "/"} className="w-full mb-4 py-2 text-sm font-bold text-blue-500 border-2 border-dashed border-blue-300 rounded-xl hover:bg-blue-50">
          + තවත් පොත් එක් කරන්න
        </button>

        <div className="space-y-3">
          <input type="text" placeholder="ඔබේ නම" className="w-full p-3 border rounded-xl outline-none" onChange={(e) => setName(e.target.value)} />
          <input type="text" placeholder="දුරකථන අංකය" className="w-full p-3 border rounded-xl outline-none" onChange={(e) => setPhone(e.target.value)} />
          
          <select className="w-full p-3 border rounded-xl font-semibold bg-gray-50" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
            <option value="Bank Transfer">Bank Transfer (බැංකු තැන්පතු)</option>
            <option value="Cash on Delivery (COD)">Cash on Delivery (COD)</option>
          </select>

          {paymentMethod === "Bank Transfer" && (
            <div className="p-3 border-2 border-dashed border-blue-200 rounded-xl bg-blue-50/50">
              <p className="text-xs font-bold mb-1 text-gray-500">රිසිට් පත මෙතනට දාන්න:</p>
              <input type="file" accept="image/*" className="w-full text-xs" onChange={(e) => setImage(e.target.files ? e.target.files[0] : null)} />
            </div>
          )}

          <button onClick={handleOrder} disabled={!name || !phone || (paymentMethod === "Bank Transfer" && !image) || loading} className="w-full bg-green-500 text-white font-black py-4 rounded-xl hover:bg-green-600 disabled:bg-gray-300 shadow-lg uppercase">
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