import SimpleSidebar from './SimpleSidebar';

export default function SimpleLayout() {
  return (
    <div className="h-screen flex bg-white">
      <SimpleSidebar />
      
      {/* Main Content Area */}
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">World Operation</h1>
          <p className="text-gray-600 mb-6">Simple Fiction Writer</p>
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <p className="text-sm text-gray-500">
              Create an epic using the sidebar to get started!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
