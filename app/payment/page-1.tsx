"use client";
import { useState, useEffect, Suspense } from "react";

function PaymentContent() {
  const [cart, setCart] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Bank Transfer");
  const [deliveryArea, setDeliveryArea] = useState("0");
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem("cart") || "[]");
    setCart(savedCart);
  }, []);

  const subTotal = cart.reduce((sum, item) => sum + parseInt(item.price), 0);
  const totalWithDelivery = subTotal + parseInt(deliveryArea);

  // දුරකථන අංකය ඉලක්කම් 10ක්දැයි බැලීම
  const isPhoneValid = (num: string) => /^\d{10}$/.test(num);

  const handleOrder = async () => {
    if (cart.length === 0) return alert("කරුණාකර අවම වශයෙන් එක් පොතක්වත් තෝරන්න.");
    if (!isPhoneValid(phone)) return alert("කරුණාකර ඉලක්කම් 10ක නිවැරදි දුරකථන අංකයක් ඇතුළත් කරන්න.");
    if (!address.trim()) return alert("කරුණාකර ලිපිනය ඇතුළත් කරන්න.");
    if (deliveryArea === "0") return alert("කරුණාකර Delivery Area එක තෝරන්න.");

    setLoading(true);
    let receiptUrl = "COD (No Receipt)";

    try {
      if (paymentMethod === "Bank Transfer") {
        if (!image) { alert("බැංකු රිසිට් පත ඇතුළත් කරන්න."); setLoading(false); return; }
        const formData = new FormData();
        formData.append("file", image);
        formData.append("upload_preset", "my_receipts");
        const res = await fetch("https://api.cloudinary.com/v1_1/dua7odtea/image/upload", { method: "POST", body: formData });
        const data = await res.json();
        receiptUrl = data.secure_url;
      }

      const bookList = cart.map(item => `• ${item.name} (Rs. ${item.price})`).join("%0A");
      const message = `*නව ඇණවුමක්!*%0A%0A*පොත්:*%0A${bookList}%0A%0A*මුළු මුදල (Delivery සමග):* Rs. ${totalWithDelivery}%0A%0A*පාරිභෝගික විස්තර:*%0A👤 නම: ${name}%0A📞 දුරකථන: ${phone}%0A🏠 ලිපිනය: ${address}%0A📧 Email: ${email}%0A💳 ගෙවීම් ක්‍රමය: ${paymentMethod}%0A%0A*රිසිට්:* ${receiptUrl}`;
      
      window.open(`https://wa.me/94760829235?text=${message}`, "_blank");
      localStorage.removeItem("cart");
      window.location.href = "/";

    } catch (err) { alert("දෝෂයක් ඇතිවිය."); } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
        <h2 className="text-xl font-bold text-center mb-4 text-blue-600">CONFIRM YOUR ORDER</h2>
        
        {/* Cart items list */}
        <div className="bg-blue-50 p-4 rounded-xl mb-2 border border-blue-100">
          {cart.map((item, index) => (
            <div key={index} className="flex justify-between items-center border-b border-blue-200 py-1 last:border-0">
              <span className="text-sm font-medium text-blue-900">{item.name}</span>
              <span className="text-sm font-bold text-blue-600">Rs. {item.price}</span>
            </div>
          ))}
          <div className="mt-2 text-right font-black text-blue-700">Sub Total: Rs. {subTotal}</div>
        </div>

        {/* 👇 අර නැති වුණ "+ තවත් පොත් එක් කරන්න" බටන් එක */}
        <button onClick={() => window.location.href = "/"} className="w-full mb-4 py-2 text-[10px] font-bold text-blue-500 border-2 border-dashed border-blue-200 rounded-xl hover:bg-blue-50">
          + තවත් පොත් එක් කරන්න
        </button>

        <div className="space-y-3">
          <select className="w-full p-3 border rounded-xl text-sm outline-blue-400" onChange={(e) => setDeliveryArea(e.target.value)}>
            <option value="0">Delivery Area තෝරන්න</option>
            <option value="350">කොළඹ ඇතුළත (Rs. 350)</option>
            <option value="500">කොළඹින් පිටත (Rs. 500)</option>
          </select>

          <input type="text" placeholder="පාරිභෝගික නම" className="w-full p-3 border rounded-xl text-sm outline-blue-400" onChange={(e) => setName(e.target.value)} />
          
          {/* 👇 Phone Number වැලිඩේෂන් එක */}
          <input type="tel" placeholder="දුරකථන අංකය (ඉලක්කම් 10)" className={`w-full p-3 border rounded-xl text-sm outline-blue-400 ${phone && !isPhoneValid(phone) ? 'border-red-500' : ''}`} onChange={(e) => setPhone(e.target.value)} />

          <input type="email" placeholder="ඊමේල් ලිපිනය" className="w-full p-3 border rounded-xl text-sm outline-blue-400" onChange={(e) => setEmail(e.target.value)} />
          
          <textarea placeholder="බෙදාහැරිය යුතු ලිපිනය" className="w-full p-3 border rounded-xl text-sm h-16 outline-blue-400" onChange={(e) => setAddress(e.target.value)}></textarea>
          
          <select className="w-full p-3 border rounded-xl font-semibold bg-gray-50 text-sm" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
            <option value="Bank Transfer">Bank Transfer (බැංකු තැන්පතු)</option>
            <option value="Cash on Delivery (COD)">Cash on Delivery (COD)</option>
          </select>

          {paymentMethod === "Bank Transfer" && (
            <div className="p-3 border rounded-xl bg-yellow-50 text-[11px] text-gray-700">
              <p className="font-bold">බැංකු විස්තර (Click to copy):</p>
              <p onClick={() => {navigator.clipboard.writeText("123456789"); alert("කොපි විය!")}} className="cursor-pointer hover:text-blue-600">BOC - 123456789 (Branch)</p>
              <input type="file" className="mt-2 w-full text-[10px]" onChange={(e) => setImage(e.target.files ? e.target.files[0] : null)} />
            </div>
          )}

          <div className="text-right font-black text-blue-700 text-lg">Total: Rs. {totalWithDelivery}</div>

          <button 
            onClick={handleOrder} 
            disabled={!name || !isPhoneValid(phone) || !address || loading} 
            className="w-full bg-green-500 text-white font-black py-4 rounded-xl shadow-lg uppercase disabled:bg-gray-300"
          >
            {loading ? "Processing..." : "CONFIRM & SEND WHATSAPP"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PaymentPage() {
  return <Suspense fallback={<div>Loading...</div>}><PaymentContent /></Suspense>;
}