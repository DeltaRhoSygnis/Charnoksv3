
import React, { useState, PropsWithChildren } from 'react';
import KPICard from '../components/ui/KPI_Card';
import { mockWorkers } from '../data/mockData';

// Reusable CollapsibleSection component for this page
const CollapsibleSection: React.FC<PropsWithChildren<{ title: string; defaultOpen?: boolean }>> = ({ title, children, defaultOpen = false }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className="bg-card-bg/80 backdrop-blur-sm rounded-2xl border border-border/50 shadow-lg">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center p-4 text-left transition-colors hover:bg-white/5"
            >
                <h2 className="text-xl font-bold text-text-primary">{title}</h2>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-6 w-6 transform transition-transform text-text-secondary ${isOpen ? 'rotate-180' : ''}`}
                    viewBox="0 0 20 20" fill="currentColor"
                >
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
            </button>
            {isOpen && (
                <div className="p-6 border-t border-border/50 animate-slide-in-bottom">
                    {children}
                </div>
            )}
        </div>
    );
};

const productTypes = ['Drumstick', 'Thigh', 'Breast', 'Wing', 'Neck', 'Other'];

const StockManagementPage: React.FC = () => {
    const [stockReceivedToday, setStockReceivedToday] = useState(50);
    const [stockSentToday, setStockSentToday] = useState(35);
    const [remainingStock, setRemainingStock] = useState(15);
    const [selectedBranch, setSelectedBranch] = useState(mockWorkers[0].id);

    return (
        <div className="space-y-8">
            <header className="animate-bounce-in">
                <h1 className="text-4xl font-bold text-text-primary">Stock Management</h1>
                <p className="text-text-secondary mt-1">Manage stock from supplier to branch.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <KPICard title="Stock Received Today" value={`${stockReceivedToday} kg`} icon="📦" />
                <KPICard title="Stock Sent to Branches" value={`${stockSentToday} kg`} icon="🚚" />
                <KPICard title="Remaining in Storage" value={`${remainingStock} kg`} icon="🏠" />
            </div>

            <div className="space-y-6">
                <CollapsibleSection title="1. Receive Stock from Supplier" defaultOpen>
                    <form className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-1">Supplier Name</label>
                            <input type="text" placeholder="e.g. Farm Fresh Inc." className="w-full bg-transparent border-2 border-border/50 rounded-lg p-3 focus:border-primary focus:ring-0 transition" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1">Total Quantity Received (kg)</label>
                                <input type="number" placeholder="50" className="w-full bg-transparent border-2 border-border/50 rounded-lg p-3 focus:border-primary focus:ring-0 transition" />
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1">Date</label>
                                <input type="text" readOnly value={new Date().toLocaleDateString()} className="w-full bg-white/5 border-2 border-border/50 rounded-lg p-3 focus:ring-0" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-1">Notes (Optional)</label>
                            <textarea placeholder="Notes about the delivery..." rows={3} className="w-full bg-transparent border-2 border-border/50 rounded-lg p-3 focus:border-primary focus:ring-0 transition"></textarea>
                        </div>
                        <div className="flex justify-end">
                            <button type="button" className="px-6 py-3 rounded-lg bg-primary text-text-on-primary font-bold transition hover:bg-primary/80">Record Received Stock</button>
                        </div>
                    </form>
                </CollapsibleSection>

                <CollapsibleSection title="2. Process Stock into Packages">
                     <div className="space-y-3">
                        <div className="flex items-center gap-4 font-semibold text-text-secondary px-2">
                           <div className="flex-1">Product Type</div>
                           <div className="w-24">Quantity</div>
                           <div className="flex-1">Notes</div>
                        </div>
                         {productTypes.slice(0, 3).map(type => (
                             <div key={type} className="flex items-center gap-4 p-2 rounded-lg bg-black/20">
                                 <select className="flex-1 bg-transparent border-2 border-border/50 rounded-lg p-2 focus:border-primary focus:ring-0 transition text-text-primary">
                                     {productTypes.map(pt => <option key={pt}>{pt}</option>)}
                                 </select>
                                 <input type="number" placeholder="10" className="w-24 bg-transparent border-2 border-border/50 rounded-lg p-2 focus:border-primary focus:ring-0 transition" />
                                 <input type="text" placeholder="Notes..." className="flex-1 bg-transparent border-2 border-border/50 rounded-lg p-2 focus:border-primary focus:ring-0 transition" />
                             </div>
                         ))}
                     </div>
                     <div className="flex justify-end mt-4">
                        <button type="button" className="px-6 py-3 rounded-lg bg-primary text-text-on-primary font-bold transition hover:bg-primary/80">Record Processed Stock</button>
                    </div>
                </CollapsibleSection>

                <CollapsibleSection title="3. Deliver Stock to Branch">
                    <form className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-1">Select Worker/Branch</label>
                            <select className="w-full bg-transparent border-2 border-border/50 rounded-lg p-3 focus:border-primary focus:ring-0 transition text-text-primary">
                                {mockWorkers.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-primary mb-2">Packages to Deliver:</label>
                             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {productTypes.slice(0, 4).map(type => (
                                    <div key={type}>
                                        <label className="block text-xs font-medium text-text-secondary mb-1">{type} (packs)</label>
                                         <input type="number" placeholder="0" className="w-full bg-transparent border-2 border-border/50 rounded-lg p-2 focus:border-primary focus:ring-0 transition" />
                                    </div>
                                ))}
                            </div>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-text-secondary mb-1">Notes (Optional)</label>
                            <textarea placeholder="e.g. Delivery instructions" rows={3} className="w-full bg-transparent border-2 border-border/50 rounded-lg p-3 focus:border-primary focus:ring-0 transition"></textarea>
                        </div>
                        <div className="flex justify-end">
                            <button type="button" className="px-6 py-3 rounded-lg bg-primary text-text-on-primary font-bold transition hover:bg-primary/80">Send Stock to Branch</button>
                        </div>
                    </form>
                </CollapsibleSection>

                <CollapsibleSection title="4. Current Branch Stock Viewer">
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">Select Worker/Branch</label>
                        <select value={selectedBranch} onChange={e => setSelectedBranch(e.target.value)} className="w-full max-w-sm bg-transparent border-2 border-border/50 rounded-lg p-3 focus:border-primary focus:ring-0 transition text-text-primary">
                             {mockWorkers.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                        </select>
                    </div>
                    <div className="mt-4 overflow-x-auto">
                        <table className="w-full text-left">
                           <thead className="border-b border-border/50">
                                <tr>
                                    <th className="p-3 font-semibold text-text-secondary">Product Type</th>
                                    <th className="p-3 font-semibold text-text-secondary">Quantity in Stock (packs)</th>
                                    <th className="p-3 font-semibold text-text-secondary">Last Updated</th>
                                </tr>
                           </thead>
                           <tbody>
                                {productTypes.slice(0, 4).map((type, index) => (
                                     <tr key={type} className="border-b border-border/30">
                                         <td className="p-3">{type}</td>
                                         <td className="p-3">{~~(Math.random() * 20) + 5}</td>
                                         <td className="p-3">{new Date(Date.now() - index * 24 * 3600 * 1000).toLocaleDateString()}</td>
                                     </tr>
                                ))}
                           </tbody>
                        </table>
                    </div>
                </CollapsibleSection>
            </div>
        </div>
    );
};

export default StockManagementPage;
