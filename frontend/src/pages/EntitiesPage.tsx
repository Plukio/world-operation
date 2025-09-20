import { useMemo, useState, useEffect } from "react";
import { useFirebaseStore } from "../store/useFirebaseStore";

type Kind = "character" | "place" | "event" | "object" | "relationship";

const SAMPLE = {
  characters: [{ id: "c1", name: "Alia", description: "protagonist" }],
  places: [{ id: "p1", name: "Docklands", description: "harbor district" }],
  events: [{ id: "e1", name: "Eclipse Ceremony", description: "annual rite" }],
  objects: [],
  relationships: [
    {
      id: "r1",
      source: "Alia",
      target: "General Tal",
      relation_type: "confrontation",
    },
  ],
};

export default function EntitiesPage() {
  const [tab, setTab] = useState<Kind>("character");
  
  // Firebase store
  const { getEntities, getRelationships } = useFirebaseStore();
  
  // Load data on mount
  useEffect(() => {
    getEntities();
    getRelationships();
  }, [getEntities, getRelationships]);
  const [q, setQ] = useState("");
  const list = useMemo(() => {
    const map: any = {
      character: "characters",
      place: "places",
      event: "events",
      object: "objects",
      relationship: "relationships",
    };
    const arr = (SAMPLE as any)[map[tab]] as any[];
    return arr.filter((it) =>
      JSON.stringify(it).toLowerCase().includes(q.toLowerCase()),
    );
  }, [tab, q]);

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">Entities</h2>
        <input
          className="border rounded px-3 py-2 w-64"
          placeholder="Search entities"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>
      <div className="flex gap-2 mb-3">
        {(
          ["character", "place", "event", "object", "relationship"] as Kind[]
        ).map((k) => (
          <button
            key={k}
            className={`px-3 py-1 rounded ${tab === k ? "bg-black text-white" : "border"}`}
            onClick={() => setTab(k)}
          >
            {k[0].toUpperCase() + k.slice(1)}s
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {list.map((it: any) => (
          <div key={it.id} className="border rounded p-3 bg-white">
            <div className="font-medium">
              {it.name || `${it.source} → ${it.target}`}
            </div>
            <div className="text-sm text-gray-600">
              {it.description || it.relation_type || ""}
            </div>
            <div className="mt-2 flex gap-2">
              <button className="px-2 py-1 border rounded">Edit</button>
              <button className="px-2 py-1 border rounded">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
