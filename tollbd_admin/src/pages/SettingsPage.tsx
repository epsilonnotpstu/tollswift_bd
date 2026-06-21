import { useEffect, useMemo, useState } from 'react'
import { collection, doc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore'
import toast from 'react-hot-toast'

import { db } from '../services/firebase'
import type { TollGate } from '../types/models'

const vehicleTypes = ['motorcycle', 'car', 'microbus', 'truck', 'bus', 'cng']

export function SettingsPage() {
  const [gates, setGates] = useState<TollGate[]>([])
  const [selectedGateId, setSelectedGateId] = useState('')
  const [rates, setRates] = useState<Record<string, number>>({})
  const [appConfig, setAppConfig] = useState<Record<string, number | boolean | string>>({})

  useEffect(() => {
    const unsubs: Array<() => void> = []

    unsubs.push(
      onSnapshot(collection(db, 'toll_gates'), (snapshot) => {
        const all = snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as TollGate[]
        setGates(all)
        if (!selectedGateId && all.length > 0) {
          setSelectedGateId(all[0].id)
        }
      }),
    )

    unsubs.push(
      onSnapshot(doc(db, 'app_config', 'general'), (snapshot) => {
        setAppConfig((snapshot.data() as Record<string, number | boolean | string>) || {})
      }),
    )

    return () => unsubs.forEach((u) => u())
  }, [selectedGateId])

  useEffect(() => {
    const gate = gates.find((item) => item.id === selectedGateId)
    const baseRates = (gate?.toll_rates || {}) as Record<string, number>
    const inTaka: Record<string, number> = {}
    Object.entries(baseRates).forEach(([key, value]) => {
      inTaka[key] = Number((value / 100).toFixed(2))
    })
    setRates(inTaka)
  }, [gates, selectedGateId])

  const selectedGate = useMemo(
    () => gates.find((item) => item.id === selectedGateId),
    [gates, selectedGateId],
  )

  const saveRate = async (type: string) => {
    if (!selectedGateId) return

    try {
      await updateDoc(doc(db, 'toll_gates', selectedGateId), {
        [`toll_rates.${type}`]: Math.round(Number(rates[type] || 0) * 100),
      })
      toast.success('Rate updated')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Update failed')
    }
  }

  const applyToAllGates = async () => {
    try {
      await Promise.all(
        gates.map((gate) =>
          updateDoc(doc(db, 'toll_gates', gate.id), {
            toll_rates: Object.fromEntries(
              Object.entries(rates).map(([key, value]) => [key, Math.round(Number(value || 0) * 100)]),
            ),
          }),
        ),
      )
      toast.success('Applied rates to all gates')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Bulk update failed')
    }
  }

  const saveConfig = async (key: string, value: number | boolean | string) => {
    try {
      await setDoc(
        doc(db, 'app_config', 'general'),
        {
          [key]: value,
        },
        { merge: true },
      )
      toast.success('Config saved')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Config save failed')
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="mb-3 text-lg font-bold text-slate-900">Toll Rate Management</h3>

        <select
          value={selectedGateId}
          onChange={(event) => setSelectedGateId(event.target.value)}
          className="mb-4 w-full rounded-lg border border-slate-300 px-3 py-2 md:max-w-sm"
        >
          {gates.map((gate) => (
            <option key={gate.id} value={gate.id}>
              {gate.name}
            </option>
          ))}
        </select>

        <div className="overflow-hidden rounded-lg border border-slate-200">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-3 py-2 text-left">Vehicle Type</th>
                <th className="px-3 py-2 text-left">Current Rate (৳)</th>
                <th className="px-3 py-2 text-left">New Rate</th>
                <th className="px-3 py-2 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {vehicleTypes.map((type) => (
                <tr key={type} className="border-t border-slate-100">
                  <td className="px-3 py-2 font-medium text-slate-700">{type}</td>
                  <td className="px-3 py-2">৳{Math.round((selectedGate?.toll_rates?.[type] || 0) / 100)}</td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      value={rates[type] ?? 0}
                      onChange={(event) =>
                        setRates((prev) => ({ ...prev, [type]: Number(event.target.value) }))
                      }
                      className="w-32 rounded-md border border-slate-300 px-2 py-1"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <button
                      onClick={() => saveRate(type)}
                      className="rounded-md bg-[#006A4E] px-3 py-1 text-xs font-semibold text-white"
                    >
                      Save
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <button
          onClick={applyToAllGates}
          className="mt-4 rounded-md bg-emerald-700 px-4 py-2 text-sm font-bold text-white"
        >
          সব গেটে একসাথে প্রয়োগ করুন
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="mb-3 text-lg font-bold text-slate-900">Pass Pricing</h3>
          <p className="text-sm text-slate-500">Save values to app_config/general for monthly/quarterly/annual pass pricing.</p>
          <div className="mt-3 space-y-2">
            {['monthly_price_car', 'quarterly_price_car', 'annual_price_car'].map((key) => (
              <div key={key} className="flex items-center gap-2">
                <label className="w-44 text-sm font-medium text-slate-700">{key}</label>
                <input
                  type="number"
                  defaultValue={Number(appConfig[key] || 0)}
                  onBlur={(event) => saveConfig(key, Number(event.target.value))}
                  className="rounded-md border border-slate-300 px-2 py-1"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="mb-3 text-lg font-bold text-slate-900">App Configuration</h3>
          <div className="space-y-3 text-sm">
            <ConfigRow
              label="Min deposit amount"
              defaultValue={Number(appConfig.min_deposit_amount || 5000)}
              onSave={(value) => saveConfig('min_deposit_amount', value)}
            />
            <ConfigRow
              label="Low balance threshold"
              defaultValue={Number(appConfig.low_balance_threshold || 2000)}
              onSave={(value) => saveConfig('low_balance_threshold', value)}
            />
            <ConfigRow
              label="Force update version"
              defaultValue={String(appConfig.force_update_version || '1.0.0')}
              onSave={(value) => saveConfig('force_update_version', value)}
            />
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={Boolean(appConfig.maintenance_mode)}
                onChange={(event) => saveConfig('maintenance_mode', event.target.checked)}
              />
              Maintenance mode
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}

function ConfigRow({
  label,
  defaultValue,
  onSave,
}: {
  label: string
  defaultValue: number | string
  onSave: (value: number | string) => void
}) {
  return (
    <div className="flex items-center gap-2">
      <label className="w-44 text-sm font-medium text-slate-700">{label}</label>
      <input
        type={typeof defaultValue === 'number' ? 'number' : 'text'}
        defaultValue={defaultValue}
        onBlur={(event) =>
          onSave(typeof defaultValue === 'number' ? Number(event.target.value) : event.target.value)
        }
        className="rounded-md border border-slate-300 px-2 py-1"
      />
    </div>
  )
}
