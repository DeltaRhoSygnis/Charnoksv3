
import React from 'react';
import type { ParsedSale } from '../../types';

interface ConfirmationModalProps {
    isOpen: boolean;
    parsedSale: ParsedSale | null;
    onConfirm: () => void;
    onEdit: () => void;
    onCancel: () => void;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, parsedSale, onConfirm, onEdit, onCancel }) => {
    if (!isOpen || !parsedSale) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-card-bg-solid rounded-2xl w-full max-w-md border border-border animate-bounce-in shadow-2xl">
                <div className="p-6">
                    <h2 className="text-2xl font-bold text-text-primary">Confirm Sale</h2>
                    <p className="text-text-secondary mb-4">AI has processed your voice input. Please confirm the details.</p>
                
                    <div className="bg-black/20 p-4 rounded-lg space-y-2 mb-6">
                        <h3 className="font-semibold text-text-primary mb-2">Recognized Items:</h3>
                        {parsedSale.items.length > 0 ? (
                            <ul className="space-y-1">
                                {parsedSale.items.map(item => (
                                    <li key={item.product.id} className="flex justify-between text-text-secondary">
                                        <span>{item.quantity} &times; {item.product.name}</span>
                                        <span>${(item.product.price * item.quantity).toFixed(2)}</span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-text-secondary text-center py-2">No items were recognized.</p>
                        )}
                         <div className="border-t border-border/50 my-2"></div>
                        <div className="flex justify-between font-bold text-text-primary text-lg">
                            <span>Total</span>
                            <span>${parsedSale.total.toFixed(2)}</span>
                        </div>
                    </div>

                    <div className="bg-black/20 p-4 rounded-lg space-y-2">
                        <div className="flex justify-between text-text-primary">
                            <span>Payment Received</span>
                            <span className="font-semibold">${parsedSale.payment.toFixed(2)}</span>
                        </div>
                         <div className="flex justify-between text-green-400 font-bold text-lg">
                            <span>Change Due</span>
                            <span>${Math.max(0, parsedSale.payment - parsedSale.total).toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                <div className="bg-black/20 p-4 flex justify-between gap-3 rounded-b-2xl">
                    <button onClick={onCancel} className="px-6 py-2 rounded-lg bg-white/10 text-text-primary font-semibold transition hover:bg-white/20">
                        Cancel
                    </button>
                    <div className="flex gap-3">
                        <button onClick={onEdit} className="px-6 py-2 rounded-lg border-2 border-primary text-primary font-bold transition hover:bg-primary/10">
                            Edit Manually
                        </button>
                        <button onClick={onConfirm} className="px-6 py-2 rounded-lg bg-primary text-text-on-primary font-bold transition hover:bg-primary/80">
                            Confirm & Save
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
