"use client";

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, ShoppingCart, Lock, Unlock, Edit3 } from 'lucide-react';
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";

// 👇 Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyB2FOXA42Df70SE59MZgVEAV16eipXKnik",
  authDomain: "my-bookshop-130c8.firebaseapp.com",
  projectId: "my-bookshop-130c8",
  storageBucket: "my-bookshop-130c8.firebasestorage.app",
  messagingSenderId: "887183389723",
  appId: "1:887183389723:web:e8b268bf13529f7f1a74be"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 👇 Categories ලැයිස්තුව
const bookCategories = [
  "නවකතා", "කෙටිකතා", "විද්‍යාප්‍රබන්ධ", "කවි", 
  "පරිවර්ථන", "ඉතිහාසය", "ගවේශණ", "Horror", "Thriller"
];

export default function Home() {
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingBook, setEditingBook] = useState<any>(null);
  const [newBook, setNewBook] = useState({ name: '', price: '', image: '', category: '' }); // category ඇඩ් කළා
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "books"));
        const booksData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setBooks(booksData);
      } catch (error) {
        console.error("Error fetching books: ", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBooks();
  }, []);

  // Filter Logic
  const filteredBooks = selectedCategory === "All" 
    ? books 
    : books.filter(book => book.category === selectedCategory);

  const handleAdminToggle = () => {
    if (!isAdmin) {
      const pass = prompt("ඇඩ්මින් මුරපදය ඇතුළත් කරන්න:");
      if (pass === "123") setIsAdmin(true);
      else alert("මුරපදය වැරදියි!");
    } else {
      setIsAdmin(false);
    }
  };

  const saveBook = async () => {
    if (editingBook) {
      const bookRef = doc(db, "books", editingBook.id);
      await updateDoc(bookRef, {
        name: editingBook.name,
        price: editingBook.price,
        image: editingBook.image,
        category: editingBook.category
      });
      setBooks(books.map(b => b.id === editingBook.id ? { ...editingBook } : b));
      setEditingBook(null);
    } else {
      if (newBook.name && newBook.price && newBook.category) {
        const docRef = await addDoc(collection(db, "books"), newBook);
        setBooks([...books, { ...newBook, id: docRef.id }]);
        setShowAddModal(false);
        setNewBook({ name: '', price: '', image: '', category: '' });
      } else {
        alert("කරුණාකර සියලු විස්තර (වර්ගය ඇතුළුව) ඇතුළත් කරන්න.");
      }
    }
  };

  const deleteBook = async (id: string) => {
    if (window.confirm("මේ පොත මකන්න ඕනෙද?")) {
      await deleteDoc(doc(db, "books", id));
      setBooks(books.filter(b => b.id !== id));
    }
  };

  const goToPayment = (book: any) => {
    const existingCart = JSON.parse(localStorage.getItem("cart") || "[]");
    if (!existingCart.find((item: any) => item.name === book.name)) {
      existingCart.push({ name: book.name, price: book.price });
      localStorage.setItem("cart", JSON.stringify(existingCart));
    }
    window.location.href = "/payment";
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-12 font-sans">
      <header className="text-center mb-10">
        <h1 className="text-6xl font-black text-blue-600 italic uppercase tracking-tighter">My Bookshop</h1>
      </header>

      {/* 👇 Category Filter Bar */}
      <div className="flex overflow-x-auto pb-8 gap-2 no-scrollbar justify-start md:justify-center max-w-6xl mx-auto">
        <button 
          onClick={() => setSelectedCategory("All")}
          className={`px-6 py-2 rounded-full text-xs font-bold transition-all shadow-sm whitespace-nowrap ${selectedCategory === "All" ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border'}`}
        >
          සියල්ල
        </button>
        {bookCategories.map(cat => (
          <button 
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-6 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all shadow-sm ${selectedCategory === cat ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border'}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center text-2xl font-bold text-gray-400 mt-20">පොත් ලෝඩ් වෙමින් පවතී... ⏳</div>
      ) : (
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
          {filteredBooks.map((book) => (
            <div key={book.id} className="bg-white rounded-[40px] shadow-2xl overflow-hidden border border-gray-100 relative group transition-all hover:scale-105">
              {isAdmin && (
                <div className="absolute top-4 right-4 flex gap-2 z-10">
                  <button onClick={() => setEditingBook(book)} className="bg-blue-500 text-white p-3 rounded-full shadow-lg hover:bg-blue-600 transition-colors"><Edit3 size={18}/></button>
                  <button onClick={() => deleteBook(book.id)} className="bg-red-500 text-white p-3 rounded-full shadow-lg hover:bg-red-600 transition-colors"><Trash2 size={18}/></button>
                </div>
              )}
              <img src={book.image} alt={book.name} className="w-full h-72 object-cover" />
              <div className="p-8 text-center">
                <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">{book.category}</span>
                <h2 className="text-2xl font-bold text-gray-800 mt-1">{book.name}</h2>
                <p className="text-blue-600 font-black text-3xl mt-2 font-mono">Rs. {book.price}</p>
                <button onClick={() => goToPayment(book)} className="mt-6 bg-green-500 text-white px-8 py-4 rounded-2xl w-full font-black text-lg shadow-lg flex items-center justify-center gap-2 hover:bg-green-600 transition-all">
                  <ShoppingCart size={20}/> ORDER VIA WHATSAPP
                </button>
              </div>
            </div>
          ))}

          {isAdmin && (
            <button onClick={() => setShowAddModal(true)} className="border-4 border-dashed border-blue-200 rounded-[40px] flex flex-col items-center justify-center p-10 text-blue-400 hover:bg-blue-50 transition-all min-h-[400px]">
              <Plus size={60} strokeWidth={3} />
              <span className="font-black text-xl mt-4">ADD NEW BOOK</span>
            </button>
          )}
        </div>
      )}

      {/* --- ADD / EDIT MODAL --- */}
      {(showAddModal || editingBook) && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white p-8 rounded-[35px] w-full max-w-md shadow-2xl overflow-y-auto max-h-[90vh]">
            <h2 className="text-2xl font-black mb-6 text-gray-800 border-b pb-2">{editingBook ? "පොත සංස්කරණය" : "අලුත් පොතක් ඇතුළත් කරන්න"}</h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-400 ml-1">පොතේ නම</label>
                <input value={editingBook ? editingBook.name : newBook.name} className="w-full bg-gray-100 p-4 rounded-xl border outline-none focus:border-blue-500" onChange={e => editingBook ? setEditingBook({...editingBook, name: e.target.value}) : setNewBook({...newBook, name: e.target.value})} />
              </div>
              
              {/* 👇 Category Select in Modal */}
              <div>
                <label className="text-xs font-bold text-gray-400 ml-1">පොතේ වර්ගය (Category)</label>
                <select 
                  className="w-full bg-gray-100 p-4 rounded-xl border outline-none focus:border-blue-500 font-bold"
                  value={editingBook ? editingBook.category : newBook.category}
                  onChange={e => editingBook ? setEditingBook({...editingBook, category: e.target.value}) : setNewBook({...newBook, category: e.target.value})}
                >
                  <option value="">තෝරන්න...</option>
                  {bookCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 ml-1">මිල (රු.)</label>
                <input value={editingBook ? editingBook.price : newBook.price} className="w-full bg-gray-100 p-4 rounded-xl border outline-none focus:border-blue-500" onChange={e => editingBook ? setEditingBook({...editingBook, price: e.target.value}) : setNewBook({...newBook, price: e.target.value})} />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 ml-1">පිටකවරය (ලින්ක් එක)</label>
                <input value={editingBook ? editingBook.image : newBook.image} className="w-full bg-gray-100 p-4 rounded-xl border outline-none focus:border-blue-500" onChange={e => editingBook ? setEditingBook({...editingBook, image: e.target.value}) : setNewBook({...newBook, image: e.target.value})} />
              </div>
              <div className="flex gap-4 pt-4">
                <button onClick={saveBook} className="bg-blue-600 text-white flex-1 py-4 rounded-2xl font-black text-lg shadow-lg hover:bg-blue-700 transition-colors">SAVE BOOK</button>
                <button onClick={() => {setShowAddModal(false); setEditingBook(null);}} className="bg-gray-200 text-gray-600 flex-1 py-4 rounded-2xl font-black text-lg hover:bg-gray-300 transition-colors">CANCEL</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <footer className="text-center mt-20 pb-10">
        <button onClick={handleAdminToggle} className="flex items-center gap-2 mx-auto bg-gray-200 text-gray-600 px-6 py-2 rounded-full font-bold text-sm hover:bg-gray-300 transition-colors shadow-sm">
          {isAdmin ? <Unlock size={16}/> : <Lock size={16}/>}
          {isAdmin ? "EXIT ADMIN MODE" : "ADMIN LOGIN"}
        </button>
        <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mt-4">© 2026 MY BOOKSHOP - NARAMMALA</p>
      </footer>
    </div>
  );
}