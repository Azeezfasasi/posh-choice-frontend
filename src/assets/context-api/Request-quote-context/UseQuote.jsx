import { useContext } from 'react';
import { QuoteContext } from './QuoteContext';

export const useQuote = () => useContext(QuoteContext);