import { useContext } from 'react';
import { BlogContext } from './BlogContext';

export const useBlog = () => useContext(BlogContext);
