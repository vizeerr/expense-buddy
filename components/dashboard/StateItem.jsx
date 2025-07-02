const StatItem = ({ icon: Icon, title, subtitle, value, color = "text-green-400", bg = "bg-green-950" }) => (
  <div className="flex items-center justify-between bg-black rounded-xl px-3 py-3">
    <div className="flex gap-3 items-center">
      <div className={`w-10 h-10 flex items-center justify-center rounded-md border ${bg} ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-sm font-semibold">{title}</p>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </div>
    </div>
    <p className="text-sm font-bold">{value}</p>
  </div>
)

export default StatItem