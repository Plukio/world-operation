import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useFirebaseStore } from '../store/useFirebaseStore';

export default function SimpleTest() {
  const { user, signInWithGoogle } = useAuth();
  const { createNode, repoId, initializeUserRepo } = useFirebaseStore();
  const [status, setStatus] = useState<string>('Ready to test');

  const handleSignIn = async () => {
    try {
      setStatus('Signing in...');
      await signInWithGoogle();
      setStatus('Signed in successfully!');
    } catch (error) {
      setStatus(`Sign in failed: ${error}`);
    }
  };

  const handleInitRepo = async () => {
    if (!user) {
      setStatus('Please sign in first');
      return;
    }
    try {
      setStatus('Initializing repo...');
      const newRepoId = await initializeUserRepo(user.uid);
      setStatus(`Repo initialized: ${newRepoId}`);
    } catch (error) {
      setStatus(`Repo init failed: ${error}`);
    }
  };

  const handleCreateEpic = async () => {
    if (!user) {
      setStatus('Please sign in first');
      return;
    }
    try {
      setStatus('Creating epic...');
      await createNode('epic', 'Test Epic');
      setStatus('Epic created successfully!');
    } catch (error) {
      setStatus(`Epic creation failed: ${error}`);
    }
  };

  return (
    <div className="fixed top-4 left-4 bg-white border border-gray-300 rounded-lg p-4 shadow-lg max-w-sm z-50">
      <h3 className="font-semibold text-gray-900 mb-3">Simple Test</h3>
      
      <div className="space-y-2 text-xs mb-4">
        <div><strong>User:</strong> {user ? user.email : 'Not signed in'}</div>
        <div><strong>Repo ID:</strong> {repoId || 'Not set'}</div>
        <div><strong>Status:</strong> {status}</div>
      </div>

      <div className="space-y-2">
        {!user ? (
          <button
            onClick={handleSignIn}
            className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm"
          >
            Sign In with Google
          </button>
        ) : (
          <>
            <button
              onClick={handleInitRepo}
              className="w-full px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm"
            >
              Initialize Repo
            </button>
            
            <button
              onClick={handleCreateEpic}
              className="w-full px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm"
            >
              Create Test Epic
            </button>
          </>
        )}
      </div>
    </div>
  );
}
