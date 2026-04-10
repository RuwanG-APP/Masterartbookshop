"use client";
import { useState, useEffect, Suspense } from "react";

function PaymentContent() {
  const [cart, setCart] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Bank Transfer");
  const [deliveryArea, setDeliveryArea] = useState("0"); // Delivery Charge එක
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem("cart") || "[]");
    setCart(savedCart);
  }, []);

  const subTotal = cart.reduce((sum, item) => sum + parseInt(item.price), 0);
  const totalWithDelivery = subTotal + parseInt(deliveryArea);

  // Cart එකෙන් පොතක් අයින් කිරීම
  const removeFromCart = (index: number) => {
    const updatedCart = cart.filter((_, i) => i !== index);
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  const handleOrder = async () => {
    if (cart.length === 0) return alert("කරුණාකර අවම වශයෙන් එක් පොතක්වත් තෝරන්න.");
    if (!/^\d{10}$/.test(phone)) return alert("දුරකථන අංකය ඉලක්කම් 10ක් විය යුතුය.");
    if (!address || !email) return alert("Email සහ Address අනිවාර්යය වේ.");

    setLoading(true);
    let receiptUrl = "COD (No Receipt)";

    try {
      if (paymentMethod === "Bank Transfer") {
        if (!image) { alert("රිසිට් පත දාන්න."); setLoading(false); return; }
        const formData = new FormData();
        formData.append("file", image);
        formData.append("upload_preset", "my_receipts");
        const res = await fetch("https://api.cloudinary.com/v1_1/dua7odtea/image/upload", { method: "POST", body: formData });
        const data = await res.json();
        receiptUrl = data.secure_url;
      }

      const bookList = cart.map(item => `• ${item.name} (Rs. ${item.price})`).join("%0A");
      const message = `*නව ඇණවුමක්!*%0A%0A*පොත්:*%0A${bookList}%0A%0A*මුළු මුදල:* Rs. ${totalWithDelivery}%0A*නම:* ${name}%0A*ලිපිනය:* ${address}%0A*ගෙවීම් ක්‍රමය:* ${paymentMethod}%0A*රිසිට්:* ${receiptUrl}`;
      
      window.open(`https://wa.me/94760829235?text=${message}`, "_blank");
      localStorage.removeItem("cart");
      
      // Success Message එකක් දීලා Return වෙනවා
      alert("ස්තූතියි! ඔබේ ඇණවුම සාර්ථකයි.");
      window.location.href = "/";

    } catch (err) { alert("දෝෂයක්!"); } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
        <h2 className="text-xl font-bold text-center mb-4 text-blue-600">CONFIRM YOUR ORDER</h2>
        
        {/* Cart items with Remove Button */}
        <div className="bg-blue-50 p-4 rounded-xl mb-4 border border-blue-100">
          {cart.map((item, index) => (
            <div key={index} className="flex justify-between items-center border-b border-blue-100 py-2 last:border-0">
              <div className="text-sm">
                <p className="font-bold text-blue-900">{item.name}</p>
                <p className="text-blue-600">Rs. {item.price}</p>
              </div>
              <button onClick={() => removeFromCart(index)} className="text-red-500 font-bold px-2">X</button>
            </div>
          ))}
        </div>

        <div className="space-y-3">
          {/* Delivery Area Selection */}
          <select className="w-full p-3 border rounded-xl text-sm" onChange={(e) => setDeliveryArea(e.target.value)}>
            <option value="0">Delivery Area තෝරන්න</option>
            <option value="350">කොළඹ ඇතුළත (Rs. 350)</option>
            <option value="500">කොළඹින් පිටත (Rs. 500)</option>
          </select>

          <input type="text" placeholder="ඔබේ නම" className="w-full p-3 border rounded-xl text-sm" onChange={(e) => setName(e.target.value)} />
          <input type="tel" placeholder="දුරකථන අංකය (10 digits)" className="w-full p-3 border rounded-xl text-sm" onChange={(e) => setPhone(e.target.value)} />
          <input type="email" placeholder="ඊමේල් ලිපිනය" className="w-full p-3 border rounded-xl text-sm" onChange={(e) => setEmail(e.target.value)} />
          <textarea placeholder="බෙදාහැරිය යුතු ලිපිනය" className="w-full p-3 border rounded-xl text-sm h-16" onChange={(e) => setAddress(e.target.value)}></textarea>

          <select className="w-full p-3 border rounded-xl font-semibold bg-gray-50 text-sm" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
            <option value="Bank Transfer">Bank Transfer (බැංකු තැන්පතු)</option>
            <option value="Cash on Delivery (COD)">Cash on Delivery (COD)</option>
          </select>

          {/* Bank Details with Copy functionality */}
          {paymentMethod === "Bank Transfer" && (
            <div className="p-3 border rounded-xl bg-yellow-50 text-[11px] text-gray-700">
              <p className="font-bold">බැංකු විස්තර (Click to copy):</p>
              <p onClick={() => {navigator.clipboard.writeText("123456789"); alert("ගිණුම් අංකය කොපි විය!")}} className="cursor-pointer hover:text-blue-600 mt-1">BOC - 123456789 (Branch Name)</p>
              <input type="file" className="mt-2 w-full" onChange={(e) => setImage(e.target.files ? e.target.files[0] : null)} />
            </div>
          )}

          <div className="text-right font-black text-blue-700 text-lg">Total: Rs. {totalWithDelivery}</div>

          <button onClick={handleOrder} disabled={loading} className="w-full bg-green-500 text-white font-black py-4 rounded-xl shadow-lg uppercase">
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