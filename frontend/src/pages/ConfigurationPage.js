import React, { useState, useEffect, useCallback } from 'react';
import { Save, RefreshCcw, RotateCcw, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || '';

const DEFAULTS = {
  condition_weight:   0.50,
  criticality_weight: 0.50,
  weight_population:  0.40,
  weight_health:      0.20,
  weight_education:   0.20,
  weight_isolation:   0.20,
  threshold_high:     4.0,
  threshold_medium:   2.5,
};

// Reads the JWT token from localStorage and returns it as an Authorization
// header object. Only returns the header if the token is a valid string —
// prevents sending "Bearer null" on requests when no token is stored.
const authHeader = () => {
  const token = localStorage.getItem('access_token');
  if (!token || token === 'null' || token === 'undefined') return {};
  return { Authorization: `Bearer ${token}` };
};

const pct = (v) => `${Math.round(v * 100)}%`;

// ─── WeightSlider ────────────────────────────────────────────────────────────
// All sliders use the same brand blue (#1B5E20). The percentage readout
// and track fill are always blue — no per-slider accent colour needed.
const WeightSlider = ({
  label,
  description,
  fieldName,
  value,
  min = 0,
  max = 1,
  step = 0.05,
  disabled = false,
  onChange,
}) => {
  const percentage = Math.round(value * 100);
  const fillPct    = ((value - min) / (max - min)) * 100;

  return (
    <div className={`space-y-2 ${disabled ? 'opacity-50' : ''}`}>
      <div className="flex justify-between items-baseline">
        <div className="pr-4">
          <p className="text-sm font-bold text-slate-800">{label}</p>
          {description && (
            <p className="text-sm text-slate-400 mt-1 leading-snug">{description}</p>
          )}
        </div>
        <span className="text-2xl font-black tabular-nums text-[#1B5E20] shrink-0">
          {percentage}%
        </span>
      </div>

      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(fieldName, parseFloat(e.target.value))}
        className="w-full h-2 rounded-lg appearance-none cursor-pointer"
        style={{
          background: `linear-gradient(to right, #1B5E20 0%, #1B5E20 ${fillPct}%, #e2e8f0 ${fillPct}%, #e2e8f0 100%)`,
        }}
      />
    </div>
  );
};

// ─── SectionCard ─────────────────────────────────────────────────────────────
const SectionCard = ({ title, subtitle, children }) => (
  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
    <div className="px-6 py-4 border-b border-slate-100">
      <h3 className="font-bold text-slate-800 text-sm">{title}</h3>
      {subtitle && (
        <p className="text-sm text-slate-400 mt-1 leading-snug">{subtitle}</p>
      )}
    </div>
    <div className="px-6 py-5 space-y-6">{children}</div>
  </div>
);

// ─── FormulaPreview ───────────────────────────────────────────────────────────
// Clean white card — no dark background, no code-block feel.
// Laid out as readable labelled rows so it looks like a summary panel,
// not generated markdown.
const FormulaPreview = ({ config }) => {
  const c = config;

  const Row = ({ label, value, sub }) => (
    <div className={`flex justify-between items-baseline ${sub ? 'pl-4' : ''}`}>
      <span className={`text-sm ${sub ? 'text-slate-400' : 'font-semibold text-slate-700'}`}>
        {label}
      </span>
      <span className={`font-bold tabular-nums ${sub ? 'text-slate-500 text-sm' : 'text-[#1B5E20]'}`}>
        {value}
      </span>
    </div>
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100">
        <h3 className="font-bold text-slate-800 text-sm">Live Formula Preview</h3>
        <p className="text-sm text-slate-400 mt-1">Updates as you move the sliders</p>
      </div>

      <div className="px-6 py-5 space-y-4">

        {/* Top-level split */}
        <div className="space-y-2">
          <p className="text-[0.6rem] font-bold text-slate-400 uppercase tracking-widest">
            MCA Score
          </p>
          <Row label="Road Condition (DDI)"       value={pct(c.condition_weight)} />
          <Row label="Socio-Economic Criticality" value={pct(c.criticality_weight)} />
        </div>

        <div className="h-px bg-slate-100" />

        {/* Criticality breakdown */}
        <div className="space-y-2">
          <p className="text-[0.6rem] font-bold text-slate-400 uppercase tracking-widest">
            Criticality Index
          </p>
          <Row label="Population"  value={pct(c.weight_population)} sub />
          <Row label="Healthcare"  value={pct(c.weight_health)}     sub />
          <Row label="Education"   value={pct(c.weight_education)}  sub />
          <Row label="Isolation"   value={pct(c.weight_isolation)}  sub />
        </div>

        <div className="h-px bg-slate-100" />

        {/* Priority thresholds */}
        <div className="space-y-2">
          <p className="text-[0.6rem] font-bold text-slate-400 uppercase tracking-widest">
            Priority Thresholds
          </p>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
              <span className="text-sm text-slate-500">High Priority</span>
            </div>
            <span className="font-bold text-sm text-slate-700">
              MCA ≥ {c.threshold_high.toFixed(1)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
              <span className="text-sm text-slate-500">Medium Priority</span>
            </div>
            <span className="font-bold text-sm text-slate-700">
              MCA ≥ {c.threshold_medium.toFixed(1)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
              <span className="text-sm text-slate-500">Low Priority</span>
            </div>
            <span className="font-bold text-sm text-slate-700">
              MCA &lt; {c.threshold_medium.toFixed(1)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── ValidationWarning ────────────────────────────────────────────────────────
const ValidationWarning = ({ sum, label }) => {
  if (Math.abs(sum - 1.0) < 0.001) return null;
  const over = sum > 1.0;
  const diff = Math.abs(Math.round((1.0 - sum) * 100));
  return (
    <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5">
      <AlertCircle size={14} className="text-amber-500 shrink-0" />
      <p className="text-sm font-semibold text-amber-700">
        {label} weights sum to {Math.round(sum * 100)}% — must equal 100%.{' '}
        {over ? `Reduce by ${diff}%.` : `Increase by ${diff}%.`}
      </p>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const ConfigurationPage = ({ userRole }) => {
  const isSeniorEngineer = userRole === 'SENIOR_ENGINEER';

  const [config, setConfig]           = useState(DEFAULTS);
  const [savedConfig, setSavedConfig] = useState(DEFAULTS);
  const [loadStatus, setLoadStatus]   = useState('idle');
  const [saveStatus, setSaveStatus]   = useState('idle');
  const [recalcStatus, setRecalcStatus] = useState('idle');
  const [recalcMessage, setRecalcMessage] = useState('');
  const [lastUpdatedBy, setLastUpdatedBy] = useState('');

  const isDirty = JSON.stringify(config) !== JSON.stringify(savedConfig);

  useEffect(() => {
    setLoadStatus('loading');
    axios.get(`${API_URL}/api/config/`)
      .then((res) => {
        const d = res.data;
        const loaded = {
          condition_weight:   d.condition_weight,
          criticality_weight: d.criticality_weight,
          weight_population:  d.weight_population,
          weight_health:      d.weight_health,
          weight_education:   d.weight_education,
          weight_isolation:   d.weight_isolation,
          threshold_high:     d.threshold_high,
          threshold_medium:   d.threshold_medium,
        };
        setConfig(loaded);
        setSavedConfig(loaded);
        setLastUpdatedBy(d.last_updated_by || '');
        setLoadStatus('idle');
      })
      .catch(() => setLoadStatus('error'));
  }, []);

  const handleChange = useCallback((field, newValue) => {
    setConfig((prev) => {
      const next = { ...prev, [field]: newValue };
      if (field === 'condition_weight')   next.criticality_weight = parseFloat((1.0 - newValue).toFixed(2));
      if (field === 'criticality_weight') next.condition_weight   = parseFloat((1.0 - newValue).toFixed(2));
      return next;
    });
  }, []);

  const handleRestoreDefaults = () => setConfig({ ...DEFAULTS });

  const handleSave = async () => {
    setSaveStatus('saving');
    try {
      const res = await axios.put(`${API_URL}/api/config/`, config, { headers: authHeader() });
      const d = res.data;
      const saved = {
        condition_weight: d.condition_weight, criticality_weight: d.criticality_weight,
        weight_population: d.weight_population, weight_health: d.weight_health,
        weight_education: d.weight_education,  weight_isolation: d.weight_isolation,
        threshold_high: d.threshold_high,      threshold_medium: d.threshold_medium,
      };
      setSavedConfig(saved);
      setLastUpdatedBy(d.last_updated_by || '');
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 4000);
    }
  };

  const handleRecalculate = async () => {
    setRecalcStatus('running');
    setRecalcMessage('');
    try {
      const res = await axios.post(`${API_URL}/api/recalculate/`, {}, { headers: authHeader() });
      setRecalcMessage(res.data.message || 'Recalculation complete.');
      setRecalcStatus('success');
      setTimeout(() => { setRecalcStatus('idle'); setRecalcMessage(''); }, 5000);
    } catch (err) {
      setRecalcMessage(err.response?.data?.message || 'Recalculation failed. Please try again.');
      setRecalcStatus('error');
      setTimeout(() => { setRecalcStatus('idle'); setRecalcMessage(''); }, 5000);
    }
  };

  const topSum = config.condition_weight + config.criticality_weight;
  const subSum = config.weight_population + config.weight_health +
                 config.weight_education  + config.weight_isolation;
  const isFormValid = Math.abs(topSum - 1.0) < 0.001
                   && Math.abs(subSum - 1.0) < 0.001
                   && config.threshold_high > config.threshold_medium;

  return (
    <div className="flex flex-col min-h-screen bg-slate-100 font-sans pb-16">

      {/* ── Page Header ── */}
      <header className="flex justify-between items-center px-10 py-5 bg-white border-b border-slate-200">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800">Algorithm Configuration</h2>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            Adjust MCA weights and priority thresholds
          </p>
        </div>
        {lastUpdatedBy && (
          <div className="text-[0.65rem] text-slate-400 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-right">
            <span className="font-semibold text-slate-600">Last saved by</span>
            <br />{lastUpdatedBy}
          </div>
        )}
      </header>

      {/* ── View-only banner ── */}
      {!isSeniorEngineer && (
        <div className="mx-10 mt-6 flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4">
          <AlertCircle size={18} className="text-amber-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-bold text-amber-800">View-only mode</p>
            <p className="text-sm text-amber-600 mt-0.5">
              You can view the current algorithm configuration, but only a Senior Engineer
              can save changes or trigger a network recalculation.
            </p>
          </div>
        </div>
      )}

      {/* ── Loading state ── */}
      {loadStatus === 'loading' && (
        <div className="flex items-center justify-center py-20">
          <Loader size={24} className="animate-spin text-[#1B5E20]" />
          <span className="ml-3 text-sm text-slate-500">Loading configuration…</span>
        </div>
      )}

      {loadStatus === 'error' && (
        <div className="mx-10 mt-6 flex items-center gap-3 bg-red-50 border border-red-200 rounded-2xl px-5 py-4">
          <AlertCircle size={18} className="text-red-500 shrink-0" />
          <p className="text-sm text-red-700 font-medium">
            Could not load configuration from the server. Showing default values.
          </p>
        </div>
      )}

      {loadStatus !== 'loading' && (
        <div className="px-10 py-6 grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-6">

          {/* ── LEFT: Sliders ── */}
          <div className="space-y-6">

            <SectionCard
              title="Primary Weighting: Condition vs. Criticality"
              subtitle="Controls how much the physical road condition (DDI) versus socio-economic importance contributes to the final MCA score. These two weights always sum to 100%."
            >
              <WeightSlider
                label="Road Condition Weight"
                description="Weight given to the Damage Density Index (DDI) — reflects the physical state of the road surface."
                fieldName="condition_weight"
                value={config.condition_weight}
                disabled={!isSeniorEngineer}
                onChange={handleChange}
              />
              <WeightSlider
                label="Socio-Economic Criticality Weight"
                description="Weight given to the Criticality Index — reflects how many people and services depend on this road."
                fieldName="criticality_weight"
                value={config.criticality_weight}
                disabled={!isSeniorEngineer}
                onChange={handleChange}
              />
              <ValidationWarning sum={topSum} label="Primary" />
            </SectionCard>

            <SectionCard
              title="Criticality Sub-Weights"
              subtitle="Determines how population, healthcare access, educational access, and road isolation each contribute to the Criticality Index. These four weights must sum to 100%."
            >
              <WeightSlider
                label="Population Weight"
                description="Roads serving larger populations (within 2km catchment) score higher. Capped at 15,000 residents."
                fieldName="weight_population"
                value={config.weight_population}
                disabled={!isSeniorEngineer}
                onChange={handleChange}
              />
              <WeightSlider
                label="Healthcare Access Weight"
                description="Roads giving access to health facilities. Tiered: 1 facility = medium score, 2+ = full score."
                fieldName="weight_health"
                value={config.weight_health}
                disabled={!isSeniorEngineer}
                onChange={handleChange}
              />
              <WeightSlider
                label="Education Access Weight"
                description="Roads giving access to schools. Same tiered logic as healthcare."
                fieldName="weight_education"
                value={config.weight_education}
                disabled={!isSeniorEngineer}
                onChange={handleChange}
              />
              <WeightSlider
                label="Isolation Weight"
                description="Roads that are the sole access route to a community receive full score. Binary indicator."
                fieldName="weight_isolation"
                value={config.weight_isolation}
                disabled={!isSeniorEngineer}
                onChange={handleChange}
              />
              <ValidationWarning sum={subSum} label="Criticality sub-" />
            </SectionCard>

            <SectionCard
              title="Priority Classification Thresholds"
              subtitle="MCA scores range from 0 to 5. These thresholds determine which priority bucket each road segment falls into."
            >
              <div className="grid grid-cols-2 gap-8">

                {/* High threshold */}
                <div className="space-y-2">
                  <div className="flex justify-between items-baseline">
                    <div className="pr-3">
                      <p className="text-sm font-bold text-slate-800">High Priority Threshold</p>
                      <p className="text-sm text-slate-400 mt-1">Score ≥ this → Critical (Red)</p>
                    </div>
                    <span className="text-2xl font-black text-[#1B5E20] shrink-0">
                      {config.threshold_high.toFixed(1)}
                    </span>
                  </div>
                  <input
                    type="range" min={2.5} max={5.0} step={0.1}
                    value={config.threshold_high}
                    disabled={!isSeniorEngineer}
                    onChange={(e) => handleChange('threshold_high', parseFloat(e.target.value))}
                    className={`w-full h-2 rounded-lg appearance-none ${!isSeniorEngineer ? 'opacity-50' : 'cursor-pointer'}`}
                    style={{
                      background: `linear-gradient(to right, #1B5E20 0%, #1B5E20 ${((config.threshold_high - 2.5) / 2.5) * 100}%, #e2e8f0 ${((config.threshold_high - 2.5) / 2.5) * 100}%, #e2e8f0 100%)`,
                    }}
                  />
                </div>

                {/* Medium threshold */}
                <div className="space-y-2">
                  <div className="flex justify-between items-baseline">
                    <div className="pr-3">
                      <p className="text-sm font-bold text-slate-800">Medium Priority Threshold</p>
                      <p className="text-sm text-slate-400 mt-1">Score ≥ this → Medium (Amber)</p>
                    </div>
                    <span className="text-2xl font-black text-[#1B5E20] shrink-0">
                      {config.threshold_medium.toFixed(1)}
                    </span>
                  </div>
                  <input
                    type="range" min={0.5} max={4.0} step={0.1}
                    value={config.threshold_medium}
                    disabled={!isSeniorEngineer}
                    onChange={(e) => handleChange('threshold_medium', parseFloat(e.target.value))}
                    className={`w-full h-2 rounded-lg appearance-none ${!isSeniorEngineer ? 'opacity-50' : 'cursor-pointer'}`}
                    style={{
                      background: `linear-gradient(to right, #1B5E20 0%, #1B5E20 ${((config.threshold_medium - 0.5) / 3.5) * 100}%, #e2e8f0 ${((config.threshold_medium - 0.5) / 3.5) * 100}%, #e2e8f0 100%)`,
                    }}
                  />
                </div>
              </div>

              {config.threshold_high <= config.threshold_medium && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">
                  <AlertCircle size={14} className="text-red-500 shrink-0" />
                  <p className="text-sm font-semibold text-red-700">
                    High threshold must be greater than Medium threshold.
                  </p>
                </div>
              )}
            </SectionCard>
          </div>

          {/* ── RIGHT: Formula preview + actions ── */}
          <div className="space-y-5">

            <FormulaPreview config={config} />

            {isDirty && (
              <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-2.5">
                <AlertCircle size={14} className="text-[#1B5E20] shrink-0" />
                <p className="text-sm font-semibold text-[#1B5E20]">
                  You have unsaved changes. Save before recalculating.
                </p>
              </div>
            )}

            {/* Action buttons */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-3">
              <p className="text-[0.6rem] font-bold text-slate-400 uppercase tracking-widest">
                Actions
              </p>

              {/* Save */}
              <button
                onClick={handleSave}
                disabled={!isSeniorEngineer || saveStatus === 'saving' || !isFormValid}
                className={`
                  w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl
                  text-sm font-bold transition-all
                  ${!isSeniorEngineer || !isFormValid
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    : saveStatus === 'success'
                      ? 'bg-green-500 text-white'
                      : saveStatus === 'error'
                        ? 'bg-red-50 text-red-600 border border-red-200'
                        : 'bg-[#1B5E20] text-white hover:bg-green-900 shadow-sm'
                  }
                `}
              >
                {saveStatus === 'saving'  && <Loader size={16} className="animate-spin" />}
                {saveStatus === 'success' && <CheckCircle size={16} />}
                {saveStatus === 'error'   && <AlertCircle size={16} />}
                {saveStatus === 'idle'    && <Save size={16} />}
                {saveStatus === 'saving' ? 'Saving…' : saveStatus === 'success' ? 'Saved!' : saveStatus === 'error' ? 'Save failed' : 'Save Configuration'}
              </button>

              {/* Recalculate */}
              <button
                onClick={handleRecalculate}
                disabled={!isSeniorEngineer || recalcStatus === 'running' || isDirty}
                className={`
                  w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl
                  text-sm font-bold border transition-all
                  ${!isSeniorEngineer || isDirty
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed border-transparent'
                    : recalcStatus === 'success'
                      ? 'bg-green-50 text-green-700 border-green-200'
                      : recalcStatus === 'error'
                        ? 'bg-red-50 text-red-600 border-red-200'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50 hover:border-slate-400'
                  }
                `}
              >
                {recalcStatus === 'running' && <Loader size={16} className="animate-spin" />}
                {recalcStatus === 'success' && <CheckCircle size={16} />}
                {recalcStatus === 'error'   && <AlertCircle size={16} />}
                {recalcStatus === 'idle'    && <RefreshCcw size={16} />}
                {recalcStatus === 'running' ? 'Recalculating…' : recalcStatus === 'success' ? 'Done!' : recalcStatus === 'error' ? 'Failed' : 'Recalculate Network'}
              </button>

              {recalcMessage && (
                <p className={`text-sm font-medium text-center px-2 ${recalcStatus === 'error' ? 'text-red-500' : 'text-green-600'}`}>
                  {recalcMessage}
                </p>
              )}

              {/* Restore defaults */}
              <button
                onClick={handleRestoreDefaults}
                disabled={!isSeniorEngineer}
                className={`
                  w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl
                  text-sm font-bold transition-all border
                  ${!isSeniorEngineer
                    ? 'opacity-40 cursor-not-allowed border-transparent text-slate-400'
                    : 'border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50'
                  }
                `}
              >
                <RotateCcw size={13} />
                Restore Defaults
              </button>
            </div>

            {/* How this works */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              <p className="text-[0.6rem] font-bold text-slate-400 uppercase tracking-widest mb-3">
                How this works
              </p>
              <div className="space-y-3 text-sm text-slate-500 leading-relaxed">
                <p>
                  <span className="font-bold text-slate-700">1. Adjust weights</span> using the sliders. The formula preview updates instantly.
                </p>
                <p>
                  <span className="font-bold text-slate-700">2. Save</span> to persist the new weights to the database. This does not yet update road scores.
                </p>
                <p>
                  <span className="font-bold text-slate-700">3. Recalculate Network</span> to re-score all 1,555 road segments. The dashboard map will reflect the new priorities immediately.
                </p>
                <p className="text-sm text-slate-400 border-t border-slate-100 pt-3">
                  Only <span className="font-bold">Senior Engineers</span> can save or trigger recalculation.
                </p>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default ConfigurationPage;