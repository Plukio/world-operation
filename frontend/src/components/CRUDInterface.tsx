import { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, doc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface CRUDModel {
  name: string;
  collection: string;
  fields: { key: string; label: string; type: 'text' | 'number' | 'select'; options?: string[] }[];
  defaultValues: Record<string, any>;
}

const MODELS: CRUDModel[] = [
  {
    name: 'Story Nodes (Epics/Chapters)',
    collection: 'storyNodes',
    fields: [
      { key: 'repo_id', label: 'Repository ID', type: 'text' },
      { key: 'kind', label: 'Kind', type: 'select', options: ['epic', 'chapter'] },
      { key: 'title', label: 'Title', type: 'text' },
      { key: 'parent_id', label: 'Parent ID (optional)', type: 'text' },
      { key: 'order_idx', label: 'Order Index', type: 'number' }
    ],
    defaultValues: { repo_id: 'default-repo', kind: 'epic', title: '', parent_id: '', order_idx: 0 }
  },
  {
    name: 'Scenes',
    collection: 'scenes',
    fields: [
      { key: 'node_id', label: 'Node ID', type: 'text' },
      { key: 'title', label: 'Title', type: 'text' },
      { key: 'order_idx', label: 'Order Index', type: 'number' }
    ],
    defaultValues: { node_id: '', title: '', order_idx: 0 }
  },
  {
    name: 'Entities',
    collection: 'entities',
    fields: [
      { key: 'type', label: 'Type', type: 'text' },
      { key: 'name', label: 'Name', type: 'text' },
      { key: 'description', label: 'Description', type: 'text' },
      { key: 'aliases', label: 'Aliases (comma-separated)', type: 'text' }
    ],
    defaultValues: { type: '', name: '', description: '', aliases: '' }
  },
  {
    name: 'Relationships',
    collection: 'relationships',
    fields: [
      { key: 'source_entity_id', label: 'Source Entity ID', type: 'text' },
      { key: 'target_entity_id', label: 'Target Entity ID', type: 'text' },
      { key: 'relation_type', label: 'Relation Type', type: 'text' }
    ],
    defaultValues: { source_entity_id: '', target_entity_id: '', relation_type: '' }
  },
  {
    name: 'Repositories',
    collection: 'repositories',
    fields: [
      { key: 'name', label: 'Name', type: 'text' },
      { key: 'user_id', label: 'User ID', type: 'text' },
      { key: 'is_public', label: 'Is Public', type: 'select', options: ['true', 'false'] }
    ],
    defaultValues: { name: '', user_id: '', is_public: 'false' }
  },
  {
    name: 'Branches',
    collection: 'branches',
    fields: [
      { key: 'repo_id', label: 'Repository ID', type: 'text' },
      { key: 'name', label: 'Name', type: 'text' }
    ],
    defaultValues: { repo_id: 'default-repo', name: '' }
  },
  {
    name: 'Commits',
    collection: 'commits',
    fields: [
      { key: 'repo_id', label: 'Repository ID', type: 'text' },
      { key: 'branch_id', label: 'Branch ID', type: 'text' },
      { key: 'message', label: 'Message', type: 'text' },
      { key: 'author', label: 'Author', type: 'text' }
    ],
    defaultValues: { repo_id: 'default-repo', branch_id: '', message: '', author: '' }
  }
];

export default function CRUDInterface() {
  const [selectedModel, setSelectedModel] = useState<CRUDModel>(MODELS[0]);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});

  // Load items for selected model
  const loadItems = async () => {
    setLoading(true);
    try {
      console.log(`Loading ${selectedModel.collection}...`);
      const q = query(collection(db, selectedModel.collection), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const itemsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      console.log(`Loaded ${itemsData.length} items from ${selectedModel.collection}:`, itemsData);
      setItems(itemsData);
    } catch (error) {
      console.error(`Error loading ${selectedModel.collection}:`, error);
    } finally {
      setLoading(false);
    }
  };

  // Create new item
  const createItem = async () => {
    if (!formData || Object.keys(formData).length === 0) {
      alert('Please fill in the form data');
      return;
    }

    setLoading(true);
    try {
      console.log(`Creating ${selectedModel.collection}:`, formData);
      
      // Process form data
      const dataToSave = { ...formData };
      
      // Handle special cases
      if (dataToSave.aliases && typeof dataToSave.aliases === 'string') {
        dataToSave.aliases = dataToSave.aliases.split(',').map((a: string) => a.trim()).filter(Boolean);
      }
      if (dataToSave.is_public && typeof dataToSave.is_public === 'string') {
        dataToSave.is_public = dataToSave.is_public === 'true';
      }
      if (dataToSave.order_idx && typeof dataToSave.order_idx === 'string') {
        dataToSave.order_idx = parseInt(dataToSave.order_idx);
      }
      
      // Remove empty strings for optional fields
      Object.keys(dataToSave).forEach(key => {
        if (dataToSave[key] === '' && selectedModel.fields.find(f => f.key === key)?.key.includes('_id')) {
          delete dataToSave[key];
        }
      });
      
      // Add timestamps
      dataToSave.createdAt = new Date();
      dataToSave.updatedAt = new Date();
      
      const docRef = await addDoc(collection(db, selectedModel.collection), dataToSave);
      console.log(`Created ${selectedModel.collection} with ID:`, docRef.id);
      
      // Reset form and reload
      setFormData({});
      await loadItems();
    } catch (error) {
      console.error(`Error creating ${selectedModel.collection}:`, error);
      alert(`Failed to create ${selectedModel.name}: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  };


  // Delete item
  const deleteItem = async (item: any) => {
    if (!confirm(`Delete this ${selectedModel.name.toLowerCase()}?`)) return;
    
    setLoading(true);
    try {
      console.log(`Deleting ${selectedModel.collection}:`, item.id);
      await deleteDoc(doc(db, selectedModel.collection, item.id));
      console.log(`Deleted ${selectedModel.collection} with ID:`, item.id);
      
      await loadItems();
    } catch (error) {
      console.error(`Error deleting ${selectedModel.collection}:`, error);
      alert(`Failed to delete ${selectedModel.name}: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  };

  // Load items when model changes
  useEffect(() => {
    loadItems();
    setFormData(selectedModel.defaultValues);
  }, [selectedModel]);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">CRUD Interface - All Models</h1>
      
      {/* Model Selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Select Model:</label>
        <select
          value={selectedModel.name}
          onChange={(e) => setSelectedModel(MODELS.find(m => m.name === e.target.value) || MODELS[0])}
          className="border border-gray-300 rounded-md px-3 py-2 bg-white"
        >
          {MODELS.map(model => (
            <option key={model.name} value={model.name}>{model.name}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Create Form */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Create {selectedModel.name}</h2>
          
          <div className="space-y-4">
            {selectedModel.fields.map(field => (
              <div key={field.key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {field.label}
                </label>
                {field.type === 'select' ? (
                  <select
                    value={formData[field.key] || ''}
                    onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="">Select {field.label}</option>
                    {field.options?.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={field.type}
                    value={formData[field.key] || ''}
                    onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder={`Enter ${field.label}`}
                  />
                )}
              </div>
            ))}
          </div>
          
          <button
            onClick={createItem}
            disabled={loading}
            className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md disabled:opacity-50"
          >
            {loading ? 'Creating...' : `Create ${selectedModel.name}`}
          </button>
        </div>

        {/* Items List */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              {selectedModel.name} ({items.length})
            </h2>
            <button
              onClick={loadItems}
              disabled={loading}
              className="text-blue-600 hover:text-blue-700 text-sm"
            >
              {loading ? 'Loading...' : 'Refresh'}
            </button>
          </div>
          
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {items.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No items found</p>
            ) : (
              items.map(item => (
                <div key={item.id} className="p-3 border border-gray-200 rounded-md">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">
                        {item.title || item.name || item.message || `ID: ${item.id}`}
                      </div>
                      <div className="text-sm text-gray-500">
                        {item.kind && `Kind: ${item.kind}`}
                        {item.type && `Type: ${item.type}`}
                        {item.createdAt && `Created: ${new Date(item.createdAt.seconds * 1000).toLocaleDateString()}`}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => deleteItem(item)}
                        className="text-red-600 hover:text-red-700 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
