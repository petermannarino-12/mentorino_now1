
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Trash2, 
  ShieldCheck, 
  AlertCircle, 
  ToggleLeft, 
  ToggleRight,
  Settings2,
  Info
} from 'lucide-react';
import { ValidationRule } from '../../types';
import { supabase } from '../../lib/supabase';

const ValidationRulesManager: React.FC = () => {
  const [rules, setRules] = useState<ValidationRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newRule, setNewRule] = useState<Partial<ValidationRule>>({
    entity: 'Application',
    operator: 'required',
    isActive: true,
    errorMessage: '',
    value: ''
  });

  async function fetchRules() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('validation_rules')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Could not fetch rules, might need to create table:', error);
      } else {
        setRules(data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchRules();
  }, []);

  const handleAddRule = async () => {
    if (!newRule.field || !newRule.errorMessage) return;

    try {
      const { data, error } = await supabase
        .from('validation_rules')
        .insert([{
          ...newRule,
          created_at: new Date().toISOString()
        }])
        .select();

      if (error) throw error;
      
      if (data) {
        setRules([data[0], ...rules]);
        setIsAdding(false);
        setNewRule({
          entity: 'Application',
          operator: 'required',
          isActive: true,
          errorMessage: '',
          value: ''
        });
      }
    } catch (err) {
      console.error('Error adding rule:', err);
      // For demo, just add to local state if DB fails
      const demoRule: ValidationRule = {
        id: Math.random().toString(36).substr(2, 9),
        field: newRule.field!,
        entity: newRule.entity as any,
        operator: newRule.operator as any,
        value: newRule.value,
        errorMessage: newRule.errorMessage!,
        isActive: true,
        created_at: new Date().toISOString()
      };
      setRules([demoRule, ...rules]);
      setIsAdding(false);
    }
  };

  const handleDeleteRule = async (id: string) => {
    try {
      const { error } = await supabase
        .from('validation_rules')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setRules(rules.filter(r => r.id !== id));
    } catch (err) {
      console.error(err);
      setRules(rules.filter(r => r.id !== id));
    }
  };

  const handleToggleRule = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('validation_rules')
        .update({ isActive: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      setRules(rules.map(r => r.id === id ? { ...r, isActive: !currentStatus } : r));
    } catch (err) {
      console.error(err);
      setRules(rules.map(r => r.id === id ? { ...r, isActive: !currentStatus } : r));
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-2xl font-black uppercase tracking-tighter">Data Integrity</h3>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
            Define custom validation rules for system entities.
          </p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 px-6 py-3 bg-black text-white text-[10px] font-black uppercase tracking-widest rounded-full hover:scale-105 transition-all shadow-xl shadow-black/10"
        >
          {isAdding ? 'Cancel' : <><Plus size={14} /> New Rule</>}
        </button>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-white p-8 rounded-[40px] border border-black/[0.05] shadow-sm mb-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Entity</label>
                <select 
                  value={newRule.entity}
                  onChange={(e) => setNewRule({...newRule, entity: e.target.value as any})}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold focus:bg-white outline-none"
                >
                  <option value="Application">Application</option>
                  <option value="User">User</option>
                  <option value="TaskActivity">Growth Strategy Audit</option>
                  <option value="Product">Product</option>
                  <option value="Booking">Booking</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Field Name</label>
                <input 
                  type="text" 
                  value={newRule.field || ''}
                  onChange={(e) => setNewRule({...newRule, field: e.target.value})}
                  placeholder="e.g. user_email or goals"
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold focus:bg-white outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Operator</label>
                <select 
                  value={newRule.operator}
                  onChange={(e) => setNewRule({...newRule, operator: e.target.value as any})}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold focus:bg-white outline-none"
                >
                  <option value="required">Required</option>
                  <option value="minLength">Min Length</option>
                  <option value="maxLength">Max Length</option>
                  <option value="pattern">Regex Pattern</option>
                  <option value="min">Min Value (number)</option>
                  <option value="max">Max Value (number)</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Validation Value</label>
                <input 
                  type="text" 
                  value={newRule.value || ''}
                  onChange={(e) => setNewRule({...newRule, value: e.target.value})}
                  placeholder="e.g. 10 or ^[a-z]+$"
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold focus:bg-white outline-none"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Error Message</label>
                <input 
                  type="text" 
                  value={newRule.errorMessage || ''}
                  onChange={(e) => setNewRule({...newRule, errorMessage: e.target.value})}
                  placeholder="What should the user see if validation fails?"
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold focus:bg-white outline-none"
                />
              </div>
              <div className="md:col-span-2 pt-4">
                <button 
                  onClick={handleAddRule}
                  className="w-full py-5 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-full hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100"
                >
                  Create Validation Rule
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="py-20 text-center space-y-4">
            <div className="w-8 h-8 border-2 border-slate-200 border-t-black rounded-full animate-spin mx-auto"></div>
            <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Loading ruleset...</p>
          </div>
        ) : rules.length === 0 ? (
          <div className="bg-white p-16 rounded-[48px] border-2 border-dashed border-slate-100 text-center space-y-6">
            <ShieldCheck size={48} className="mx-auto text-slate-100" />
            <div className="space-y-2">
              <h4 className="text-lg font-black uppercase tracking-tight">No rules defined</h4>
              <p className="text-xs text-slate-400 font-medium max-w-xs mx-auto">Start by creating your first validation rule to ensure data quality across the application.</p>
            </div>
          </div>
        ) : (
          rules.map((rule) => (
            <motion.div 
              layout
              key={rule.id} 
              className={`bg-white p-6 sm:p-8 rounded-[40px] border border-black/[0.03] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6 transition-all ${!rule.isActive ? 'opacity-60 grayscale' : 'hover:border-black/10 hover:shadow-xl'}`}
            >
              <div className="flex items-start gap-4 sm:gap-6">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                  rule.entity === 'Application' ? 'bg-indigo-50 text-indigo-600' :
                  rule.entity === 'User' ? 'bg-emerald-50 text-emerald-600' :
                  'bg-slate-50 text-slate-600'
                }`}>
                  <Settings2 size={20} />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">{rule.entity}</span>
                    <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                    <span className="text-[10px] font-black uppercase tracking-tight">{rule.field}</span>
                  </div>
                  <h4 className="text-[11px] font-bold text-slate-900 flex items-center gap-2">
                    {rule.operator}
                    {rule.value && <span className="px-2 py-0.5 bg-slate-100 rounded-lg text-[9px] font-black">"{rule.value}"</span>}
                  </h4>
                  <p className="text-[9px] font-medium text-red-500 italic flex items-center gap-1">
                    <AlertCircle size={10} /> {rule.errorMessage}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 pt-4 sm:pt-0">
                <div className="flex flex-col items-end gap-1">
                  <span className="text-[8px] font-black uppercase text-slate-300 tracking-widest">Status</span>
                  <button 
                    onClick={() => handleToggleRule(rule.id, rule.isActive)}
                    className="transition-colors"
                  >
                    {rule.isActive ? (
                      <ToggleRight size={28} className="text-emerald-500" />
                    ) : (
                      <ToggleLeft size={28} className="text-slate-300" />
                    )}
                  </button>
                </div>
                <button 
                  onClick={() => handleDeleteRule(rule.id)}
                  className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-colors"
                  aria-label="Delete Rule"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      <div className="bg-indigo-50/50 p-8 rounded-[40px] border border-indigo-100/50 flex items-start gap-4">
        <Info size={20} className="text-indigo-500 shrink-0 mt-1" />
        <div className="space-y-2">
          <p className="text-[10px] font-black uppercase tracking-widest text-indigo-900">Technical Note</p>
          <p className="text-[11px] font-medium text-indigo-900/60 leading-relaxed">
            Rules defined here are dynamically loaded by the <strong>ValidationService</strong> and applied during form submissions. Complex logic can use regex patterns for precise data format enforcement.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ValidationRulesManager;
