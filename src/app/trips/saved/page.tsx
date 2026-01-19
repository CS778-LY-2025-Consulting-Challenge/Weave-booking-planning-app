"use client";
import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { getSavedTrips, saveTrip, updateTrip, deleteTrip } from "@/lib/savedTrips";

interface Trip {
  destination: string;
  date: string;
  [key: string]: any;
}

export default function SavedTripsPage() {
  const { user } = useUser();
  const userId = user?.id;
  const [trips, setTrips] = useState<Record<string, Trip>>({});
  const [loading, setLoading] = useState(true);
  const [newTrip, setNewTrip] = useState<Trip>({ destination: "", date: "" });
  const [editTripId, setEditTripId] = useState<string | null>(null);
  const [editTrip, setEditTrip] = useState<Trip>({ destination: "", date: "" });

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    getSavedTrips(userId).then((data) => {
      setTrips(data || {});
      setLoading(false);
    });
  }, [userId]);

  const handleAddTrip = async () => {
    if (!userId || !newTrip.destination || !newTrip.date) return;
    await saveTrip(userId, newTrip);
    setNewTrip({ destination: "", date: "" });
    const data = await getSavedTrips(userId);
    setTrips(data || {});
  };

  const handleEditTrip = (id: string, trip: Trip) => {
    setEditTripId(id);
    setEditTrip({ ...trip });
  };

  const handleUpdateTrip = async () => {
    if (!userId || !editTripId) return;
    await updateTrip(userId, editTripId, editTrip);
    setEditTripId(null);
    setEditTrip({ destination: "", date: "" });
    const data = await getSavedTrips(userId);
    setTrips(data || {});
  };

  const handleDeleteTrip = async (tripId: string) => {
    if (!userId) return;
    await deleteTrip(userId, tripId);
    const data = await getSavedTrips(userId);
    setTrips(data || {});
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 text-center">Saved Trips</h1>
      {/* Add Trip Form */}
      <div className="mb-8 flex flex-col md:flex-row gap-4 items-center justify-center">
        <input
          type="text"
          placeholder="Destination"
          className="border rounded px-3 py-2 w-48"
          value={newTrip.destination}
          onChange={e => setNewTrip({ ...newTrip, destination: e.target.value })}
        />
        <input
          type="date"
          className="border rounded px-3 py-2 w-40"
          value={newTrip.date}
          onChange={e => setNewTrip({ ...newTrip, date: e.target.value })}
        />
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          onClick={handleAddTrip}
        >
          Add Trip
        </button>
      </div>
      {/* Trips List */}
      <ul className="space-y-4">
        {Object.entries(trips).length === 0 && (
          <li className="text-center text-gray-500">No saved trips yet.</li>
        )}
        {Object.entries(trips).map(([id, trip]) => (
          <li key={id} className="border rounded p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white/80 shadow">
            {editTripId === id ? (
              <div className="flex flex-col md:flex-row gap-2 md:items-center w-full">
                <input
                  type="text"
                  className="border rounded px-2 py-1 w-40"
                  value={editTrip.destination}
                  onChange={e => setEditTrip({ ...editTrip, destination: e.target.value })}
                />
                <input
                  type="date"
                  className="border rounded px-2 py-1 w-32"
                  value={editTrip.date}
                  onChange={e => setEditTrip({ ...editTrip, date: e.target.value })}
                />
                <button
                  className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                  onClick={handleUpdateTrip}
                >
                  Save
                </button>
                <button
                  className="bg-gray-400 text-white px-3 py-1 rounded hover:bg-gray-500"
                  onClick={() => setEditTripId(null)}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex flex-col md:flex-row gap-2 md:items-center w-full justify-between">
                <span className="font-semibold">{trip.destination}</span>
                <span className="text-gray-600">{trip.date}</span>
                <div className="flex gap-2 mt-2 md:mt-0">
                  <button
                    className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                    onClick={() => handleEditTrip(id, trip)}
                  >
                    Edit
                  </button>
                  <button
                    className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                    onClick={() => handleDeleteTrip(id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
