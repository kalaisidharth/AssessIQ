export default function PageLayout({ children }) {
  return (
    <div className="ml-64 min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        {children}
      </div>
    </div>
  )
}
