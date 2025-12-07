"use client";

import { useState } from "react";
import { FavoritesSidebar } from "@components/sidebar";
import { CheckIfLoading } from "@components/CheckIfLoading";
import { AddFavoriteModal } from "@components/favorite_modal";
import { useUser } from "../src/providers/User";

export default function Page() {
  const { user } = useUser();
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [date, setDate] = useState("");

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const [modal, setModal] = useState(false);
  const [refreshSidebar, setRefresh] = useState(false);

  const submitForm = async (latitude, longitude) => {
    setLoading(true);
    setError(null);

    const params = new URLSearchParams();
    params.append("lat", latitude);
    params.append("lng", longitude);
    if (date) params.append("date", date);

    try {
      const response = await fetch(`/api/search?${params.toString()}`);

      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err.message);
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFavoriteSelect = (location) => {
    const newLat = location.lat.toString();
    const newLng = location.lng.toString();

    setLat(newLat);
    setLng(newLng);

    submitForm(newLat, newLng);
  };

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    submitForm(lat, lng);
  };

  return (
    <div className="flex h-screen">
      <FavoritesSidebar
        onSelectLocation={handleFavoriteSelect}
        refresh={refreshSidebar}
      />
      <div className="flex-1 p-8 overflow-y-auto flex items-center justify-center">
        <CheckIfLoading loading={loading}>
          <div className="space-y-4 max-w-2xl w-full">
            <h1 className="text-2xl font-bold mb-6">Sunrise & Sunset Finder</h1>
            <div>
              <label className="block text-sm font-medium mb-1">
                Latitude
                <input
                  type="number"
                  value={lat}
                  onChange={(e) => setLat(e.target.value)}
                  step="0.000001"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Longitude
                <input
                  type="number"
                  value={lng}
                  onChange={(e) => setLng(e.target.value)}
                  step="0.000001"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Date (defaults to today)
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </label>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
              >
                Get Sunrise and Sunset
              </button>

              {user && lat && lng && (
                <button
                  onClick={() => setModal(true)}
                  className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 flex items-center gap-2"
                  title="Add to favorites"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  Favorite
                </button>
              )}
            </div>

            {error && (
              <div className="p-3 bg-red-100 text-red-700 rounded-md">
                Error: {error}
              </div>
            )}
            {result && (
              <div className="p-3 bg-green-100 text-green-700 rounded-md">
                <pre>{JSON.stringify(result, null, 2)}</pre>
              </div>
            )}
          </div>
        </CheckIfLoading>
      </div>

      <AddFavoriteModal
        isOpen={modal}
        onClose={() => setModal(false)}
        lat={lat}
        lng={lng}
        onAdd={() => setRefresh(!refreshSidebar)}
      />
    </div>
  );
}

