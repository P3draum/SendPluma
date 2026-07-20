"use client";

import { useState, useEffect } from "react";
import PillNav from "@/components/PillNav";
import { motion, AnimatePresence } from "framer-motion";
import { Gift, Coffee, Scroll, Moon, ArrowRight, X, Mail, CheckCircle2, Wine, BookOpen, Shirt, Star } from "lucide-react";
import { supabase } from "@/lib/supabase";

const PRODUCTS = [
  {
    id: "box-celebracao",
    title: "Box Celebração",
    description: "Vinho tinto selecionado, taça de cristal personalizada, bombons artesanais. Agende o envio para a data perfeita. Cartão com a mensagem da carta impressa + adesivo dourado.",
    icon: Wine,
    color: "rose",
    badge: "Edição de Época"
  },
  {
    id: "box-conforto",
    title: "Box Conforto",
    description: "Caneca de cerâmica fosca, conjunto de chás ou café gourmet, meias de algodão premium. Um presente físico que chega com a precisão de um voo. Adesivo 'Ave Viajante'.",
    icon: Coffee,
    color: "amber",
    badge: "Curadoria Especial"
  },
  {
    id: "box-memoria",
    title: "Box Memória",
    description: "Caderno de capa dura, canetas premium, kit de revelação Polaroid. Agende o pouso e eternize memórias. Lacre de cera com selo do pombo correio.",
    icon: BookOpen,
    color: "indigo",
    badge: "Edição Limitada"
  },
  {
    id: "box-estilo",
    title: "Box Estilo",
    description: "Camiseta de algodão pima minimalista, ecobag de lona, pins metálicos. Um presente físico perfumado com essência exclusiva que chega com a precisão de um voo.",
    icon: Shirt,
    color: "emerald",
    badge: "Pronta Entrega"
  }
];

export default function PresentesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    // Tenta preencher o email automaticamente se o usuário estiver logado
    async function fetchUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        setEmail(user.email);
      }
    }
    fetchUser();
  }, []);

  const handleOpenModal = (productId: string) => {
    setSelectedProduct(productId);
    setIsModalOpen(true);
    setIsSuccess(false);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => {
      setSelectedProduct(null);
      setIsSuccess(false);
    }, 300);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simula uma chamada à API de waitlist
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 1500);
  };

  return (
    <div className="min-h-screen font-sans relative">

      <PillNav />

      <main className="relative z-10 max-w-6xl mx-auto px-6 pt-40 pb-24">
        
        {/* Header / Hero */}
        <div className="text-center max-w-2xl mx-auto space-y-6 mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-zinc-200/60 shadow-sm text-xs font-semibold text-zinc-600 tracking-wide uppercase">
            <Gift className="w-3.5 h-3.5 text-amber-500" />
            Em Breve
          </div>
          <h1 className="font-serif text-5xl sm:text-6xl font-semibold tracking-tight text-zinc-900 leading-tight">
            A experiência física <br /> da SendPluma
          </h1>
          <p className="text-zinc-600 leading-relaxed max-w-xl mx-auto">
            O ritual da escrita ganhará uma nova dimensão. Estamos preparando coleções de caixas tangíveis que acompanham as suas cartas virtuais, entregues fisicamente no dia agendado.
          </p>
        </div>

        {/* Catálogo Teaser */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {PRODUCTS.map((product) => {
            const Icon = product.icon;
            return (
              <div 
                key={product.id} 
                className="bg-white/70 backdrop-blur-md border border-zinc-200/60 rounded-[2rem] p-6 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between group relative mt-4"
              >
                {/* Badge */}
                <div className="absolute top-0 right-6 -translate-y-1/2 z-10">
                  <span className="bg-zinc-900 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-sm">
                    {product.badge}
                  </span>
                </div>

                <div>
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-5 bg-${product.color}-50 border border-${product.color}-100 text-${product.color}-600 shadow-sm transition-transform group-hover:scale-110 duration-300`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-serif text-xl font-semibold text-zinc-900 mb-2">
                    {product.title}
                  </h3>
                  <p className="text-xs text-zinc-600 leading-relaxed mb-6">
                    {product.description}
                  </p>

                  {/* Destaque do Adesivo */}
                  <div className="flex items-start gap-2 mb-6 bg-zinc-50 border border-zinc-100 p-3 rounded-xl">
                    <Star className="w-4 h-4 text-amber-500 shrink-0 mt-0.5 fill-amber-500/20" />
                    <span className="text-[11px] font-medium text-zinc-700">
                      Inclui kit de adesivos exclusivos SendPluma
                    </span>
                  </div>
                </div>
                
                <div className="mt-2 text-center">
                  <button
                    onClick={() => handleOpenModal(product.id)}
                    className="w-full py-3 rounded-full bg-zinc-900 text-white text-[11px] font-semibold uppercase tracking-wider hover:bg-zinc-800 transition-colors shadow flex items-center justify-center gap-1.5 group-hover:bg-amber-600 mb-2"
                  >
                    Solicitar Acesso Antecipado
                  </button>
                  <span className="text-[9px] text-zinc-400">Garanta seu acesso ao catálogo de envios físicos</span>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Modal de Captura de Interesse */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseModal}
              className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="relative bg-white border border-zinc-100 shadow-2xl rounded-3xl w-full max-w-md overflow-hidden"
            >
              {/* Fechar */}
              <button
                onClick={handleCloseModal}
                className="absolute top-4 right-4 p-2 rounded-full text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors z-10"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="p-8">
                {isSuccess ? (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center space-y-4 py-6"
                  >
                    <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-100 shadow-sm">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <h3 className="font-serif text-2xl font-semibold text-zinc-900">
                      Você está na lista!
                    </h3>
                    <p className="text-sm text-zinc-600 leading-relaxed">
                      Agradecemos o seu interesse. Você será uma das primeiras pessoas a saber quando os presentes físicos da SendPluma estiverem disponíveis.
                    </p>
                    <button
                      onClick={handleCloseModal}
                      className="mt-6 w-full py-3 rounded-full bg-zinc-100 text-zinc-700 text-xs font-semibold uppercase tracking-wider hover:bg-zinc-200 transition-colors"
                    >
                      Fechar
                    </button>
                  </motion.div>
                ) : (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100 shadow-sm mb-4">
                        <Gift className="w-6 h-6" />
                      </div>
                      <h3 className="font-serif text-2xl font-semibold text-zinc-900">
                        Acesso Antecipado
                      </h3>
                      <p className="text-sm text-zinc-600 leading-relaxed">
                        Deixe seu melhor e-mail para receber um convite exclusivo assim que lançarmos a experiência física de presentes.
                      </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="space-y-1.5">
                        <label htmlFor="email" className="block text-xs font-semibold text-zinc-700">
                          Seu E-mail
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                          <input
                            id="email"
                            type="email"
                            required
                            placeholder="ola@exemplo.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-zinc-50 rounded-xl pl-10 pr-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none focus:ring-2 focus:ring-zinc-900/10 transition border border-transparent focus:border-zinc-200/60"
                          />
                        </div>
                      </div>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-3.5 rounded-full bg-zinc-900 text-white text-xs font-semibold uppercase tracking-wider hover:bg-zinc-800 transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
                      >
                        {isSubmitting ? "Processando..." : "Quero ser avisado"}
                      </button>
                    </form>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
