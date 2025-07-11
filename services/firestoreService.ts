
import { db } from '../src/firebaseConfig';
import { collection, getDocs, query, orderBy, limit, addDoc, serverTimestamp } from 'firebase/firestore';
import type { Product, Sale, Expense, Note, Worker } from '../types';

export async function getProducts(): Promise<Product[]> {
    const productsCol = collection(db, 'products');
    const snapshot = await getDocs(query(productsCol, orderBy('name')));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Product[];
}

export async function getSales(count: number = 100): Promise<Sale[]> {
    const salesCol = collection(db, 'sales');
    const q = query(salesCol, orderBy('date', 'desc'), limit(count));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
        const data = doc.data() as { date: { toDate: () => Date } };
        return {
            id: doc.id,
            ...data,
            date: data.date.toDate().toISOString(),
        } as Sale;
    });
}

export async function getExpenses(): Promise<Expense[]> {
    const expensesCol = collection(db, 'expenses');
    const q = query(expensesCol, orderBy('date', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
        const data = doc.data() as { date: { toDate: () => Date } };;
        return {
            id: doc.id,
            ...data,
            date: data.date.toDate().toISOString(),
    } as Expense});
}

export async function addExpense(data: { description: string; amount: number; workerId?: string }): Promise<string> {
    const expenseRef = await addDoc(collection(db, 'expenses'), {
        ...data,
        date: serverTimestamp(),
    });
    return expenseRef.id;
}


export async function getNotes(): Promise<Note[]> {
    const notesCol = collection(db, 'notes');
    const q = query(notesCol, orderBy('date', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
        const data = doc.data() as { date: { toDate: () => Date } };
        return {
            id: doc.id,
            ...data,
            date: data.date.toDate().toISOString(),
        } as Note;
    });
}

export async function addNote(note: Omit<Note, 'id' | 'date'>): Promise<string> {
    const noteRef = await addDoc(collection(db, 'notes'), {
        ...note,
        date: serverTimestamp(),
    });
    return noteRef.id;
}

export async function getWorkers(): Promise<Worker[]> {
    const workersCol = collection(db, 'workers');
    const snapshot = await getDocs(workersCol);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Worker[];
}
export async function addWorker(worker: Omit<Worker, 'id'>): Promise<string> {
    const workerRef = await addDoc(collection(db, 'workers'), worker);
    return workerRef.id;
}
