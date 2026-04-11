"use client";
import { useState, useEffect, Suspense } from "react";
// firebase.ts එක root එකේ තියෙන නිසා පියවර 2ක් පිටුපසට (payment -> app -> root)
import { db } from "../../firebase"; 
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

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

  // Cart එකෙන් පොතක් ඉවත් කිරීම (අර රතු "X" බටන් එක)
  const removeFromCart = (index: number) => {
    const updatedCart = cart.filter((_, i) => i !== index);
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  const subTotal = cart.reduce((sum, item) => sum + parseInt(item.price), 0);
  const totalWithDelivery = subTotal + parseInt(deliveryArea);

  const isPhoneValid = (num: string) => /^\d{10}$/.test(num);

  const handleOrder = async () => {
    if (cart.length === 0) return alert("කරුණාකර අවම වශයෙන් එක් පොතක්වත් තෝරන්න.");
    if (!name.trim()) return alert("කරුණාකර ඔබේ නම ඇතුළත් කරන්න.");
    if (!isPhoneValid(phone)) return alert("කරුණාකර ඉලක්කම් 10ක නිවැරදි දුරකථන අංකයක් ඇතුළත් කරන්න.");
    if (!address.trim()) return alert("කරුණාකර බෙදාහැරිය යුතු ලිපිනය ඇතුළත් කරන්න.");
    if (deliveryArea === "0") return alert("කරුණාකර Delivery Area එක තෝරන්න.");

    setLoading(true);
    let receiptUrl = "Cash on Delivery (COD)";

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

   
// Firestore එකට දත්ත සේව් කිරීම (ඔයා දැනටමත් ලියපු කොටස)
    await addDoc(collection(db, "orders"), {
      customerName: name,
      customerPhone: phone,
      address: address,
      email: email,
      books: cart.map(item => ({ name: item.name, price: item.price })),
      subTotal: subTotal,
      deliveryFee: parseInt(deliveryArea),
      totalAmount: totalWithDelivery,
      paymentMethod: paymentMethod,
      receiptUrl: receiptUrl,
      soldDate: now.toLocaleDateString('en-GB'),
      soldTime: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
      createdAt: serverTimestamp()
    });

    // ✅ මෙතන සිට අලුත් කොටස එකතු කරන්න:
    
    setLoading(false); // බටන් එක කැරකෙන එක නවත්වනවා
    alert("ඇණවුම සාර්ථකව සේව් වුණා!"); // පාරිභෝගිකයාට පණිවිඩයක් පෙන්වනවා

    // WhatsApp පණිවිඩය සකස් කිරීම
    const bookList = cart.map(item => `- ${item.name} (Rs. ${item.price})`).join('\n');
    const message = `*අලුත් ඇණවුමක්!*%0A%0A` +
      `*නම:* ${name}%0A` +
      `*දුරකථන:* ${phone}%0A` +
      `*ලිපිනය:* ${address}%0A%0A` +
      `*පොත්:*%0A${bookList}%0A%0A` +
      `*මුළු මුදල:* Rs. ${totalWithDelivery}%0A` +
      `*ගෙවීම් ක්‍රමය:* ${paymentMethod}%0A` +
      (paymentMethod === "Bank Transfer" ? `*රිසිට් පත:* ${receiptUrl}` : "");

    // WhatsApp එකට යොමු කිරීම (Redirect)
    window.location.href = `https://wa.me/94716373716?text=${message}`;

  } catch (error) {
    console.error("Error adding document: ", error);
    setLoading(false); // වැරැද්දක් වුණත් බටන් එක නිදහස් කරනවා
    alert("ඇණවුම සේව් කිරීමේදී දෝෂයක් ඇති වුණා. කරුණාකර නැවත උත්සාහ කරන්න.");
  }
};


      // WhatsApp පණිවිඩය
      const bookList = cart.map(item => `• ${item.name} (Rs. ${item.price})`).join("%0A");
      const message = `*නව ඇණවුමක්!*%0A%0A*පොත්:*%0A${bookList}%0A%0A*මුළු මුදල:* Rs. ${totalWithDelivery}%0A%0A*පාරිභෝගික විස්තර:*%0A👤 නම: ${name}%0A📞 දුරකථන: ${phone}%0A🏠 ලිපිනය: ${address}%0A📧 Email: ${email}%0A💳 ගෙවීම් ක්‍රමය: ${paymentMethod}%0A%0A*රිසිට්:* ${receiptUrl}`;
      
      window.open(`https://wa.me/94760829235?text=${message}`, "_blank");
      
      localStorage.removeItem("cart");
      alert("ස්තූතියි! ඔබේ ඇණවුම සාර්ථකව පද්ධතියේ සේව් විය.");
      window.location.href = "/";

    } catch (err) { 
      console.error(err);
      alert("දෝෂයක් ඇතිවිය."); 
    } finally { 
      setLoading(false); 
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
        <h2 className="text-xl font-bold text-center mb-4 text-blue-600 uppercase">Confirm Your Order</h2>
        
        {/* තෝරාගත් පොත් ලැයිස්තුව */}
        <div className="bg-blue-50 p-4 rounded-xl mb-2 border border-blue-100 shadow-inner">
          {cart.length > 0 ? (
            cart.map((item, index) => (
              <div key={index} className="flex justify-between items-center border-b border-blue-200 py-2 last:border-0">
                <div>
                  <p className="text-sm font-bold text-blue-900 uppercase">{item.name}</p>
                  <p className="text-xs font-bold text-blue-600">Rs. {item.price}</p>
                </div>
                {/* මකන බටන් එක (X) */}
                <button onClick={() => removeFromCart(index)} className="text-red-500 font-black hover:bg-red-100 px-2 py-1 rounded-lg transition-colors">
                  X
                </button>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 text-sm">මෙහි කිසිදු පොතක් නොමැත.</p>
          )}
          <div className="mt-2 text-right font-black text-blue-700">Sub Total: Rs. {subTotal}</div>
        </div>

        {/* තවත් පොත් එක් කරන්න බටන් එක */}
        <button onClick={() => window.location.href = "/"} className="w-full mb-4 py-2 text-[10px] font-bold text-blue-500 border-2 border-dashed border-blue-200 rounded-xl hover:bg-blue-50 transition-colors uppercase">
          + තවත් පොත් එක් කරන්න
        </button>

        <div className="space-y-3">
          <select className="w-full p-3 border rounded-xl text-sm outline-blue-400 bg-gray-50 font-medium" onChange={(e) => setDeliveryArea(e.target.value)}>
            <option value="0">Delivery Area තෝරන්න</option>
            <option value="350">කොළඹ ඇතුළත (Rs. 350)</option>
            <option value="500">කොළඹින් පිටත (Rs. 500)</option>
          </select>

          <input type="text" placeholder="ඔබේ නම" className="w-full p-3 border rounded-xl text-sm outline-blue-400" onChange={(e) => setName(e.target.value)} />
          
          <input type="tel" placeholder="දුරකථන අංකය (10 digits)" className="w-full p-3 border rounded-xl text-sm outline-blue-400" onChange={(e) => setPhone(e.target.value)} />

          <input type="email" placeholder="ඊමේල් ලිපිනය" className="w-full p-3 border rounded-xl text-sm outline-blue-400" onChange={(e) => setEmail(e.target.value)} />
          
          <textarea placeholder="බෙදාහැරිය යුතු ලිපිනය" className="w-full p-3 border rounded-xl text-sm h-16 outline-blue-400" onChange={(e) => setAddress(e.target.value)}></textarea>
          
          <select className="w-full p-3 border rounded-xl font-bold bg-blue-50 text-blue-800 text-sm outline-blue-400" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
            <option value="Bank Transfer">Bank Transfer (බැංකු තැන්පතු)</option>
            <option value="Cash on Delivery (COD)">Cash on Delivery (COD)</option>
          </select>

          {paymentMethod === "Bank Transfer" && (
            <div className="p-3 border rounded-xl bg-yellow-50 text-[11px] text-gray-700">
              <p className="font-bold mb-1 uppercase text-yellow-800">බැංකු විස්තර (Click to copy):</p>
              <p onClick={() => {navigator.clipboard.writeText("123456789"); alert("ගිණුම් අංකය කොපි විය!")}} className="cursor-pointer hover:text-blue-600 font-bold">BOC - 123456789 (Narammala)</p>
              <label className="block mt-2 font-bold text-gray-500">රිසිට් පත මෙතනට දාන්න:</label>
              <input type="file" className="mt-1 w-full text-[10px]" onChange={(e) => setImage(e.target.files ? e.target.files[0] : null)} />
            </div>
          )}

          <div className="text-right font-black text-blue-700 text-xl mt-2 italic">Total: Rs. {totalWithDelivery}</div>

          <button 
            onClick={handleOrder} 
            disabled={loading} 
            className="w-full bg-green-500 hover:bg-green-600 text-white font-black py-4 rounded-xl shadow-lg uppercase transition-all active:scale-95 disabled:bg-gray-300"
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