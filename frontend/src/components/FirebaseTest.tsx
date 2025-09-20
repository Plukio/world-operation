import { useState } from 'react';
import { firebaseService } from '../lib/firebaseService';

export default function FirebaseTest() {
  const [status, setStatus] = useState<string>('Ready to test');
  const [results, setResults] = useState<string[]>([]);

  const addResult = (result: string) => {
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  const testEntityCRUD = async () => {
    try {
      setStatus('Testing Entity CRUD...');
      addResult('Starting Entity CRUD test');

      // Create
      const newEntity = await firebaseService.createEntity({
        type: 'character',
        name: 'Test Character',
        description: 'A test character',
        aliases: ['Test', 'TC']
      });
      addResult(`✅ Created entity: ${newEntity.id}`);

      // Read
      const retrievedEntity = await firebaseService.getEntity(newEntity.id!);
      addResult(`✅ Retrieved entity: ${retrievedEntity?.name}`);

      // Update
      const updatedEntity = await firebaseService.updateEntity(newEntity.id!, {
        name: 'Updated Test Character'
      });
      addResult(`✅ Updated entity: ${updatedEntity?.name}`);

      // Delete
      const deleted = await firebaseService.deleteEntity(newEntity.id!);
      addResult(`✅ Deleted entity: ${deleted}`);

      setStatus('Entity CRUD test completed successfully!');
    } catch (error) {
      addResult(`❌ Entity CRUD test failed: ${error}`);
      setStatus('Entity CRUD test failed');
    }
  };

  const testRepositoryCRUD = async () => {
    try {
      setStatus('Testing Repository CRUD...');
      addResult('Starting Repository CRUD test');

      // Create
      const newRepo = await firebaseService.createRepository({
        name: 'Test Repository'
      });
      addResult(`✅ Created repository: ${newRepo.id}`);

      // Read
      const retrievedRepo = await firebaseService.getRepository(newRepo.id!);
      addResult(`✅ Retrieved repository: ${retrievedRepo?.name}`);

      // Update
      const updatedRepo = await firebaseService.updateRepository(newRepo.id!, {
        name: 'Updated Test Repository'
      });
      addResult(`✅ Updated repository: ${updatedRepo?.name}`);

      // Delete
      const deleted = await firebaseService.deleteRepository(newRepo.id!);
      addResult(`✅ Deleted repository: ${deleted}`);

      setStatus('Repository CRUD test completed successfully!');
    } catch (error) {
      addResult(`❌ Repository CRUD test failed: ${error}`);
      setStatus('Repository CRUD test failed');
    }
  };

  const testStoryNodeCRUD = async () => {
    try {
      setStatus('Testing StoryNode CRUD...');
      addResult('Starting StoryNode CRUD test');

      // Create
      const newNode = await firebaseService.createStoryNode({
        repo_id: 'test-repo',
        kind: 'epic',
        title: 'Test Epic',
        order_idx: 0
      });
      addResult(`✅ Created story node: ${newNode.id}`);

      // Read
      const retrievedNode = await firebaseService.getStoryNode(newNode.id!);
      addResult(`✅ Retrieved story node: ${retrievedNode?.title}`);

      // Update
      const updatedNode = await firebaseService.updateStoryNode(newNode.id!, {
        title: 'Updated Test Epic'
      });
      addResult(`✅ Updated story node: ${updatedNode?.title}`);

      // Delete
      const deleted = await firebaseService.deleteStoryNode(newNode.id!);
      addResult(`✅ Deleted story node: ${deleted}`);

      setStatus('StoryNode CRUD test completed successfully!');
    } catch (error) {
      addResult(`❌ StoryNode CRUD test failed: ${error}`);
      setStatus('StoryNode CRUD test failed');
    }
  };

  const testSceneCRUD = async () => {
    try {
      setStatus('Testing Scene CRUD...');
      addResult('Starting Scene CRUD test');

      // Create
      const newScene = await firebaseService.createScene({
        node_id: 'test-node',
        title: 'Test Scene',
        order_idx: 0
      });
      addResult(`✅ Created scene: ${newScene.id}`);

      // Read
      const retrievedScene = await firebaseService.getScene(newScene.id!);
      addResult(`✅ Retrieved scene: ${retrievedScene?.title}`);

      // Update
      const updatedScene = await firebaseService.updateScene(newScene.id!, {
        title: 'Updated Test Scene'
      });
      addResult(`✅ Updated scene: ${updatedScene?.title}`);

      // Delete
      const deleted = await firebaseService.deleteScene(newScene.id!);
      addResult(`✅ Deleted scene: ${deleted}`);

      setStatus('Scene CRUD test completed successfully!');
    } catch (error) {
      addResult(`❌ Scene CRUD test failed: ${error}`);
      setStatus('Scene CRUD test failed');
    }
  };

  const testAllCRUD = async () => {
    setResults([]);
    setStatus('Running all CRUD tests...');
    
    await testEntityCRUD();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await testRepositoryCRUD();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await testStoryNodeCRUD();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await testSceneCRUD();
    
    setStatus('All CRUD tests completed!');
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Firebase CRUD Test</h2>
      
      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-2">Status: {status}</p>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={testAllCRUD}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Test All CRUD Operations
          </button>
          <button
            onClick={testEntityCRUD}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Test Entity CRUD
          </button>
          <button
            onClick={testRepositoryCRUD}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            Test Repository CRUD
          </button>
          <button
            onClick={testStoryNodeCRUD}
            className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
          >
            Test StoryNode CRUD
          </button>
          <button
            onClick={testSceneCRUD}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Test Scene CRUD
          </button>
        </div>
      </div>

      <div className="bg-gray-100 p-4 rounded-lg">
        <h3 className="font-semibold mb-2">Test Results:</h3>
        <div className="space-y-1 max-h-96 overflow-y-auto">
          {results.map((result, index) => (
            <div key={index} className="text-sm font-mono">
              {result}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
