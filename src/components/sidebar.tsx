"use client";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@util/supabase/frontend";
import { useUser } from "@providers/User";
import { CheckIfLoading } from "@components/CheckIfLoading";

interface Location {
  lat: number;
  lng: number;
  name?: string;
}

interface Favorite {
  id: string;
  location: string;
  lat: number;
  lng: number;
  user_id: string;
  created_at?: string;
}

interface FavoritesSidebarProps {
  onSelectLocation: (location: Location) => void;
  refresh: boolean;
}

export function FavoritesSidebar({
  onSelectLocation,
  refresh,
}: FavoritesSidebarProps) {
  const { user } = useUser();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFavorites = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from("favorited_locations")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setFavorites(data || []);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred");
      }
      console.error("Error fetching favorites:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchFavorites();
    } else {
      setFavorites([]);
    }
  }, [user, fetchFavorites, refresh]);

  const handleLocationClick = (favorite: Favorite) => {
    if (onSelectLocation) {
      onSelectLocation({
        lat: favorite.lat,
        lng: favorite.lng,
        name: favorite.location,
      });
    }
  };

  const handleDelete = async (
    e: React.MouseEvent<HTMLButtonElement>,
    favorite: Favorite,
  ) => {
    e.stopPropagation();

    if (!user) return;

    if (!confirm("Are you sure you want to delete this favorite location?")) {
      return;
    }

    try {
      const { error } = await supabase
        .from("favorited_locations")
        .delete()
        .eq("user_id", user.id)
        .eq("location", favorite.location);

      if (error) throw error;

      fetchFavorites();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred");
      }
      console.error("Error deleting favorite:", err);
    }
  };

  if (!user) {
    return (
      <div className="w-64 bg-gray-50 border-r border-gray-200 p-4">
        <div className="flex items-center justify-center h-full">
          <div className="text-center text-gray-500">
            <svg
              className="mx-auto h-12 w-12 text-gray-400 mb-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
              />
            </svg>
            <p className="text-sm font-medium">Login to add favorites!</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-64 bg-gray-50 border-r border-gray-200 p-4 overflow-y-auto">
      <h2 className="text-lg font-semibold mb-4 text-gray-800">
        Favorite Locations
      </h2>

      {error && (
        <div className="mb-4 p-2 bg-red-100 text-red-700 text-sm rounded">
          {error}
        </div>
      )}

      <CheckIfLoading loading={loading}>
        {favorites.length === 0 ? (
          <div className="text-center text-gray-500 text-sm py-8">
            <p>No favorites yet!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {favorites.map((favorite, index) => (
              <div
                key={favorite.id || `favorite-${index}`}
                className="relative group"
              >
                <button
                  onClick={() => handleLocationClick(favorite)}
                  className="w-full text-left p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-400 hover:shadow-sm transition-all"
                >
                  <div className="font-medium text-gray-800 text-sm mb-1 pr-8">
                    {favorite.location || "Unnamed Location"}
                  </div>
                  <div className="text-xs text-gray-500">
                    <div>Lat: {favorite.lat?.toFixed(4)}</div>
                    <div>Lng: {favorite.lng?.toFixed(4)}</div>
                  </div>
                </button>
                <button
                  onClick={(e) => handleDelete(e, favorite)}
                  className="absolute top-2 right-2 p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                  title="Delete favorite"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </CheckIfLoading>
    </div>
  );
}
