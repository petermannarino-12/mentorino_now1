import React from 'react';
import { motion } from 'motion/react';
import { ShoppingCart, Loader2, CheckCircle2, Clock, XCircle, ArrowRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Transaction } from '../../types';
import { supabase } from '../../lib/supabase';
import { EmptyState } from '../../components/ui/EmptyState';
import SEO from '../../components/SEO';

const Purchases: React.FC = () => {
  const navigate = useNavigate();

  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ['purchases'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return [];
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', session.user.id)
        .order('date', { ascending: false });
      if (error) return [];
      return data as Transaction[];
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 size={24} className="animate-spin text-slate-300" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 px-4 pt-8 pb-20">
      <SEO title="My Purchases | Mentorino" description="View your purchase history and downloaded resources." />

      <div className="flex items-center gap-2">
        <div className="w-1.5 h-1.5 bg-black rounded-full"></div>
        <span className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-400">Purchases</span>
      </div>
      <h1 className="text-4xl font-black uppercase tracking-tighter text-black leading-none">
        My <span className="text-slate-300">Purchases.</span>
      </h1>

      {transactions.length === 0 ? (
        <EmptyState
          title="No Purchases Yet"
          description="Your resource downloads and purchases will appear here."
          icon={ShoppingCart}
          actionLabel="Visit the Vault"
          onAction={() => navigate('/vault')}
        />
      ) : (
        <div className="space-y-3">
          {transactions.map((t, i) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white p-5 rounded-[32px] border border-black/[0.03] shadow-sm flex items-center justify-between group hover:border-black/10 transition-all"
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                  t.status === 'successful' ? 'bg-emerald-50 text-emerald-500' :
                  t.status === 'pending' ? 'bg-amber-50 text-amber-500' :
                  'bg-red-50 text-red-500'
                }`}>
                  {t.status === 'successful' ? <CheckCircle2 size={20} /> :
                   t.status === 'pending' ? <Clock size={20} /> :
                   <XCircle size={20} />}
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase">{t.product}</h4>
                  <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">
                    {t.user_name} • {new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm font-black">${t.amount}</span>
                <span className={`px-3 py-1 rounded-full text-[7px] font-black uppercase tracking-widest ${
                  t.status === 'successful' ? 'bg-emerald-50 text-emerald-500' :
                  t.status === 'pending' ? 'bg-amber-50 text-amber-500' :
                  'bg-red-50 text-red-500'
                }`}>
                  {t.status}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Purchases;
