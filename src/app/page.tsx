'use client'

import React, { useState, useEffect } from 'react'
import { ShoppingCart, Plus, Minus, Trash2, ArrowLeft, Copy } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'

const TAXA_ENTREGA = 2.00;

export default function Home() {
  const { items, addItem, removeItem, updateQuantity, total, clearCart } = useCartStore()
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'details' | 'payment'>('cart')
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [products, setProducts] = useState<any[]>([])
  
  // Fetch products from database
  useEffect(() => {
    fetch('/api/produtos', { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        if(Array.isArray(data)) {
          setProducts(data)
        }
      })
      .catch(err => console.error("Erro ao carregar produtos:", err))

    // Forçar remoção absoluta da badge do Netlify via JavaScript
    const killNetlifyBadge = () => {
      // 1. Tentar definir o estado na memória do navegador para esconder nativamente
      try {
        localStorage.setItem('netlify-drawer-state', 'hidden');
        sessionStorage.setItem('netlify-drawer-state', 'hidden');
        localStorage.setItem('ntl-drawer-state', 'hidden');
      } catch (e) {}

      // 2. Varrer todos os elementos filhos do body
      const elements = document.body.children;
      for (let i = 0; i < elements.length; i++) {
        const el = elements[i] as HTMLElement;
        const tag = el.tagName.toLowerCase();
        // Se for um elemento injetado do Netlify (netlify-drawer, netlify-toolbar, etc)
        if (tag.includes('netlify') || tag.includes('stackbit') || el.id.includes('netlify') || el.className.includes('netlify')) {
          el.remove();
        }
        // Se contiver o texto "Powered by Netlify"
        if (el.innerHTML && el.innerHTML.includes('Powered by Netlify') && tag !== 'script' && tag !== 'main' && tag !== 'div') {
          el.remove();
        }
      }
    }
    
    killNetlifyBadge()
    const observer = new MutationObserver(killNetlifyBadge)
    observer.observe(document.documentElement, { childList: true, subtree: true })
    
    return () => observer.disconnect()
  }, [])

  // Form states
  const [nome, setNome] = useState('')
  const [endereco, setEndereco] = useState('')
  const [observacao, setObservacao] = useState('')
  const [pagamento, setPagamento] = useState<'PIX' | 'DINHEIRO' | ''>('')
  const [precisaTroco, setPrecisaTroco] = useState(false)
  const [trocoPara, setTrocoPara] = useState('')

  const handleOpenCart = () => {
    setCheckoutStep('cart')
    setIsCartOpen(true)
  }

  const enviarPedido = () => {
    if (!nome || !endereco || !pagamento) return alert('Preencha os campos obrigatórios')
    if (pagamento === 'DINHEIRO' && precisaTroco && !trocoPara) return alert('Informe para quanto é o troco')

    const numeroAdmin = '5598985298290' // Esse número virá do painel admin depois
    
    let itensStr = items.map(item => `• ${item.quantity}x ${item.name} — R$ ${(item.price * item.quantity).toFixed(2).replace('.', ',')}`).join('\n')
    
    const totalComTaxa = total() + TAXA_ENTREGA;

    let texto = `🍴 *SABOR GOURMET*\n\n🧾 *NOVO PEDIDO*\n\n`
    texto += `👤 *Cliente:* ${nome}\n📍 *Endereço:* ${endereco}\n\n`
    texto += `🛒 *PEDIDO:*\n${itensStr}\n\n`
    texto += `🛵 *Taxa de Entrega:* R$ ${TAXA_ENTREGA.toFixed(2).replace('.', ',')}\n`
    texto += `💰 *TOTAL: R$ ${totalComTaxa.toFixed(2).replace('.', ',')}*\n\n`
    
    texto += `💳 *Pagamento:* ${pagamento}\n`
    if (pagamento === 'DINHEIRO' && precisaTroco) {
      texto += `💵 *Troco para:* R$ ${trocoPara}\n`
    }
    
    if (observacao) {
      texto += `\n📝 *Observação:* ${observacao}\n`
    }

    if (pagamento === 'PIX') {
      texto += `\n(Comprovante PIX será enviado em seguida)`
    }

    const url = `https://wa.me/${numeroAdmin}?text=${encodeURIComponent(texto)}`
    window.open(url, '_blank')
    clearCart()
    setIsCartOpen(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24 font-sans text-gray-900">
      {/* HEADER */}
      <header className="bg-red-600 text-white p-4 sticky top-0 z-10 shadow-md">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-white p-1 rounded-full w-12 h-12 flex items-center justify-center">
              <img src="/logo.png" alt="Sabor Gourmet" className="w-10 h-10 object-contain rounded-full" />
            </div>
            <h1 className="text-xl font-bold">Sabor Gourmet</h1>
          </div>
          <button 
            onClick={handleOpenCart}
            className="relative p-2 bg-red-700 rounded-full hover:bg-red-800 transition"
          >
            <ShoppingCart size={24} />
            {items.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-yellow-400 text-black text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                {items.length}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* CARDÁPIO */}
      <main className="max-w-4xl mx-auto p-4 mt-4">
        <h2 className="text-2xl font-bold mb-6">Nosso Cardápio</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {products.map(product => (
            <div key={product.id} onClick={() => setSelectedProduct(product)} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex gap-4 cursor-pointer hover:shadow-md transition">
              <img src={product.image} alt={product.name} className="w-24 h-24 object-cover rounded-lg" />
              <div className="flex flex-col flex-1 justify-between">
                <div>
                  <h3 className="font-semibold text-lg leading-tight">{product.name}</h3>
                  <p className="text-sm text-gray-500">{product.category}</p>
                </div>
                <div className="flex justify-between items-end">
                  <span className="font-bold text-red-600">
                    R$ {product.price.toFixed(2).replace('.', ',')}
                  </span>
                  <button 
                    onClick={(e) => { e.stopPropagation(); addItem({ ...product, quantity: 1 }) }}
                    className="bg-red-100 text-red-600 p-2 rounded-lg hover:bg-red-200 transition"
                  >
                    <Plus size={20} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* MODAL DETALHES DO PRODUTO */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setSelectedProduct(null)}>
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl relative" onClick={e => e.stopPropagation()}>
            <button onClick={() => setSelectedProduct(null)} className="absolute top-2 right-2 bg-black/50 text-white w-8 h-8 flex items-center justify-center rounded-full z-10">&times;</button>
            <img src={selectedProduct.image} alt={selectedProduct.name} className="w-full h-48 object-cover" />
            <div className="p-5">
              <h3 className="font-bold text-xl mb-1">{selectedProduct.name}</h3>
              <p className="text-sm text-gray-500 mb-4">{selectedProduct.category}</p>
              <p className="text-gray-700 text-sm mb-6">{selectedProduct.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold text-red-600">R$ {selectedProduct.price.toFixed(2).replace('.', ',')}</span>
                <button 
                  onClick={() => { addItem({ ...selectedProduct, quantity: 1 }); setSelectedProduct(null) }}
                  className="bg-red-600 text-white px-5 py-2 rounded-lg font-bold flex gap-2 items-center hover:bg-red-700 transition"
                >
                  <Plus size={20} /> Adicionar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CARRINHO (Modal / Slide-up) */}
      {isCartOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 flex justify-end">
          <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col animate-in slide-in-from-right">
            
            <div className="p-4 bg-red-600 text-white flex justify-between items-center">
              {checkoutStep !== 'cart' ? (
                <button onClick={() => setCheckoutStep(checkoutStep === 'payment' ? 'details' : 'cart')} className="flex items-center gap-2">
                  <ArrowLeft size={20} /> Voltar
                </button>
              ) : (
                <h2 className="text-lg font-bold">Seu Pedido</h2>
              )}
              <button onClick={() => setIsCartOpen(false)} className="font-bold text-2xl leading-none">&times;</button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4">
              {/* PASSO 1: CARRINHO */}
              {checkoutStep === 'cart' && (
                <>
                  {items.length === 0 ? (
                    <p className="text-center text-gray-500 mt-10">O carrinho está vazio.</p>
                  ) : (
                    items.map(item => (
                      <div key={item.id} className="flex gap-4 mb-4 pb-4 border-b">
                        <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded" />
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm">{item.name}</h4>
                          <p className="text-red-600 font-medium">R$ {item.price.toFixed(2).replace('.', ',')}</p>
                          <div className="flex items-center gap-3 mt-2">
                            <button onClick={() => updateQuantity(item.id, -1)} className="p-1 bg-gray-100 rounded hover:bg-gray-200"><Minus size={16} /></button>
                            <span>{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.id, 1)} className="p-1 bg-gray-100 rounded hover:bg-gray-200"><Plus size={16} /></button>
                            <button onClick={() => removeItem(item.id)} className="p-1 text-red-500 ml-auto"><Trash2 size={16} /></button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </>
              )}

              {/* PASSO 2: DADOS DO CLIENTE */}
              {checkoutStep === 'details' && (
                <div className="flex flex-col gap-4">
                  <h3 className="font-bold text-lg">Seus Dados</h3>
                  <div>
                    <label className="block text-sm font-medium mb-1">Nome completo</label>
                    <input type="text" value={nome} onChange={e => setNome(e.target.value)} placeholder="Ex: João Silva" className="w-full border rounded p-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Endereço completo para entrega</label>
                    <input type="text" value={endereco} onChange={e => setEndereco(e.target.value)} placeholder="Rua, Número, Bairro, Referência" className="w-full border rounded p-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Observação do pedido (opcional)</label>
                    <textarea value={observacao} onChange={e => setObservacao(e.target.value)} placeholder="Ex: Sem cebola, por favor" className="w-full border rounded p-2" rows={3}></textarea>
                  </div>
                </div>
              )}

              {/* PASSO 3: PAGAMENTO */}
              {checkoutStep === 'payment' && (
                <div className="flex flex-col gap-4">
                  <h3 className="font-bold text-lg mb-2">Forma de Pagamento</h3>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => setPagamento('PIX')} className={`p-4 border rounded-xl font-bold flex flex-col items-center gap-2 ${pagamento === 'PIX' ? 'border-green-500 bg-green-50 text-green-700' : 'bg-white hover:bg-gray-50'}`}>
                      <span className="text-xl">🟢</span> PIX
                    </button>
                    <button onClick={() => setPagamento('DINHEIRO')} className={`p-4 border rounded-xl font-bold flex flex-col items-center gap-2 ${pagamento === 'DINHEIRO' ? 'border-green-500 bg-green-50 text-green-700' : 'bg-white hover:bg-gray-50'}`}>
                      <span className="text-xl">💵</span> DINHEIRO
                    </button>
                  </div>

                  {pagamento === 'DINHEIRO' && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
                      <p className="font-medium mb-2">Precisa de troco?</p>
                      <div className="flex gap-2 mb-3">
                        <button onClick={() => setPrecisaTroco(false)} className={`flex-1 p-2 rounded border ${!precisaTroco ? 'bg-red-600 text-white border-red-600' : 'bg-white'}`}>Não</button>
                        <button onClick={() => setPrecisaTroco(true)} className={`flex-1 p-2 rounded border ${precisaTroco ? 'bg-red-600 text-white border-red-600' : 'bg-white'}`}>Sim</button>
                      </div>
                      {precisaTroco && (
                        <div>
                          <label className="block text-sm font-medium mb-1">Troco para quanto?</label>
                          <input type="text" value={trocoPara} onChange={e => setTrocoPara(e.target.value)} placeholder="R$ 50,00" className="w-full border rounded p-2" />
                        </div>
                      )}
                    </div>
                  )}

                  {pagamento === 'PIX' && (
                    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-900 text-sm">
                      <p className="font-bold mb-1">Pagamento via PIX</p>
                      <p className="mb-3">Para facilitar e agilizar a preparação do seu pedido, envie o comprovante de pagamento junto com o pedido no WhatsApp.</p>
                      
                      <div className="bg-white p-3 rounded border flex justify-between items-center mb-2">
                        <div>
                          <p className="text-xs text-gray-500">Chave PIX (E-mail)</p>
                          <p className="font-bold break-all">Soniasouzas1509@gmail.com</p>
                          <p className="text-xs text-gray-500">Sônia</p>
                        </div>
                        <button className="text-blue-600 flex flex-col items-center ml-2" onClick={() => {navigator.clipboard.writeText('Soniasouzas1509@gmail.com'); alert('Chave copiada!')}}>
                          <Copy size={20} />
                          <span className="text-[10px]">Copiar</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

            </div>

            {items.length > 0 && (
              <div className="p-4 bg-gray-50 border-t">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Subtotal:</span>
                  <span>R$ {total().toFixed(2).replace('.', ',')}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600 mb-3">
                  <span>Taxa de Entrega:</span>
                  <span>R$ {TAXA_ENTREGA.toFixed(2).replace('.', ',')}</span>
                </div>
                <div className="flex justify-between font-bold text-lg mb-4 text-red-600">
                  <span>Total a pagar:</span>
                  <span>R$ {(total() + TAXA_ENTREGA).toFixed(2).replace('.', ',')}</span>
                </div>
                
                {checkoutStep === 'cart' && (
                  <button onClick={() => setCheckoutStep('details')} className="w-full bg-red-600 text-white font-bold py-3 rounded-lg hover:bg-red-700 transition">
                    CONTINUAR PEDIDO
                  </button>
                )}
                
                {checkoutStep === 'details' && (
                  <button 
                    onClick={() => { if(!nome || !endereco) alert('Preencha nome e Endereço!'); else setCheckoutStep('payment') }} 
                    className="w-full bg-red-600 text-white font-bold py-3 rounded-lg hover:bg-red-700 transition"
                  >
                    ESCOLHER PAGAMENTO
                  </button>
                )}
                
                {checkoutStep === 'payment' && (
                  <button 
                    onClick={enviarPedido} 
                    className="w-full bg-green-600 text-white font-bold py-3 flex items-center justify-center gap-2 rounded-lg hover:bg-green-700 transition"
                  >
                    ENVIAR PELO WHATSAPP
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
