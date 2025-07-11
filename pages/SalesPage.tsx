import React, { useState, useMemo, useCallback, useEffect } from 'react';
import type { ParsedSale } from '../types';
import VoiceInputButton from '../components/ui/VoiceInputButton';
import ConfirmationModal from '../components/ui/ConfirmationModal';
import { subscribeToProducts, recordSale, parseSaleFromVoice, type Product } from '../services/salesService';

interface CartItem {
  product: Product;
  quantity: number;
}

const NumberPad: React.FC<{
  onInput: (value: string) => void;
  onDone: () => void;
}> = ({ onInput, onDone }) => {
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', '⌫'];
  return (
    <div className="grid grid-cols-3 gap-2 p-4">
      {keys.map((key) => (
        <button
          key={key}
          onClick={() => onInput(key)}
          className="bg-white/10 text-text-primary rounded-lg text-2xl font-bold h-16 flex items-center justify-center transition-all duration-200 active:bg-primary active:scale-105"
        >
          {key}
        </button>
      ))}
      <button
        onClick={onDone}
        className="col-span-3 bg-primary text-text-on-primary rounded-lg text-xl font-bold h-16 flex items-center justify-center transition-colors hover:bg-primary/80"
      >
        Done
      </button>
    </div>
  );
};

const SuccessOverlay: React.FC = () => (
    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-bounce-in">
        <div className="bg-green-500 rounded-full w-32 h-32 flex items-center justify-center shadow-2xl">
            <svg className="w-20 h-20 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
        </div>
    </div>
);

const SalesPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [moneyReceived, setMoneyReceived] = useState('');
  const [showNumberPad, setShowNumberPad] = useState(false);
  const [editingField, setEditingField] = useState<'money' | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Voice input state
  const [isProcessingVoice, setIsProcessingVoice] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [parsedSale, setParsedSale] = useState<ParsedSale | null>(null);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const unsubscribe = subscribeToProducts((fetchedProducts) => {
        setProducts(fetchedProducts);
        setLoadingProducts(false);
      });
      
      // Cleanup subscription on unmount
      return () => unsubscribe();
    } catch (err) {
      setError('Failed to load products.');
      setLoadingProducts(false);
    }
  }, []);

  const total = useMemo(() => cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0), [cart]);
  const change = useMemo(() => {
    const received = parseFloat(moneyReceived);
    return received > 0 && received >= total ? received - total : 0;
  }, [moneyReceived, total]);

  const addToCart = (product: Product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.product.id === product.id);
      if (existingItem) {
        return prevCart.map(item => item.product.id === product.id ? {...item, quantity: item.quantity + 1} : item);
      }
      return [...prevCart, { product, quantity: 1 }];
    });
  };

  const updateCartQuantity = (productId: string, newQuantity: number) => {
    setCart(currentCart => {
        if (newQuantity <= 0) {
            return currentCart.filter(item => item.product.id !== productId);
        }
        return currentCart.map(item => 
            item.product.id === productId ? { ...item, quantity: newQuantity } : item
        );
    });
  };

  const openNumberPad = (field: 'money') => {
    setEditingField(field);
    setShowNumberPad(true);
  };
  
  const handleNumberPadInput = (value: string) => {
    if (editingField === 'money') {
        setMoneyReceived(prev => {
            if (value === '⌫') {
                return prev.slice(0, -1);
            }
            if (value === '.' && prev.includes('.')) {
                return prev;
            }
            return prev + value;
        });
    }
  };

  const handleSaveSale = useCallback(async () => {
    if(cart.length === 0) return;
    try {
      const result = await recordSale(
        cart.map(item => ({ 
          productId: item.product.id, 
          quantity: item.quantity 
        })), 
        parseFloat(moneyReceived)
      );
      
      if (result.success) {
        setShowSuccess(true);
        setTimeout(() => {
          setCart([]);
          setMoneyReceived('');
          setShowSuccess(false);
        }, 1500);
      } else {
        setError('Failed to save sale.');
      }
    } catch (err) {
      setError('Failed to save sale.');
    }
  }, [cart, moneyReceived]);

  const handleTranscript = async (transcript: string) => {
    setIsProcessingVoice(true);
    setVoiceError(null);
    try {
      const result = await parseSaleFromVoice(transcript);
      const saleItems: CartItem[] = [];
      let saleTotal = 0;
      result.items.forEach(item => {
        const product = products.find(p => p.id === item.productId);
        if (product) {
          saleItems.push({ product, quantity: item.quantity });
          saleTotal += product.price * item.quantity;
        }
      });
      setParsedSale({
        items: saleItems,
        payment: saleTotal,
        total: saleTotal,
      });
      setShowConfirmationModal(true);
    } catch (e: any) {
      setVoiceError(e.message || "Couldn't understand. Try again.");
    } finally {
      setIsProcessingVoice(false);
    }
  };

  const handleConfirmSaleFromVoice = () => {
    if (!parsedSale) return;
    setCart(parsedSale.items);
    setMoneyReceived(String(parsedSale.payment));
    setShowConfirmationModal(false);
    setParsedSale(null);
  };

  if (loadingProducts) {
    return <div className="flex justify-center items-center h-64"><span>Loading products...</span></div>;
  }
  if (error) {
    return <div className="bg-red-900/20 text-red-300 text-center p-4 rounded-lg">{error}</div>;
  }

  return (
    <div className="h-full max-h-[calc(100vh-100px)] lg:max-h-screen lg:h-screen lg:overflow-hidden p-0 -m-4 sm:-m-6 lg:-m-8">
      <ConfirmationModal 
        isOpen={showConfirmationModal}
        parsedSale={parsedSale}
        onConfirm={handleConfirmSaleFromVoice}
        onEdit={handleConfirmSaleFromVoice} // Same as confirm, populates the form
        onCancel={() => {
            setShowConfirmationModal(false);
            setParsedSale(null);
        }}
      />
      <div className="flex flex-col lg:flex-row h-full">
        {/* Product Grid */}
        <div className="lg:w-3/5 xl:w-2/3 p-4 space-y-4 overflow-y-auto">
           <header>
             <div>
                <h1 className="text-3xl font-bold text-text-primary">Record Sale</h1>
                <p className="text-text-secondary">Tap products to add to cart or use voice input.</p>
             </div>
           </header>
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {products.map((product) => (
              <button key={product.id} onClick={() => addToCart(product)} className="bg-card-bg/80 backdrop-blur-sm rounded-2xl p-3 text-left border border-border/50 transition-all duration-200 hover:border-primary hover:scale-105 active:scale-100">
                <img src={product.imageUrl} alt={product.name} className="w-full h-24 md:h-32 object-cover rounded-lg" />
                <h3 className="font-bold mt-2 text-text-primary truncate">{product.name}</h3>
                <p className="text-primary font-semibold">{`$${product.price.toFixed(2)}`}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Cart & Payment */}
        <div className="lg:w-2/5 xl:w-1/3 bg-black/20 backdrop-blur-md flex flex-col p-4 relative">
          {showSuccess && <SuccessOverlay />}
          <h2 className="text-2xl font-bold text-text-primary mb-4">Current Sale</h2>
          
          {/* Voice Input */}
          <div className="mb-4">
            <VoiceInputButton 
                onTranscript={handleTranscript}
                isProcessing={isProcessingVoice}
                error={voiceError}
                onResetError={() => setVoiceError(null)}
            />
          </div>

          {/* Cart Items */}
          <div className="flex-grow overflow-y-auto pr-2 space-y-2">
            {cart.length === 0 ? (
                <div className="flex items-center justify-center h-full text-text-secondary">
                    <p>Cart is empty</p>
                </div>
            ) : (
                cart.map(item => (
                <div key={item.product.id} className="flex items-center bg-white/5 p-2 rounded-lg gap-3">
                    <img src={item.product.imageUrl} alt={item.product.name} className="w-12 h-12 rounded-md object-cover" />
                    <div className="flex-grow">
                        <p className="font-semibold text-text-primary">{item.product.name}</p>
                        <p className="text-sm text-text-secondary">{`$${item.product.price.toFixed(2)}`}</p>
                    </div>
                    <div className="flex items-center bg-white/10 rounded-md">
                      <button onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)} className="px-3 py-1 text-text-primary font-bold text-lg transition-colors hover:bg-white/20 rounded-l-md">-</button>
                      <span className="px-2 text-text-primary w-8 text-center">{item.quantity}</span>
                      <button onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)} className="px-3 py-1 text-text-primary font-bold text-lg transition-colors hover:bg-white/20 rounded-r-md">+</button>
                    </div>
                    <p className="font-bold text-text-primary w-20 text-right">{`$${(item.product.price * item.quantity).toFixed(2)}`}</p>
                </div>
                ))
            )}
          </div>
          {/* Payment Section */}
          <div className="border-t border-border mt-4 pt-4 space-y-3">
            <div className="flex justify-between text-xl font-bold">
              <span className="text-text-secondary">Total</span>
              <span className="text-primary">{`$${total.toFixed(2)}`}</span>
            </div>
             <div className="flex justify-between items-center text-xl font-bold">
                <span className="text-text-secondary">Received</span>
                 <button onClick={() => openNumberPad('money')} className="bg-white/10 px-4 py-2 rounded-md text-accent text-2xl">
                    {`$${moneyReceived || '0.00'}`}
                 </button>
             </div>
             <div className="flex justify-between text-2xl font-bold">
                <span className="text-text-secondary">Change</span>
                <span className="text-green-400">{`$${change.toFixed(2)}`}</span>
             </div>
            <button
                onClick={handleSaveSale}
                disabled={cart.length === 0 || parseFloat(moneyReceived) < total}
                className="w-full bg-primary text-text-on-primary text-xl font-bold py-4 rounded-lg shadow-lg transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:scale-100 disabled:bg-gray-500"
            >
              Save Sale
            </button>
          </div>
        </div>

        {/* Number Pad Modal */}
        {showNumberPad && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center lg:items-end lg:justify-end">
                <div className="w-full max-w-sm bg-card-bg-solid rounded-t-2xl lg:rounded-2xl lg:m-4 animate-slide-in-bottom">
                   <NumberPad onInput={handleNumberPadInput} onDone={() => setShowNumberPad(false)} />
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default SalesPage;
