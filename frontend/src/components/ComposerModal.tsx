import React, { useState } from "react";
import { api } from "../lib/api";

interface ComposerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ComposerModal: React.FC<ComposerModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [pov, setPov] = useState("");
  const [location, setLocation] = useState("");
  const [keywords, setKeywords] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedScenes, setGeneratedScenes] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!pov.trim() || !location.trim() || !keywords.trim()) {
      setError("Please fill in all fields");
      return;
    }

    setIsGenerating(true);
    setError(null);
    setGeneratedScenes([]);

    try {
      const scenes = await api.generateScenes({
        pov: pov.trim(),
        location: location.trim(),
        keywords: keywords.trim(),
      });
      setGeneratedScenes(scenes);
    } catch (err) {
      setError("Failed to generate scenes. Please try again.");
      console.error("Generation error:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClose = () => {
    setPov("");
    setLocation("");
    setKeywords("");
    setGeneratedScenes([]);
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Scene Composer</h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Point of View
              </label>
              <input
                type="text"
                value={pov}
                onChange={(e) => setPov(e.target.value)}
                placeholder="e.g., First person, Alia's perspective"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., Docklands, foggy harbor"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Keywords
              </label>
              <input
                type="text"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="e.g., mystery, chase, discovery"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex justify-center mb-6">
            <button
              onClick={handleGenerate}
              disabled={
                isGenerating ||
                !pov.trim() ||
                !location.trim() ||
                !keywords.trim()
              }
              className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isGenerating ? "Generating..." : "Generate 3 Variants"}
            </button>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {generatedScenes.length > 0 && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-900">
                Generated Scenes
              </h3>
              {generatedScenes.map((scene, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-6"
                >
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-lg font-medium text-gray-900">
                      Variant {index + 1}
                    </h4>
                    <span className="text-sm text-gray-500">
                      {scene.length} characters
                    </span>
                  </div>
                  <div className="prose max-w-none">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {scene}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
