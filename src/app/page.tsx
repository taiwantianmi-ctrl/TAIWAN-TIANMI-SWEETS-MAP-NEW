"use client";

import { useState, useEffect } from "react";
import { useStores } from "@/hooks/useStores";
import { MapContainer } from "@/components/MapContainer";
import { StoreDetailModal } from "@/components/StoreDetailModal";
import { AdminPanel } from "@/components/AdminPanel";
import { Store, UserStats } from "@/types";
import { motion } from "framer-motion";
import { Settings, Map as MapIcon, Heart, CheckCircle, Info } from "lucide-react";

export default function Home() {
  const { stores, genres, loading } = useStores();
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [showAdmin, setShowAdmin] = useState(false);
  const [selectedGenreId, setSelectedGenreId] = useState<string | null>(null);
  const [userStats, setUserStats] = useState<UserStats>({ visited: [], favorites: [] });
  const [editingStore, setEditingStore] = useState<Partial<Store> | null>(null);
  const [googlePhotos, setGooglePhotos] = useState<string[]>([]);
  const [formStep, setFormStep] = useState<1 | 2>(1);

  // Load user stats from LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem("taiwan_sweet_stats");
    if (saved) {
      try {
        setUserStats(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse user stats", e);
      }
    }
  }, []);

  // Save user stats to LocalStorage
  const saveUserStats = (newStats: UserStats) => {
    setUserStats(newStats);
    localStorage.setItem("taiwan_sweet_stats", JSON.stringify(newStats));
  };

  const toggleStat = (type: "visited" | "favorites", id: string) => {
    const current = userStats[type];
    const updated = current.includes(id)
      ? current.filter(item => item !== id)
      : [...current, id];

    saveUserStats({ ...userStats, [type]: updated });
  };

  const filteredStores = selectedGenreId
    ? stores.filter(store => store.genres?.includes(selectedGenreId))
    : stores;

  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-pastel-pink/10">
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg border-4 border-pastel-pink text-pink-400"
        >
          <Heart fill="currentColor" size={32} />
        </motion.div>
        <p className="mt-4 font-bold text-sweet-brown tracking-widest animate-pulse">読み込み中...</p>
      </div>
    );
  }

  return (
    <main className="relative h-screen w-full overflow-hidden bg-white">
      {/* Top Floating Controls */}
      <div className="fixed top-0 left-0 right-0 z-40 p-2 md:p-4 flex flex-col gap-2 md:gap-4 pointer-events-none mb-safe">
        <div className="w-full max-w-4xl mx-auto flex justify-between items-start gap-2">
          <div className="pointer-events-auto">
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="bg-white/90 backdrop-blur-md px-4 md:px-6 py-2 md:py-4 rounded-2xl md:rounded-3xl shadow-xl border-2 md:border-4 border-white flex items-center gap-2 md:gap-4"
            >
              <div className="w-8 h-8 md:w-12 md:h-12 bg-pastel-pink rounded-xl md:rounded-2xl flex items-center justify-center shadow-sm text-white">
                <MapIcon size={18} className="md:w-6 md:h-6" />
              </div>
              <div>
                <h1 className="text-sm md:text-xl font-black text-sweet-brown tracking-tighter leading-tight">台湾の甘い旅</h1>
                <p className="text-[8px] md:text-[10px] font-bold text-pink-400 uppercase tracking-widest">Taiwan Sweet Journey</p>
              </div>
            </motion.div>

            <div className="mt-2 flex gap-1 md:gap-2">
              <div className="bg-white/80 backdrop-blur px-3 md:px-4 py-1.5 md:py-2 rounded-full shadow-sm flex items-center gap-1.5 text-[10px] md:text-xs font-bold text-pink-500">
                <Heart size={12} fill="currentColor" /> {userStats.favorites.length}
              </div>
              <div className="bg-white/80 backdrop-blur px-3 md:px-4 py-1.5 md:py-2 rounded-full shadow-sm flex items-center gap-1.5 text-[10px] md:text-xs font-bold text-emerald-600">
                <CheckCircle size={12} fill="currentColor" /> {userStats.visited.length}
              </div>
            </div>
          </div>
        </div>

        {/* Genre Filter Bar */}
        <div className="pointer-events-auto overflow-x-auto scrollbar-none pb-2 w-full max-w-4xl mx-auto">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex gap-2 px-2"
          >
            <button
              onClick={() => setSelectedGenreId(null)}
              className={`flex-shrink-0 px-4 md:px-5 py-2 md:py-2.5 rounded-2xl text-[10px] md:text-xs font-black transition-all shadow-md whitespace-nowrap ${!selectedGenreId ? "bg-sweet-brown text-white" : "bg-white/90 backdrop-blur text-sweet-brown hover:bg-white"}`}
            >
              すべて
            </button>
            {genres.map(genre => (
              <button
                key={genre.id}
                onClick={() => setSelectedGenreId(genre.id)}
                className={`flex-shrink-0 flex items-center gap-2 px-4 md:px-5 py-2 md:py-2.5 rounded-2xl text-[10px] md:text-xs font-black transition-all shadow-md whitespace-nowrap ${selectedGenreId === genre.id ? "bg-pastel-pink text-white ring-2 md:ring-4 ring-white" : "bg-white/90 backdrop-blur text-sweet-brown hover:bg-white"}`}
              >
                <div
                  style={{ backgroundColor: genre.color || "#ffffff" }}
                  className="w-4 h-4 md:w-5 md:h-5 rounded-md flex items-center justify-center text-[10px] md:text-xs shadow-sm"
                >
                  {genre.iconUrl}
                </div>
                {genre.nameJP}
              </button>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Map Container */}
      <div className="w-full h-full pt-16 md:pt-20 p-2">
        <MapContainer
          stores={filteredStores}
          genres={genres}
          onStoreSelect={(store) => {
            if (showAdmin) {
              setEditingStore(store);
              setFormStep(2);
            } else {
              setSelectedStore(store);
            }
          }}
          userStats={userStats}
          isAdminMode={showAdmin}
          onLocationSelect={(loc) => {
            if (showAdmin) {
              const newStore = {
                ...(editingStore || { images: [], videos: [], genres: [] }),
                lat: loc.lat,
                lng: loc.lng,
                nameJP: loc.name || editingStore?.nameJP || "",
              };
              setEditingStore(newStore);
              if (loc.photos) setGooglePhotos(loc.photos);
              setFormStep(1);
            }
          }}
        />
      </div>

      {/* Footer / Hint */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 pointer-events-none hidden md:block">
        <div className="bg-sweet-brown/80 backdrop-blur text-white px-6 py-2 rounded-full text-[10px] font-bold flex items-center gap-2 shadow-2xl uppercase tracking-widest border border-white/20">
          <Info size={14} /> Tap a pin to see the sweets!
        </div>
      </div>

      {/* Modals */}
      <StoreDetailModal
        store={selectedStore}
        onClose={() => setSelectedStore(null)}
        userStats={userStats}
        onToggleStat={toggleStat}
      />

      {showAdmin && (
        <AdminPanel
          stores={stores}
          genres={genres}
          onClose={() => setShowAdmin(false)}
          editingStore={editingStore}
          setEditingStore={setEditingStore}
          googlePhotos={googlePhotos}
          setGooglePhotos={setGooglePhotos}
          formStep={formStep}
          setFormStep={setFormStep}
        />
      )}

      {/* Hidden Admin Trigger */}
      <motion.div
        className="fixed bottom-6 right-6 z-[60] pointer-events-auto"
        whileHover={{ y: -5 }}
        transition={{ type: "spring", stiffness: 400, damping: 10 }}
      >
        <button
          onClick={() => setShowAdmin(true)}
          className="w-10 h-10 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 flex items-center justify-center text-transparent hover:text-gray-300 hover:bg-white/20 hover:border-white/30 transition-all duration-500"
          title="Admin Settings"
        >
          <Settings size={16} />
        </button>
      </motion.div>
    </main>
  );
}
