import { useState, useMemo, useRef, useEffect } from 'react'
import { Cloud, Server, TrendingDown, Info, ChevronDown, ChevronUp, HelpCircle } from 'lucide-react'
import pricingData from '../data/llm-pricing.json'

function Tooltip({ text, children }) {
  const [show, setShow] = useState(false)
  const [position, setPosition] = useState('top')
  const tipRef = useRef(null)
  const wrapRef = useRef(null)

  useEffect(() => {
    if (show && tipRef.current && wrapRef.current) {
      const tipRect = tipRef.current.getBoundingClientRect()
      if (tipRect.top < 8) setPosition('bottom')
      else setPosition('top')
    }
  }, [show])

  return (
    <span
      ref={wrapRef}
      className="relative inline-flex items-center"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      onTouchStart={() => setShow((s) => !s)}
    >
      {children || <HelpCircle className="h-3.5 w-3.5 text-[#A78BFA]/60 hover:text-[#A78BFA] cursor-help transition-colors" />}
      {show && (
        <span
          ref={tipRef}
          className={`absolute z-50 w-56 px-3 py-2 text-xs leading-relaxed text-[#E4E4E7] bg-[#1E1E24] border border-[#3A3A45] rounded-lg shadow-xl pointer-events-none ${
            position === 'bottom' ? 'top-full mt-2' : 'bottom-full mb-2'
          } left-1/2 -translate-x-1/2`}
        >
          {text}
        </span>
      )}
    </span>
  )
}

const LAST_UPDATED = pricingData.lastUpdated
const PROVIDERS = pricingData.providers
const LOCAL_HARDWARE = pricingData.hardware

const USAGE_PRESETS = [
  { label: 'Light', desc: 'Small team, occasional use', inputTokens: 1, outputTokens: 0.25 },
  { label: 'Moderate', desc: 'Daily business workflows', inputTokens: 10, outputTokens: 2.5 },
  { label: 'Heavy', desc: 'Production app or high-volume', inputTokens: 50, outputTokens: 12.5 },
  { label: 'Enterprise', desc: 'Large-scale deployment', inputTokens: 200, outputTokens: 50 },
]

function formatCurrency(value) {
  if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`
  if (value < 0.01) return '<$0.01'
  return `$${value.toFixed(2)}`
}

function formatLargeCurrency(value) {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`
  return `$${value.toFixed(0)}`
}

export default function LLMCostCalculator() {
  const [provider, setProvider] = useState('openai')
  const [modelId, setModelId] = useState('gpt-4.1-mini')
  const [usagePreset, setUsagePreset] = useState(1)
  const [cacheHitRate, setCacheHitRate] = useState(30)
  const [hardwareId, setHardwareId] = useState('rtx-4090')
  const [electricityCost, setElectricityCost] = useState(0.15)
  const [hoursPerDay, setHoursPerDay] = useState(8)
  const [amortizationMonths, setAmortizationMonths] = useState(36)
  const [showAdvanced, setShowAdvanced] = useState(false)

  const providerData = PROVIDERS[provider]
  const model = providerData.models.find((m) => m.id === modelId) || providerData.models[0]
  const usage = USAGE_PRESETS[usagePreset]
  const hardware = LOCAL_HARDWARE.find((h) => h.id === hardwareId) || LOCAL_HARDWARE[0]

  const cloudCost = useMemo(() => {
    const inputM = usage.inputTokens
    const outputM = usage.outputTokens
    const cacheRate = cacheHitRate / 100
    const discount = model.cacheDiscount

    const cachedInputCost = inputM * cacheRate * model.input * (1 - discount)
    const uncachedInputCost = inputM * (1 - cacheRate) * model.input
    const outputCost = outputM * model.output

    const monthly = cachedInputCost + uncachedInputCost + outputCost
    const withoutCache = inputM * model.input + outputM * model.output
    const cacheSavings = withoutCache - monthly

    return { monthly, withoutCache, cacheSavings }
  }, [provider, modelId, usagePreset, cacheHitRate])

  const localCost = useMemo(() => {
    const isCloudGpu = hardware.hourlyRate != null

    if (isCloudGpu) {
      const monthlyHours = hoursPerDay * 30
      const monthly = monthlyHours * hardware.hourlyRate
      return { monthly, hardwareMonthly: monthly, powerMonthly: 0, upfront: 0 }
    }

    const hardwareMonthly = hardware.cost / amortizationMonths
    const kwhPerMonth = (hardware.watts / 1000) * hoursPerDay * 30
    const powerMonthly = kwhPerMonth * electricityCost

    const monthly = hardwareMonthly + powerMonthly
    return { monthly, hardwareMonthly, powerMonthly, upfront: hardware.cost }
  }, [hardwareId, electricityCost, hoursPerDay, amortizationMonths])

  const breakEvenMonths = useMemo(() => {
    if (localCost.upfront === 0) return null
    if (cloudCost.monthly <= localCost.monthly) return null
    const monthlySavings = cloudCost.monthly - localCost.monthly
    if (monthlySavings <= 0) return null
    return Math.ceil(localCost.upfront / monthlySavings)
  }, [cloudCost, localCost])

  const savings = cloudCost.monthly - localCost.monthly
  const savingsPercent =
    cloudCost.monthly > 0 ? ((Math.abs(savings) / Math.max(cloudCost.monthly, localCost.monthly)) * 100).toFixed(0) : 0
  const localIsCheaper = savings > 0

  const maxCost = Math.max(cloudCost.monthly, localCost.monthly, 1)

  return (
    <div className="space-y-10">
      {/* Usage Preset */}
      <div>
        <label className="block text-sm font-medium text-[#A1A1AA] mb-3">
          Monthly token volume{' '}
          <Tooltip text="Tokens are how AI models measure text. Roughly 1 token ≈ ¾ of a word. 'In' means text you send to the AI; 'out' means text it writes back. Pick the tier closest to your expected usage." />
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {USAGE_PRESETS.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setUsagePreset(idx)}
              className={`p-3 rounded-xl border text-left transition-all ${
                usagePreset === idx
                  ? 'border-[#7C3AED] bg-[#7C3AED]/10 text-white'
                  : 'border-[#2A2A35] bg-[#16161A] text-[#A1A1AA] hover:border-[#3A3A45]'
              }`}
            >
              <div className="font-semibold text-sm">{preset.label}</div>
              <div className="text-xs mt-1 opacity-70">{preset.desc}</div>
              <div className="text-xs mt-1 text-[#A78BFA]">
                {preset.inputTokens}M in / {preset.outputTokens}M out
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Two-column config */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Cloud API */}
        <div className="rounded-2xl border border-[#2A2A35] bg-[#16161A] p-6 space-y-5">
          <div className="flex items-center gap-2 text-lg font-semibold">
            <Cloud className="h-5 w-5 text-[#A78BFA]" />
            Cloud API
          </div>

          {/* Provider tabs */}
          <div>
            <label className="block text-xs font-medium text-[#A1A1AA] mb-2">
              Provider{' '}
              <Tooltip text="The company whose AI service you'd use. Each offers different models at different price points. OpenAI makes ChatGPT, Anthropic makes Claude, and Google makes Gemini." />
            </label>
            <div className="flex gap-2">
              {Object.entries(PROVIDERS).map(([key, p]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    setProvider(key)
                    setModelId(PROVIDERS[key].models[0].id)
                  }}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                    provider === key
                      ? 'bg-[#7C3AED]/20 text-[#A78BFA] border border-[#7C3AED]/50'
                      : 'bg-[#0D0D0F] text-[#A1A1AA] border border-[#2A2A35] hover:border-[#3A3A45]'
                  }`}
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          {/* Model select */}
          <div>
            <label className="block text-xs font-medium text-[#A1A1AA] mb-2">
              Model{' '}
              <Tooltip text="Each provider offers several AI models. Larger models are smarter but cost more per use. Smaller/cheaper models are fine for simple tasks. The two prices shown are cost per million tokens: input (what you send) / output (what the AI writes)." />
            </label>
            <select
              value={modelId}
              onChange={(e) => setModelId(e.target.value)}
              className="w-full bg-[#0D0D0F] border border-[#2A2A35] text-white text-sm rounded-lg p-2.5 focus:border-[#7C3AED] focus:outline-none"
            >
              {providerData.models.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} — ${m.input} / ${m.output} per 1M tokens
                </option>
              ))}
            </select>
          </div>

          {/* Cache slider */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-[#A1A1AA]">
                Cache hit rate: {cacheHitRate}%{' '}
                <Tooltip text="Caching means the provider remembers parts of your previous requests so you don't pay full price again. If your prompts reuse the same instructions (e.g. a system prompt), a higher cache rate saves money. 30% is typical; 50–80% is achievable with good prompt design." />
              </label>
              <span className="text-xs text-[#A78BFA]/70">{Math.round(model.cacheDiscount * 100)}% off cached input</span>
            </div>
            <input
              type="range"
              min="0"
              max="80"
              value={cacheHitRate}
              onChange={(e) => setCacheHitRate(Number(e.target.value))}
              className="w-full h-1.5 calc-slider"
            />
            <div className="flex justify-between text-xs text-[#71717A] mt-1">
              <span>0% (no caching)</span>
              <span>80% (heavy reuse)</span>
            </div>
          </div>

          {/* Cost breakdown */}
          <div className="bg-[#0D0D0F] rounded-xl p-4 border border-[#2A2A35]/60">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-[#A1A1AA]">Without caching</span>
              <span className="text-[#E4E4E7]">{formatCurrency(cloudCost.withoutCache)}/mo</span>
            </div>
            {cloudCost.cacheSavings > 0.01 && (
              <div className="flex justify-between text-sm mb-2">
                <span className="text-emerald-400/80">Cache savings</span>
                <span className="text-emerald-400">-{formatCurrency(cloudCost.cacheSavings)}/mo</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold pt-2 border-t border-[#2A2A35]/60">
              <span>Monthly total</span>
              <span className="text-[#A78BFA]">{formatCurrency(cloudCost.monthly)}/mo</span>
            </div>
          </div>
        </div>

        {/* Self-Hosted */}
        <div className="rounded-2xl border border-[#2A2A35] bg-[#16161A] p-6 space-y-5">
          <div className="flex items-center gap-2 text-lg font-semibold">
            <Server className="h-5 w-5 text-emerald-400" />
            Self-Hosted / Local
          </div>

          {/* Hardware select */}
          <div>
            <label className="block text-xs font-medium text-[#A1A1AA] mb-2">
              Hardware{' '}
              <Tooltip text="The physical computer/GPU you'd buy (or rent) to run AI models yourself. VRAM is the GPU's memory — larger models need more. The price shown is either a one-off purchase cost or an hourly rental rate." />
            </label>
            <select
              value={hardwareId}
              onChange={(e) => setHardwareId(e.target.value)}
              className="w-full bg-[#0D0D0F] border border-[#2A2A35] text-white text-sm rounded-lg p-2.5 focus:border-[#7C3AED] focus:outline-none"
            >
              {LOCAL_HARDWARE.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name} — {h.vram} VRAM
                  {h.hourlyRate ? ` (~$${h.hourlyRate}/hr)` : ` (~$${h.cost.toLocaleString()})`}
                </option>
              ))}
            </select>
            <p className="text-xs text-[#71717A] mt-1.5">{hardware.note}</p>
          </div>

          {/* Hours slider */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-[#A1A1AA]">
                Usage: {hoursPerDay}h / day{' '}
                <Tooltip text="How many hours per day you expect the AI hardware to be running. More hours = higher electricity costs. For occasional business use, 4–8 hours is typical." />
              </label>
              {hardware.tokensPerSec && (
                <span className="text-xs text-[#71717A]">
                  ~{hardware.tokensPerSec} tok/s{' '}
                  <Tooltip text="Tokens per second — how fast this hardware generates text. Higher is better. For reference, a human reads at roughly 4–5 tokens per second." />
                </span>
              )}
            </div>
            <input
              type="range"
              min="1"
              max="24"
              value={hoursPerDay}
              onChange={(e) => setHoursPerDay(Number(e.target.value))}
              className="w-full h-1.5 calc-slider calc-slider-green"
            />
            <div className="flex justify-between text-xs text-[#71717A] mt-1">
              <span>1h/day</span>
              <span>24h/day</span>
            </div>
          </div>

          {/* Advanced toggle */}
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-1 text-xs text-[#A1A1AA] hover:text-white transition-colors"
          >
            {showAdvanced ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            Advanced settings
          </button>

          {showAdvanced && (
            <div className="space-y-3 pl-3 border-l-2 border-[#2A2A35]">
              <div>
                <label className="text-xs text-[#A1A1AA]">
                  Electricity ($/kWh){' '}
                  <Tooltip text="Your electricity price per kilowatt-hour. UK average is ~£0.28 ($0.34). US average is ~$0.16. Check your energy bill for your actual rate." />
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={electricityCost}
                  onChange={(e) => setElectricityCost(Number(e.target.value))}
                  className="w-full bg-[#0D0D0F] border border-[#2A2A35] text-white text-sm rounded-lg p-2 mt-1 focus:border-[#7C3AED] focus:outline-none"
                />
              </div>
              {hardware.cost > 0 && (
                <div>
                  <label className="text-xs text-[#A1A1AA]">
                    Amortize hardware over (months){' '}
                    <Tooltip text="Spreading the one-off hardware purchase cost across months to calculate a fair monthly expense. 36 months (3 years) is standard — like a lease. Shorter = higher monthly cost but faster payback." />
                  </label>
                  <input
                    type="number"
                    min="6"
                    max="60"
                    value={amortizationMonths}
                    onChange={(e) => setAmortizationMonths(Number(e.target.value))}
                    className="w-full bg-[#0D0D0F] border border-[#2A2A35] text-white text-sm rounded-lg p-2 mt-1 focus:border-[#7C3AED] focus:outline-none"
                  />
                </div>
              )}
            </div>
          )}

          {/* Cost breakdown */}
          <div className="bg-[#0D0D0F] rounded-xl p-4 border border-[#2A2A35]/60">
            {hardware.cost > 0 && (
              <>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-[#A1A1AA]">
                    Hardware ({formatLargeCurrency(hardware.cost)} / {amortizationMonths}mo)
                  </span>
                  <span className="text-[#E4E4E7]">{formatCurrency(localCost.hardwareMonthly)}/mo</span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-[#A1A1AA]">
                    Power ({hardware.watts}W x {hoursPerDay}h)
                  </span>
                  <span className="text-[#E4E4E7]">{formatCurrency(localCost.powerMonthly)}/mo</span>
                </div>
              </>
            )}
            {hardware.hourlyRate != null && (
              <div className="flex justify-between text-sm mb-2">
                <span className="text-[#A1A1AA]">
                  Rental (${hardware.hourlyRate}/hr x {hoursPerDay}h x 30d)
                </span>
                <span className="text-[#E4E4E7]">{formatCurrency(localCost.monthly)}/mo</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold pt-2 border-t border-[#2A2A35]/60">
              <span>Monthly total</span>
              <span className="text-emerald-400">{formatCurrency(localCost.monthly)}/mo</span>
            </div>
          </div>
        </div>
      </div>

      {/* Comparison result */}
      <div
        className={`rounded-2xl border p-6 ${
          localIsCheaper
            ? 'bg-emerald-950/20 border-emerald-500/20'
            : 'bg-[#7C3AED]/5 border-[#7C3AED]/20'
        }`}
      >
        <div className="grid md:grid-cols-3 gap-6 items-center">
          <div className="md:col-span-2 space-y-4">
            <h3 className="text-lg font-semibold">Monthly comparison</h3>

            {/* Cloud bar */}
            <div>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="text-[#A1A1AA]">
                  <Cloud className="h-3.5 w-3.5 inline mr-1.5" />
                  Cloud API ({providerData.name} {model.name})
                </span>
                <span className="font-medium text-[#A78BFA]">{formatCurrency(cloudCost.monthly)}/mo</span>
              </div>
              <div className="h-5 bg-[#0D0D0F] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#7C3AED] to-[#A78BFA] rounded-full transition-all duration-500"
                  style={{ width: `${Math.max((cloudCost.monthly / maxCost) * 100, 2)}%` }}
                />
              </div>
            </div>

            {/* Local bar */}
            <div>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="text-[#A1A1AA]">
                  <Server className="h-3.5 w-3.5 inline mr-1.5" />
                  Self-Hosted ({hardware.name})
                </span>
                <span className="font-medium text-emerald-400">{formatCurrency(localCost.monthly)}/mo</span>
              </div>
              <div className="h-5 bg-[#0D0D0F] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full transition-all duration-500"
                  style={{ width: `${Math.max((localCost.monthly / maxCost) * 100, 2)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Verdict */}
          <div className="text-center md:text-right">
            <div
              className={`text-3xl font-bold ${localIsCheaper ? 'text-emerald-400' : 'text-[#A78BFA]'}`}
            >
              {savingsPercent}% cheaper
            </div>
            <div className="text-sm text-[#E4E4E7] mt-1">
              {localIsCheaper ? 'Self-hosted wins' : 'Cloud API wins'}
            </div>
            <div className="text-sm text-[#A1A1AA] mt-1">
              Save {formatCurrency(Math.abs(savings))}/mo
            </div>
            {breakEvenMonths && localIsCheaper && (
              <div className="mt-2 text-xs text-[#A1A1AA] flex items-center justify-center md:justify-end gap-1">
                <TrendingDown className="h-3 w-3" />
                Break-even in ~{breakEvenMonths} months{' '}
                <Tooltip text="How long until the money you save each month on cloud fees pays back the upfront hardware purchase. After this point, self-hosting is pure savings." />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Insight cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="rounded-xl border border-[#2A2A35] bg-[#16161A] p-4">
          <div className="flex items-start gap-2.5">
            <Info className="h-4 w-4 text-[#A78BFA] mt-0.5 shrink-0" />
            <div>
              <h4 className="text-sm font-medium mb-1">Token caching matters</h4>
              <p className="text-xs text-[#A1A1AA] leading-relaxed">
                Anthropic offers 90% cache discounts — a game-changer for repetitive prompts. Structure
                your system prompts to maximise cache hits.
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-[#2A2A35] bg-[#16161A] p-4">
          <div className="flex items-start gap-2.5">
            <Info className="h-4 w-4 text-[#A78BFA] mt-0.5 shrink-0" />
            <div>
              <h4 className="text-sm font-medium mb-1">Local is not free</h4>
              <p className="text-xs text-[#A1A1AA] leading-relaxed">
                Hardware depreciation, electricity, cooling, and maintenance add up. Factor in IT staff
                time for model updates and infrastructure.
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-[#2A2A35] bg-[#16161A] p-4">
          <div className="flex items-start gap-2.5">
            <Info className="h-4 w-4 text-[#A78BFA] mt-0.5 shrink-0" />
            <div>
              <h4 className="text-sm font-medium mb-1">Quality vs. cost</h4>
              <p className="text-xs text-[#A1A1AA] leading-relaxed">
                Cloud APIs offer frontier models with the best quality. Local models (Llama, Mistral)
                are catching up but may lag on complex tasks.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <p className="text-xs text-[#71717A] text-center">
        Estimates are approximate. Local costs exclude IT labour, cooling, and networking. Cloud costs
        exclude bandwidth and storage. Actual costs vary by workload and configuration.
        Prices sourced from provider websites as of {LAST_UPDATED}.
      </p>
    </div>
  )
}
