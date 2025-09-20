import { useState } from "react";
import RichTextEditor from "../components/RichTextEditor";
import { api } from "../lib/api";
import type { ExtractionResult } from "../types";

// Mock data for episodes and scenes
const MOCK_EPISODES = [
  { id: "ep1", title: "Episode 1: The Awakening" },
  { id: "ep2", title: "Episode 2: The Journey" },
];

const MOCK_SCENES = {
  ep1: [
    { id: "sc1", title: "Opening Scene" },
    { id: "sc2", title: "The Discovery" },
  ],
  ep2: [
    { id: "sc3", title: "The Departure" },
    { id: "sc4", title: "First Encounter" },
  ],
};

export default function WritePage() {
  const [activeTab, setActiveTab] = useState<"episode" | "scene">("episode");
  const [current, setCurrent] = useState({ episodeId: "ep1", sceneId: "sc1" });
  const [content, setContent] = useState(
    "<p>Start writing your story here...</p>",
  );
  const [extracting, setExtracting] = useState(false);
  const [result, setResult] = useState<ExtractionResult | null>(null);

  const handleExtract = async () => {
    setExtracting(true);
    try {
      // Strip HTML tags for extraction
      const textContent = content.replace(/<[^>]*>/g, "");
      const extractionResult = await api.extractEntities(textContent);
      setResult(extractionResult);
    } catch (error) {
      console.error("Extraction failed:", error);
    } finally {
      setExtracting(false);
    }
  };

  return (
    <div className="grid grid-cols-12 gap-4 p-4 h-full">
      {/* Episode/Scene sidebar */}
      <aside className="col-span-3 border rounded p-3 overflow-auto">
        <h3 className="font-semibold mb-2">Episodes & Scenes</h3>
        <ul className="space-y-2">
          {MOCK_EPISODES.map((ep) => (
            <li key={ep.id}>
              <div className="font-medium">{ep.title}</div>
              <ul className="ml-3 list-disc">
                {MOCK_SCENES[ep.id as keyof typeof MOCK_SCENES]?.map((sc) => (
                  <li key={sc.id}>
                    <button
                      className={`text-left ${current.sceneId === sc.id ? "font-semibold" : ""}`}
                      onClick={() =>
                        setCurrent({ episodeId: ep.id, sceneId: sc.id })
                      }
                    >
                      {sc.title}
                    </button>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </aside>

      {/* Editor + actions */}
      <section className="col-span-6">
        <div className="flex gap-2 mb-2">
          <button
            className={`px-3 py-1 rounded ${activeTab === "episode" ? "bg-black text-white" : "border"}`}
            onClick={() => setActiveTab("episode")}
          >
            Episode
          </button>
          <button
            className={`px-3 py-1 rounded ${activeTab === "scene" ? "bg-black text-white" : "border"}`}
            onClick={() => setActiveTab("scene")}
          >
            Scene
          </button>
        </div>
        <RichTextEditor value={content} onChange={setContent} />
        <div className="mt-3 flex gap-2">
          <button
            className="px-3 py-2 bg-black text-white rounded"
            onClick={handleExtract}
            disabled={extracting}
          >
            {extracting ? "Extracting…" : "Extract Entities"}
          </button>
          <button className="px-3 py-2 border rounded">Save</button>
          <button className="px-3 py-2 border rounded">Open Composer</button>
        </div>
      </section>

      {/* Extraction sidebar */}
      <aside className="col-span-3 border rounded p-3 overflow-auto">
        <h3 className="font-semibold mb-2">Entities (Suggestions)</h3>
        {!result && (
          <p className="text-sm text-gray-500">
            Run extraction to see suggestions.
          </p>
        )}
        {result && (
          <div className="space-y-4 text-sm">
            {(
              [
                "characters",
                "places",
                "events",
                "objects",
                "relationships",
              ] as const
            ).map((key) => (
              <div key={key}>
                <div className="font-medium capitalize">{key}</div>
                <ul className="ml-5 list-disc">
                  {(result as any)[key].map((it: any, i: number) => (
                    <li key={i}>
                      <span className="font-semibold">
                        {it.name || it.source + "→" + it.target || "—"}
                      </span>
                      {it.confidence != null && (
                        <span className="text-xs text-gray-500">
                          {" "}
                          ({Math.round(it.confidence * 100)}%)
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </aside>
    </div>
  );
}
