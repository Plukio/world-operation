import { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface StoryNode {
  id: string;
  repo_id: string;
  kind: string;
  title: string;
  parent_id?: string;
  order_idx: number;
}

export default function SimpleSidebar() {
  const [epics, setEpics] = useState<StoryNode[]>([]);
  const [loading, setLoading] = useState(false);

  // Load epics from Firebase
  const loadEpics = async () => {
    setLoading(true);
    try {
      console.log('Loading epics from Firebase...');
      const q = query(
        collection(db, 'storyNodes'),
        where('kind', '==', 'epic'),
        orderBy('order_idx')
      );
      const querySnapshot = await getDocs(q);
      const epicsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as StoryNode[];
      
      console.log('Loaded epics:', epicsData);
      setEpics(epicsData);
    } catch (error) {
      console.error('Error loading epics:', error);
    } finally {
      setLoading(false);
    }
  };

  // Create a new epic
  const createEpic = async () => {
    const title = prompt('Enter epic name:');
    if (!title || !title.trim()) return;

    setLoading(true);
    try {
      console.log('Creating epic:', title);
      const docRef = await addDoc(collection(db, 'storyNodes'), {
        repo_id: 'default-repo',
        kind: 'epic',
        title: title.trim(),
        order_idx: epics.length,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      console.log('Epic created with ID:', docRef.id);
      
      // Reload epics to show the new one
      await loadEpics();
    } catch (error) {
      console.error('Error creating epic:', error);
      alert('Failed to create epic: ' + (error instanceof Error ? error.message : String(error)));
    } finally {
      setLoading(false);
    }
  };

  // Load epics when component mounts
  useEffect(() => {
    loadEpics();
  }, []);

  return (
    <div className="w-80 h-full bg-gray-50 border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h2 className="font-semibold text-gray-900">Story</h2>
        <button
          onClick={createEpic}
          disabled={loading}
          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm disabled:opacity-50"
        >
          {loading ? 'Creating...' : '+ Epic'}
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading && epics.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>Loading epics...</p>
          </div>
        ) : epics.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p className="text-sm">No epics yet</p>
            <p className="text-xs mt-1">Create your first epic</p>
          </div>
        ) : (
          <div className="space-y-2">
            {epics.map((epic) => (
              <div key={epic.id} className="p-3 bg-white rounded border hover:bg-gray-50">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-900">{epic.title}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
