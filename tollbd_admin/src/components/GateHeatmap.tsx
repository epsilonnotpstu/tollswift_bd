type GatePoint = {
  id: string
  name: string
  latitude: number
  longitude: number
  traffic: number
  revenue: number
}

type GateHeatmapProps = {
  points: GatePoint[]
}

function normalize(value: number, min: number, max: number): number {
  if (max === min) return 50
  return ((value - min) / (max - min)) * 100
}

export function GateHeatmap({ points }: GateHeatmapProps) {
  const trafficValues = points.map((p) => p.traffic)
  const revenueValues = points.map((p) => p.revenue)

  const minTraffic = Math.min(...trafficValues, 0)
  const maxTraffic = Math.max(...trafficValues, 1)
  const minRevenue = Math.min(...revenueValues, 0)
  const maxRevenue = Math.max(...revenueValues, 1)

  const minLat = Math.min(...points.map((p) => p.latitude), 20)
  const maxLat = Math.max(...points.map((p) => p.latitude), 27)
  const minLng = Math.min(...points.map((p) => p.longitude), 88)
  const maxLng = Math.max(...points.map((p) => p.longitude), 93)

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="mb-4 text-lg font-bold text-slate-900">Gate Heatmap</h3>
      <div className="relative h-80 overflow-hidden rounded-lg border border-slate-100 bg-gradient-to-br from-emerald-50 to-slate-100">
        <svg viewBox="0 0 100 100" className="h-full w-full">
          {points.map((point) => {
            const x = normalize(point.longitude, minLng, maxLng)
            const y = 100 - normalize(point.latitude, minLat, maxLat)
            const size = 6 + normalize(point.traffic, minTraffic, maxTraffic) / 10
            const intensity = normalize(point.revenue, minRevenue, maxRevenue)
            const fill = `rgba(0,106,78,${0.2 + intensity / 100})`

            return (
              <g key={point.id}>
                <circle cx={x} cy={y} r={size} fill={fill} stroke="#006A4E" strokeWidth="0.8" />
                <title>{`${point.name} • Traffic: ${point.traffic} • Revenue: ৳${Math.round(
                  point.revenue / 100,
                )}`}</title>
              </g>
            )
          })}
        </svg>
      </div>
      <p className="mt-2 text-xs text-slate-500">
        Circle size = traffic volume, circle color depth = revenue intensity
      </p>
    </div>
  )
}
