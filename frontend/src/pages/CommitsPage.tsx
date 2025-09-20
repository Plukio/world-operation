import { useFirebaseStore } from "../store/useFirebaseStore";

export default function CommitsPage() {
  const { commits } = useFirebaseStore();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Commits</h1>
      
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <p className="text-gray-600 mb-4">
          This page will show your commit history and version comparisons.
        </p>
        
        {commits.length > 0 ? (
          <div className="space-y-2">
            <h3 className="font-semibold text-gray-900">Recent Commits:</h3>
            {commits.map((commit) => (
              <div key={commit.id} className="p-3 bg-gray-50 rounded border">
                <div className="font-medium text-gray-900">{commit.message}</div>
                <div className="text-sm text-gray-500">
                  {commit.createdAt ? new Date(commit.createdAt).toLocaleString() : 'No date'}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No commits yet. Start writing to see your commit history!</p>
        )}
      </div>
    </div>
  );
}