import { useState } from "react";

interface MusePanelProps {
  onConstraintGenerated: (constraint: string) => void;
  onObstacleEscalated: (options: string[]) => void;
  onPOVSwapped: (text: string) => void;
  onSensoryEnhanced: (text: string) => void;
  onBeatTemplateInserted: (template: string) => void;
  onWhatIfForked: (whatIf: string) => void;
}

export default function MusePanel({
  onConstraintGenerated,
  onObstacleEscalated,
  onPOVSwapped,
  onSensoryEnhanced,
  onBeatTemplateInserted,
  onWhatIfForked,
}: MusePanelProps) {
  const [activeTab, setActiveTab] = useState<"entities" | "muse">("muse");
  const [constraintDeck, setConstraintDeck] = useState({
    tension: 0.5,
    pace: 0.5,
    formality: 0.5,
    dialogue_percent: 0.3,
    imagery: 0.5,
  });
  const [sensoryWheel, setSensoryWheel] = useState({
    sight: false,
    sound: false,
    scent: false,
    touch: false,
    taste: false,
  });

  const handleMuseDice = async () => {
    // TODO: Call API
    const constraints = [
      "Use only sound and taste; end with a subtext line.",
      "Shorten all sentences; raise stakes by one notch.",
      "Add three sensory details; one must be unexpected.",
      "Write in present tense; include one metaphor.",
      "Use dialogue for 70% of the scene; show don't tell.",
    ];
    const randomConstraint =
      constraints[Math.floor(Math.random() * constraints.length)];
    onConstraintGenerated(randomConstraint);
  };

  const handleObstacleEscalator = async () => {
    // TODO: Call API
    const options = [
      "+ A minor setback occurs",
      "++ A major obstacle appears",
      "+++ The situation becomes critical",
      "++++ Everything seems lost",
    ];
    onObstacleEscalated(options);
  };

  const handlePOVSwap = async () => {
    // TODO: Call API with selected POV
    onPOVSwapped("Rewritten from different POV...");
  };

  const handleSensoryWheel = async () => {
    const missingSenses = Object.entries(sensoryWheel)
      .filter(([_, checked]) => !checked)
      .map(([sense, _]) => sense);

    if (missingSenses.length > 0) {
      // TODO: Call API
      onSensoryEnhanced("Enhanced with sensory details...");
    }
  };

  const handleBeatTemplate = (template: string) => {
    const templates = {
      "7-point": `
        <h3 class="ghost-heading">Hook</h3><p></p>
        <h3 class="ghost-heading">Plot Turn 1</h3><p></p>
        <h3 class="ghost-heading">Pinch Point 1</h3><p></p>
        <h3 class="ghost-heading">Midpoint</h3><p></p>
        <h3 class="ghost-heading">Pinch Point 2</h3><p></p>
        <h3 class="ghost-heading">Plot Turn 2</h3><p></p>
        <h3 class="ghost-heading">Resolution</h3><p></p>
      `,
      "save-the-cat": `
        <h3 class="ghost-heading">Opening Image</h3><p></p>
        <h3 class="ghost-heading">Theme Stated</h3><p></p>
        <h3 class="ghost-heading">Set-Up</h3><p></p>
        <h3 class="ghost-heading">Catalyst</h3><p></p>
        <h3 class="ghost-heading">Debate</h3><p></p>
        <h3 class="ghost-heading">Break Into Two</h3><p></p>
        <h3 class="ghost-heading">B Story</h3><p></p>
        <h3 class="ghost-heading">Fun and Games</h3><p></p>
        <h3 class="ghost-heading">Midpoint</h3><p></p>
        <h3 class="ghost-heading">Bad Guys Close In</h3><p></p>
        <h3 class="ghost-heading">All Is Lost</h3><p></p>
        <h3 class="ghost-heading">Dark Night of the Soul</h3><p></p>
        <h3 class="ghost-heading">Break Into Three</h3><p></p>
        <h3 class="ghost-heading">Finale</h3><p></p>
        <h3 class="ghost-heading">Final Image</h3><p></p>
      `,
      kishotenketsu: `
        <h3 class="ghost-heading">Ki (Introduction)</h3><p></p>
        <h3 class="ghost-heading">Sho (Development)</h3><p></p>
        <h3 class="ghost-heading">Ten (Twist)</h3><p></p>
        <h3 class="ghost-heading">Ketsu (Conclusion)</h3><p></p>
      `,
    };
    onBeatTemplateInserted(templates[template as keyof typeof templates] || "");
  };

  const handleWhatIfFork = () => {
    const whatIf = prompt("What if...? (e.g., 'Alia never met General Tal')");
    if (whatIf) {
      onWhatIfForked(whatIf);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Tab Headers */}
      <div className="flex border-b">
        <button
          className={`px-3 py-2 text-sm ${
            activeTab === "entities"
              ? "bg-black text-white"
              : "bg-gray-100 hover:bg-gray-200"
          }`}
          onClick={() => setActiveTab("entities")}
        >
          Entities
        </button>
        <button
          className={`px-3 py-2 text-sm ${
            activeTab === "muse"
              ? "bg-black text-white"
              : "bg-gray-100 hover:bg-gray-200"
          }`}
          onClick={() => setActiveTab("muse")}
        >
          Muse (AI)
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 p-3 overflow-auto">
        {activeTab === "entities" ? (
          <div className="space-y-3">
            <p className="text-sm text-gray-500">
              Entity suggestions will appear here after extraction.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Muse Dice */}
            <div className="border rounded p-3">
              <h4 className="font-medium text-sm mb-2">Muse Dice (⌥D)</h4>
              <button
                onClick={handleMuseDice}
                className="w-full px-3 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-sm"
              >
                Roll for Constraint
              </button>
            </div>

            {/* Constraint Deck */}
            <div className="border rounded p-3">
              <h4 className="font-medium text-sm mb-2">Constraint Deck</h4>
              <div className="space-y-2">
                <div>
                  <label className="text-xs text-gray-600">Tension</label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={constraintDeck.tension}
                    onChange={(e) =>
                      setConstraintDeck({
                        ...constraintDeck,
                        tension: parseFloat(e.target.value),
                      })
                    }
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-600">Pace</label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={constraintDeck.pace}
                    onChange={(e) =>
                      setConstraintDeck({
                        ...constraintDeck,
                        pace: parseFloat(e.target.value),
                      })
                    }
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-600">Formality</label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={constraintDeck.formality}
                    onChange={(e) =>
                      setConstraintDeck({
                        ...constraintDeck,
                        formality: parseFloat(e.target.value),
                      })
                    }
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-600">Dialogue %</label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={constraintDeck.dialogue_percent}
                    onChange={(e) =>
                      setConstraintDeck({
                        ...constraintDeck,
                        dialogue_percent: parseFloat(e.target.value),
                      })
                    }
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-600">Imagery</label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={constraintDeck.imagery}
                    onChange={(e) =>
                      setConstraintDeck({
                        ...constraintDeck,
                        imagery: parseFloat(e.target.value),
                      })
                    }
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* Obstacle Escalator */}
            <div className="border rounded p-3">
              <h4 className="font-medium text-sm mb-2">
                Obstacle Escalator (⌥E)
              </h4>
              <button
                onClick={handleObstacleEscalator}
                className="w-full px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
              >
                Escalate Conflict
              </button>
            </div>

            {/* POV Swap */}
            <div className="border rounded p-3">
              <h4 className="font-medium text-sm mb-2">POV Swap (⌥P)</h4>
              <button
                onClick={handlePOVSwap}
                className="w-full px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
              >
                Swap POV
              </button>
            </div>

            {/* Sensory Wheel */}
            <div className="border rounded p-3">
              <h4 className="font-medium text-sm mb-2">Sensory Wheel</h4>
              <div className="grid grid-cols-2 gap-2 mb-2">
                {Object.entries(sensoryWheel).map(([sense, checked]) => (
                  <label key={sense} className="flex items-center text-xs">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) =>
                        setSensoryWheel({
                          ...sensoryWheel,
                          [sense]: e.target.checked,
                        })
                      }
                      className="mr-1"
                    />
                    {sense.charAt(0).toUpperCase() + sense.slice(1)}
                  </label>
                ))}
              </div>
              <button
                onClick={handleSensoryWheel}
                className="w-full px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
              >
                Add Missing Senses
              </button>
            </div>

            {/* Beat Templates */}
            <div className="border rounded p-3">
              <h4 className="font-medium text-sm mb-2">Beat Templates</h4>
              <div className="space-y-1">
                <button
                  onClick={() => handleBeatTemplate("7-point")}
                  className="w-full px-2 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300"
                >
                  7-Point Structure
                </button>
                <button
                  onClick={() => handleBeatTemplate("save-the-cat")}
                  className="w-full px-2 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300"
                >
                  Save the Cat
                </button>
                <button
                  onClick={() => handleBeatTemplate("kishotenketsu")}
                  className="w-full px-2 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300"
                >
                  Kishōtenketsu
                </button>
              </div>
            </div>

            {/* What-if Fork */}
            <div className="border rounded p-3">
              <h4 className="font-medium text-sm mb-2">What-if Fork (⌥B)</h4>
              <button
                onClick={handleWhatIfFork}
                className="w-full px-3 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 text-sm"
              >
                Create Branch
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
