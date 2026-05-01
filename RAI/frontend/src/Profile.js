import React, { useEffect, useState } from 'react';
import { User, Mail, ShieldCheck, Calendar, LogOut, Camera } from 'lucide-react';
import api from './api';

function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/users/profile')
      .then(res => {
        setUser(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.log("Niste prijavljeni");
        setLoading(false);
      });
  }, []);

  if (loading) return (
    <div className="flex justify-center items-center h-screen text-green-700">
      <p className="animate-pulse font-medium">Nalaganje profila...</p>
    </div>
  );

  if (!user) return (
    <div className="flex justify-center items-center h-screen">
      <div className="bg-red-50 p-6 rounded-xl text-red-600 border border-red-100">
        Niste prijavljeni. Prosimo, prijavite se.
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8F9F8] p-6 md:p-12 font-sans text-slate-800">
      {/* Header sekcija v stilu InPlant */}
      <div className="max-w-4xl mx-auto mb-10">
        <span className="text-[#4B7337] font-bold tracking-widest text-sm uppercase">#MOJ PROFIL</span>
        <h1 className="text-4xl md:text-5xl font-extrabold mt-2 text-slate-900">
          Pozdravljeni, <span className="text-[#4B7337]">{user.ime}</span>!
        </h1>
      </div>

      {/* Glavna kartica s podatki */}
      <div className="max-w-4xl mx-auto bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="grid md:grid-cols-3">
          
          {/* Levi del: Slika ali Avatar */}
          <div className="bg-[#4B7337] p-10 flex flex-col items-center justify-center text-white">
            <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md mb-4 border border-white/30">
              <User size={64} strokeWidth={1.5} />
            </div>
            <p className="font-semibold text-xl">{user.vloga}</p>
            <button className="mt-6 flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full transition-all text-sm border border-white/20">
              <LogOut size={16} /> Odjava
            </button>
          </div>

          {/* Desni del: Podatki */}
          <div className="md:col-span-2 p-8 md:p-12">
            <h3 className="text-xl font-bold mb-8 text-slate-800 border-b pb-4">Osebni podatki</h3>
            
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-50 rounded-lg text-[#4B7337]">
                  <User size={20} />
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase font-bold tracking-tighter">Ime in Priimek</p>
                  <p className="text-lg font-medium">{user.ime} {user.priimek}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-50 rounded-lg text-[#4B7337]">
                  <Mail size={20} />
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase font-bold tracking-tighter">E-poštni naslov</p>
                  <p className="text-lg font-medium">{user.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-50 rounded-lg text-[#4B7337]">
                  <Calendar size={20} />
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase font-bold tracking-tighter">Član od</p>
                  <p className="text-lg font-medium">{new Date(user.datum_registracije).toLocaleDateString('sl-SI')}</p>
                </div>
              </div>
            </div>

            <div className="mt-12 flex gap-4">
              <button className="bg-[#4B7337] text-white px-8 py-3 rounded-full font-bold hover:bg-[#3d5e2d] transition-colors shadow-md">
                Uredi profil
              </button>
              <button className="border border-slate-200 text-slate-500 px-8 py-3 rounded-full font-bold hover:bg-slate-50 transition-colors">
                Nastavitve
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Profile;