import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowRight, ArrowLeft, Loader2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import SEO from '../components/SEO';
import { productService } from '../services/productService';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

const StorePage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [requestMessage, setRequestMessage] = useState('');
  const [requestingId, setRequestingId] = useState<string | null>(null);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: productService.getAll,
    staleTime: 60_000,
  });

  const handleSendRequest = async () => {
    if (!selectedProduct || !user) return;
    setRequestingId(selectedProduct.id);
    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token;
      const res = await fetch('/.netlify/functions/request-product-access', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: selectedProduct.id,
          product_name: selectedProduct.full_name,
          message: requestMessage,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success('Request sent! The mentor will review it.');
      setSelectedProduct(null);
      setRequestMessage('');
    } catch (err: any) {
      toast.error(err.message || 'Failed to send request.');
    } finally {
      setRequestingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-md md:max-w-4xl lg:max-w-6xl mx-auto py-20 flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-slate-300" />
      </div>
    );
  }

  return (
    <div className="max-w-md md:max-w-4xl lg:max-w-6xl mx-auto space-y-6 sm:space-y-8 md:space-y-10 py-6 px-4 md:px-0 animate-in fade-in duration-700">
      <SEO 
        title="The Vault" 
        description="Premium strategic assets, templates, and resources to accelerate your professional trajectory."
      />
      <div className="flex flex-col gap-4 sm:gap-6">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-white border border-black/[0.05] rounded-full shadow-sm hover:scale-110 active:scale-95 transition-all group"
        >
          <ArrowLeft size={18} className="sm:w-5 sm:h-5 text-black group-hover:-translate-x-1 transition-transform" />
        </button>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tighter mb-1 sm:mb-2 text-slate-900">The Vault.</h1>
            <p className="text-[9px] sm:text-[10px] text-slate-400 font-black uppercase tracking-[0.3em]">Premium Strategic Assets</p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:flex-none">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
              <input 
                type="text" 
                placeholder="Search..." 
                className="pl-10 pr-4 py-3.5 sm:py-4 bg-white border border-black/[0.03] rounded-xl sm:rounded-2xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest w-full md:w-64 focus:border-black outline-none transition-all shadow-sm"
              />
            </div>
            <div className="w-12 h-12"></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
        {products.map((product) => (
          <div key={product.id} className="group bg-white border border-black/[0.03] rounded-[32px] sm:rounded-[48px] overflow-hidden hover:shadow-xl hover:border-black/10 transition-all duration-500 flex flex-col">
            <div className="aspect-[4/3] relative overflow-hidden bg-slate-100">
              <img 
                src={product.image} 
                alt={product.full_name} 
                className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700"
                loading="lazy"
              />
              <div className="absolute top-4 left-4 sm:top-6 sm:left-6">
                <span className="px-3 sm:px-4 py-1 sm:py-1.5 bg-white/90 backdrop-blur-md rounded-full text-[7px] sm:text-[8px] font-black uppercase tracking-widest shadow-sm">
                  {product.category}
                </span>
              </div>
            </div>
            <div className="p-6 sm:p-8 flex flex-col flex-1">
              <h3 className="text-lg sm:text-xl font-black uppercase tracking-tight mb-2 sm:mb-3">{product.full_name}</h3>
              <p className="text-slate-400 text-[10px] sm:text-xs mb-6 sm:mb-8 line-clamp-2 leading-relaxed font-semibold">
                {product.description}
              </p>
              <div className="flex items-center justify-between mt-auto pt-4 sm:pt-6 border-t border-black/[0.02]">
                <span className="text-xl sm:text-2xl font-black text-black">${product.price}</span>
                <button
                  onClick={() => { setSelectedProduct(product); setRequestMessage(''); }}
                  className="btn-compact flex items-center gap-2 bg-black text-white hover:bg-slate-800"
                >
                  <span>Request Access</span> <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
        {products.length === 0 && (
          <div className="col-span-full py-20 text-center space-y-4 bg-white/50 border border-dashed border-black/10 rounded-[48px]">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">No products available in the vault</p>
          </div>
        )}
      </div>
    </div>

      <AnimatePresence>
        {selectedProduct && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProduct(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[40px] sm:rounded-[48px] shadow-2xl overflow-hidden p-8 sm:p-10"
            >
              <button
                onClick={() => setSelectedProduct(null)}
                className="absolute top-6 right-6 w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center hover:bg-black hover:text-white transition-all group"
              >
                <X size={18} className="group-hover:rotate-90 transition-transform" />
              </button>

              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-slate-100 rounded-2xl overflow-hidden shrink-0">
                  {selectedProduct.image && <img src={selectedProduct.image} className="w-full h-full object-cover" />}
                </div>
                <div className="min-w-0">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Product</p>
                  <h3 className="text-lg font-black uppercase tracking-tight truncate">{selectedProduct.full_name}</h3>
                </div>
              </div>

              <div className="h-px bg-slate-100 mb-6" />

              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Contact the mentor to get access</p>
              <p className="text-sm text-slate-600 mb-6 leading-relaxed">Write a brief message explaining why you'd like access to this resource. The mentor will review your request.</p>

              <textarea
                value={requestMessage}
                onChange={e => setRequestMessage(e.target.value)}
                placeholder="Hi, I'm interested in this resource because..."
                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-medium focus:bg-white focus:border-black transition-all outline-none resize-none h-32 mb-6"
              />

              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="flex-1 py-4 border-2 border-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] rounded-full hover:border-slate-300 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendRequest}
                  disabled={requestingId === selectedProduct.id}
                  className="flex-1 py-4 bg-black text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-full hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {requestingId === selectedProduct.id ? <Loader2 size={14} className="animate-spin" /> : 'Send Request'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
 
export default StorePage;
