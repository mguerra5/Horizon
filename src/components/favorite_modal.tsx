"use client";
import { useState } from "react";
import { supabase } from "@util/supabase/frontend";
import { useUser } from "@providers/User";

export function AddFavoriteModal({ isOpen, onClose, lat, lng, onAdd }) {
  const { user } = useUser();
  const [locationName, setLocationName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleSave = async () => {
    if (!user) {
      setError("You must be logged in to save favorites");
      return;
    }

    if (!locationName.trim()) {
      setError("Please enter a location name");
      return;
    }

    if (!lat || !lng) {
      setError("Invalid coordinates");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const { error: insertError } = await supabase
        .from("favorited_locations")
        .insert({
          user_id: user.id,
          location: locationName.trim(),
          lat: parseFloat(lat),
          lng: parseFloat(lng),
        });

      if (insertError) throw insertError;

      setLocationName("");
      onAdd();
      onClose();
    } catch (err) {
      setError(err.message);
      console.error("Error saving favorite:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setLocationName("");
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-xl font-bold mb-4">Save Favorite Location</h2>

        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">
            Latitude: {lat}, Longitude: {lng}
          </p>

          <label className="block text-sm font-medium mb-1">
            Location Name
            <input
              type="text"
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              placeholder="e.g., Home, Office, Favorite Park"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              autoFocus
            />
          </label>
        </div>

        {error && (
          <div className="mb-4 p-2 bg-red-100 text-red-700 text-sm rounded">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={handleClose}
            disabled={saving}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !locationName.trim()}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
