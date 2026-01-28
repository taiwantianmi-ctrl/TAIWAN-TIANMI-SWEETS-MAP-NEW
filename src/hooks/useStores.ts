"use client";

import { useState, useEffect } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "@/lib/firebase";
import { Store, Genre } from "@/types";

export function useStores() {
    const [stores, setStores] = useState<Store[]>([]);
    const [genres, setGenres] = useState<Genre[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storesRef = ref(db, "stores");
        const unsubscribeStores = onValue(storesRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const storesList = Object.keys(data).map((key) => ({
                    ...data[key],
                    id: key,
                    images: data[key].images || [],
                    videos: data[key].videos || [],
                    genres: data[key].genres || [],
                }));
                setStores(storesList);
            } else {
                setStores([]);
            }
            setLoading(false);
        });

        const genresRef = ref(db, "genres");
        const unsubscribeGenres = onValue(genresRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const genresList = Object.keys(data).map((key) => ({
                    ...data[key],
                    id: key,
                }));
                setGenres(genresList);
            } else {
                setGenres([]);
            }
        });

        return () => {
            unsubscribeStores();
            unsubscribeGenres();
        };
    }, []);

    return { stores, genres, loading };
}
