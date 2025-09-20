import { useState } from "react";
import { api } from "../lib/api";
import type { ExtractionResult } from "../types";

interface WritingCanvasProps {
  onExtractionComplete?: (result: ExtractionResult) => void;
}

export const WritingCanvas = ({ onExtractionComplete }: WritingCanvasProps) => {
  const [sceneText, setSceneText] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionResult, setExtractionResult] =
    useState<ExtractionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleExtractEntities = async () => {
    if (!sceneText.trim()) {
      setError("Please enter some scene text first");
      return;
    }

    setIsExtracting(true);
    setError(null);

    try {
      const result = await api.extractEntities(sceneText);
      setExtractionResult(result);
      onExtractionComplete?.(result);
    } catch (err) {
      setError("Failed to extract entities. Please try again.");
      console.error("Extraction error:", err);
    } finally {
      setIsExtracting(false);
    }
  };

  const renderEntityGroup = (title: string, entities: any[]) => (
    <div className="mb-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>
      {entities.length === 0 ? (
        <p className="text-gray-500 text-sm">No {title.toLowerCase()} found</p>
      ) : (
        <div className="space-y-2">
          {entities.map((entity, index) => (
            <div key={index} className="bg-gray-50 p-3 rounded-lg">
              <div className="flex justify-between items-start mb-1">
                <span className="font-medium text-gray-900">{entity.name}</span>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  {(entity.confidence * 100).toFixed(0)}%
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-2">{entity.description}</p>
              {entity.spans && entity.spans.length > 0 && (
                <div className="text-xs text-gray-500">
                  Spans:{" "}
                  {entity.spans
                    .map((span: any) => `${span.start_idx}-${span.end_idx}`)
                    .join(", ")}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Main Writing Area */}
      <div className="flex-1 p-6">
        <div className="h-full flex flex-col">
          <div className="mb-4">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Writing Canvas
            </h1>
            <p className="text-gray-600">
              Write your scene and extract entities to build your world
            </p>
          </div>

          <div className="flex-1 flex flex-col">
            <textarea
              value={sceneText}
              onChange={(e) => setSceneText(e.target.value)}
              placeholder="Write your scene here... (e.g., 'Alia runs through the fog toward Docklands...')"
              className="flex-1 w-full p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />

            <div className="mt-4 flex justify-between items-center">
              <div className="text-sm text-gray-500">
                {sceneText.length} characters
              </div>
              <button
                onClick={handleExtractEntities}
                disabled={isExtracting || !sceneText.trim()}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {isExtracting ? "Extracting..." : "Extract Entities"}
              </button>
            </div>

            {error && (
              <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Entity Results Sidebar */}
      {extractionResult && (
        <div className="w-96 bg-white border-l border-gray-200 p-6 overflow-y-auto">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Extracted Entities
          </h2>

          {renderEntityGroup("Characters", extractionResult.characters)}
          {renderEntityGroup("Places", extractionResult.places)}
          {renderEntityGroup("Events", extractionResult.events)}
          {renderEntityGroup("Objects", extractionResult.objects)}

          {extractionResult.relationships.length > 0 && (
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Relationships
              </h3>
              <div className="space-y-2">
                {extractionResult.relationships.map((rel, index) => (
                  <div key={index} className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-sm font-medium text-gray-900">
                        {rel.source} → {rel.target}
                      </span>
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                        {(rel.confidence * 100).toFixed(0)}%
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{rel.relation_type}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
