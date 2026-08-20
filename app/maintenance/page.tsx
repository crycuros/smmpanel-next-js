import { Wrench } from "lucide-react"

export default function MaintenancePage() {
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-800 rounded-2xl p-8 text-center border border-slate-700 shadow-xl">
        <div className="w-16 h-16 bg-rose-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Wrench className="w-8 h-8 text-rose-500" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-4">Under Maintenance</h1>
        <p className="text-slate-400 mb-8">
          We are currently performing scheduled maintenance to improve our services. 
          Please check back later.
        </p>
        <div className="p-4 bg-slate-700/50 rounded-xl">
          <p className="text-sm text-slate-300">
            Thank you for your patience!
          </p>
        </div>
      </div>
    </div>
  )
}
