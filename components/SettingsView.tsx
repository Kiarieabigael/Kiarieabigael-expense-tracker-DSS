
import React, { useState } from 'react';
import { Shield, Database, Trash2, Download, Sparkles, AlertCircle, ChevronRight, Lock, Key, X, Loader2, FileJson } from 'lucide-react';
import { AppSettings, Expense, Income } from '../types';
import { encryptExportData, decryptExportData } from '../utils/exportEncryption';

interface SettingsViewProps {
  settings: AppSettings;
  expenses: Expense[];
  incomes: Income[];
  onUpdate: (settings: AppSettings) => void;
  onClearData: () => void;
  onImport: (data: { expenses: Expense[], incomes: Income[], settings: AppSettings }) => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ settings, expenses, incomes, onUpdate, onClearData, onImport }) => {
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [backupPassword, setBackupPassword] = useState('');
  const [importPassword, setImportPassword] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [importFileContent, setImportFileContent] = useState<string | null>(null);

  const handlePlainExport = () => {
    const dataStr = JSON.stringify({ expenses, incomes, settings }, null, 2);
    downloadFile(dataStr, 'settle_backup_plain.json');
  };

  const handleEncryptedExport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (backupPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    
    setIsProcessing(true);
    setError(null);
    try {
      const data = { expenses, incomes, settings };
      const encrypted = await encryptExportData(data, backupPassword);
      downloadFile(encrypted, 'settle_backup_encrypted.vault');
      setIsExportModalOpen(false);
      setBackupPassword('');
    } catch (err) {
      setError("Encryption failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadFile = (content: string, fileName: string) => {
    const dataUri = 'data:application/octet-stream;charset=utf-8,' + encodeURIComponent(content);
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', fileName);
    linkElement.click();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setImportFileContent(content);
      setError(null);
    };
    reader.readAsText(file);
  };

  const handleImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importFileContent) return;

    setIsProcessing(true);
    setError(null);

    try {
      let data;
      // Heuristic: if it contains ":", it's likely our encrypted format
      if (importFileContent.includes(':')) {
        data = await decryptExportData(importFileContent, importPassword);
      } else {
        data = JSON.parse(importFileContent);
      }

      if (data && (data.expenses || data.incomes)) {
        if (window.confirm("Importing will merge with or overwrite current data. Continue?")) {
          onImport(data);
          setIsImportModalOpen(false);
          setImportFileContent(null);
          setImportPassword('');
        }
      } else {
        throw new Error("Invalid file content");
      }
    } catch (err) {
      setError("Failed to decrypt or parse file. Check your password.");
    } finally {
      setIsProcessing(false);
    }
  };

  const confirmDelete = () => {
    if (window.confirm("CRITICAL: Are you sure? This will delete all your local data permanently. This action cannot be undone.")) {
      onClearData();
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-10 animate-in fade-in duration-500">
      <header>
        <h2 className="text-3xl font-semibold text-slate-900 tracking-tight">Privacy & Control</h2>
        <p className="text-slate-500 mt-1">Full sovereignty over your financial records.</p>
      </header>

      {/* Privacy Promise */}
      <section className="bg-indigo-900 rounded-3xl p-8 text-white shadow-xl shadow-indigo-100 relative overflow-hidden">
        <Lock className="absolute top-0 right-0 opacity-10 -mr-4 -mt-4" size={120} />
        <div className="flex items-start gap-4 relative z-10">
          <div className="bg-white/10 p-3 rounded-2xl">
            <Shield size={32} />
          </div>
          <div>
            <h3 className="text-xl font-bold mb-2">Our Privacy Standard</h3>
            <p className="text-indigo-100 leading-relaxed text-sm">
              Settle is a <strong>local-first</strong> vault. To power the Financial Intelligence features, we use anonymized aggregation: we send <strong>only category totals</strong> to Google Gemini. 
              Your raw transaction descriptions stay on your device, and your backups can be protected with <strong>AES-GCM 256-bit encryption</strong>.
            </p>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Core Settings */}
        <section className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-8">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Sparkles size={20} className="text-indigo-500" /> Intelligence
          </h3>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-700">AI Features</p>
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Global Opt-out</p>
              </div>
              <button 
                onClick={() => onUpdate({ ...settings, isAIFeaturesEnabled: !settings.isAIFeaturesEnabled })}
                className={`w-12 h-6 rounded-full transition-all relative ${settings.isAIFeaturesEnabled ? 'bg-indigo-600' : 'bg-slate-200'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.isAIFeaturesEnabled ? 'left-7' : 'left-1'}`} />
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Monthly Budget Target</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">{settings.currency}</span>
                <input 
                  type="number"
                  value={settings.monthlyBudget}
                  onChange={(e) => onUpdate({ ...settings, monthlyBudget: parseInt(e.target.value) || 0 })}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm font-medium"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Data Management */}
        <section className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-8">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Database size={20} className="text-indigo-500" /> Local Vault
          </h3>

          <div className="space-y-4">
            <button 
              onClick={() => setIsExportModalOpen(true)}
              className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 rounded-2xl transition-all border border-transparent hover:border-indigo-100 group"
            >
              <div className="flex items-center gap-3">
                <Lock size={18} className="text-indigo-400" />
                <span className="text-sm font-semibold">Encrypted Export</span>
              </div>
              <ChevronRight size={16} className="opacity-40" />
            </button>

            <button 
              onClick={() => setIsImportModalOpen(true)}
              className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 rounded-2xl transition-all border border-transparent hover:border-indigo-100 group"
            >
              <div className="flex items-center gap-3">
                <FileJson size={18} className="text-indigo-400" />
                <span className="text-sm font-semibold">Import Backup</span>
              </div>
              <ChevronRight size={16} className="opacity-40" />
            </button>

            <button 
              onClick={confirmDelete}
              className="w-full flex items-center justify-between p-4 bg-rose-50/30 hover:bg-rose-50 text-rose-600 rounded-2xl transition-all border border-transparent hover:border-rose-100"
            >
              <div className="flex items-center gap-3">
                <Trash2 size={18} />
                <span className="text-sm font-semibold">Purge All Data</span>
              </div>
              <ChevronRight size={16} className="opacity-40" />
            </button>
          </div>
        </section>
      </div>

      {/* Export Modal */}
      {isExportModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[32px] w-full max-w-md p-8 shadow-2xl space-y-6 animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-900">Secure Export</h3>
              <button onClick={() => setIsExportModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={20} /></button>
            </div>
            
            <p className="text-sm text-slate-500 leading-relaxed">
              Set a password to protect your vault. We use <strong>AES-GCM</strong> to ensure only you can read this file later.
            </p>

            <form onSubmit={handleEncryptedExport} className="space-y-4">
              <div className="relative group">
                <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={20} />
                <input 
                  type="password"
                  placeholder="Encryption Password (min 8 chars)"
                  value={backupPassword}
                  onChange={(e) => setBackupPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium"
                  required
                />
              </div>

              {error && <p className="text-xs text-rose-500 font-bold flex items-center gap-1"><AlertCircle size={12} /> {error}</p>}

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button 
                  type="button"
                  onClick={handlePlainExport}
                  className="py-4 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-all text-sm"
                >
                  Plain JSON
                </button>
                <button 
                  type="submit"
                  disabled={isProcessing}
                  className="py-4 bg-indigo-600 text-white font-bold rounded-2xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all text-sm flex items-center justify-center gap-2"
                >
                  {isProcessing ? <Loader2 size={18} className="animate-spin" /> : <><Lock size={18} /> Encrypt</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[32px] w-full max-w-md p-8 shadow-2xl space-y-6 animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-900">Restore Vault</h3>
              <button onClick={() => setIsImportModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={20} /></button>
            </div>
            
            <p className="text-sm text-slate-500">Select a <code>.vault</code> or <code>.json</code> backup file.</p>

            <form onSubmit={handleImportSubmit} className="space-y-4">
              <input 
                type="file" 
                accept=".vault,.json"
                onChange={handleFileSelect}
                className="w-full text-sm text-slate-500 file:mr-4 file:py-3 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
              />

              {importFileContent?.includes(':') && (
                <div className="relative group">
                  <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={20} />
                  <input 
                    type="password"
                    placeholder="Decryption Password"
                    value={importPassword}
                    onChange={(e) => setImportPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium"
                    required
                  />
                </div>
              )}

              {error && <p className="text-xs text-rose-500 font-bold flex items-center gap-1"><AlertCircle size={12} /> {error}</p>}

              <button 
                type="submit"
                disabled={isProcessing || !importFileContent}
                className="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isProcessing ? <Loader2 size={18} className="animate-spin" /> : <><Download size={18} /> Restore Now</>}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsView;
