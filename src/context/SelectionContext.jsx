import { createContext, useState, useEffect, useContext } from 'react';
import { useAuth } from './AuthContext';

const SelectionContext = createContext(null);

export const SelectionProvider = ({ children }) => {
  const { user } = useAuth();
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedPosition, setSelectedPosition] = useState(null);

  // Load selection from localStorage whenever user changes
  useEffect(() => {
    if (user?._id) {
      const org = localStorage.getItem(`selectedOrg_${user._id}`);
      const cat = localStorage.getItem(`selectedCategory_${user._id}`);
      const pos = localStorage.getItem(`selectedPosition_${user._id}`);

      setSelectedOrg(org ? JSON.parse(org) : null);
      setSelectedCategory(cat ? JSON.parse(cat) : null);
      setSelectedPosition(pos ? JSON.parse(pos) : null);
    } else {
      setSelectedOrg(null);
      setSelectedCategory(null);
      setSelectedPosition(null);
    }
  }, [user]);

  // Save setters
  const selectOrg = (org) => {
    if (!user?._id) return;
    if (org) {
      localStorage.setItem(`selectedOrg_${user._id}`, JSON.stringify(org));
    } else {
      localStorage.removeItem(`selectedOrg_${user._id}`);
    }
    setSelectedOrg(org);
    // Reset child selection if org changes
    selectCategory(null);
    selectPosition(null);
  };

  const selectCategory = (cat) => {
    if (!user?._id) return;
    if (cat) {
      localStorage.setItem(`selectedCategory_${user._id}`, JSON.stringify(cat));
    } else {
      localStorage.removeItem(`selectedCategory_${user._id}`);
    }
    setSelectedCategory(cat);
    // Reset child selection if category changes
    selectPosition(null);
  };

  const selectPosition = (pos) => {
    if (!user?._id) return;
    if (pos) {
      localStorage.setItem(`selectedPosition_${user._id}`, JSON.stringify(pos));
    } else {
      localStorage.removeItem(`selectedPosition_${user._id}`);
    }
    setSelectedPosition(pos);
  };

  const clearSelection = () => {
    if (user?._id) {
      localStorage.removeItem(`selectedOrg_${user._id}`);
      localStorage.removeItem(`selectedCategory_${user._id}`);
      localStorage.removeItem(`selectedPosition_${user._id}`);
    }
    setSelectedOrg(null);
    setSelectedCategory(null);
    setSelectedPosition(null);
  };

  const value = {
    selectedOrg,
    selectedCategory,
    selectedPosition,
    selectOrg,
    selectCategory,
    selectPosition,
    clearSelection,
  };

  return <SelectionContext.Provider value={value}>{children}</SelectionContext.Provider>;
};

export const useSelection = () => {
  const context = useContext(SelectionContext);
  if (!context) {
    throw new Error('useSelection must be used within a SelectionProvider');
  }
  return context;
};
