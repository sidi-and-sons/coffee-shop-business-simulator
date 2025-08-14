function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center p-8">
        <h1 className="text-6xl font-bold text-gray-800 mb-4">
          Hello World!
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Welcome to our Coffee Shop Business Simulator
        </p>
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
          <h2 className="text-2xl font-semibold text-gray-800 mb-3">
            ☕ Coffee Shop Simulator
          </h2>
          <p className="text-gray-600">
            A coffee shop simulator for business students. Can you keep the coffee shop open for 12 months?
          </p>
        </div>
        <div className="mt-8">
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 shadow-md">
            Coming Soon
          </button>
        </div>
      </div>
    </div>
  )
}

export default App
