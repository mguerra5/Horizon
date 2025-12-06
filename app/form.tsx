"use client";
import { useState } from "react";
import { CheckIfLoading } from "../src/components/CheckIfLoading";

export default function Form() {
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [date, setDate] = useState("");

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const params = new URLSearchParams();
    params.append("lat", lat);
    params.append("lng", lng);
    if (date) params.append("date", date);

    try {
      const response = await fetch(`/api/search?${params.toString()}`);

      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }

      const data = await response.json();
      setResult(data); // to-do: parse necessary information from data and modify "result" output to display it nicely.
    } catch (err) {
      setError(err.message);
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <CheckIfLoading loading={loading}>
      <div className="space-y-4">
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
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
        >
          Get Sunrise and Sunset
        </button>

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
  );
}
