import { createContext, useState, useEffect, useContext } from 'react';
import { useAuth } from './AuthContext';

const SelectionContext = createContext(null);

export const SelectionProvider = ({ children }) => {
  const { user } = useAuth();
  const getInitialUser = () => {
    try {
      const storedUser = localStorage.getItem('user');
      return storedUser ? JSON.parse(storedUser) : null;
    } catch {
      return null;
    }
  };

  const [selectedDepartment, setSelectedDepartment] = useState(() => {
    const u = getInitialUser();
    if (u?._id) {
      const dept = localStorage.getItem(`selectedDept_${u._id}`);
      return dept ? JSON.parse(dept) : null;
    }
    return null;
  });

  const [selectedSubCategory, setSelectedSubCategory] = useState(() => {
    const u = getInitialUser();
    if (u?._id) {
      return localStorage.getItem(`selectedSub_${u._id}`) || '';
    }
    return '';
  });

  const [selectedPosition, setSelectedPosition] = useState(() => {
    const u = getInitialUser();
    if (u?._id) {
      return localStorage.getItem(`selectedPos_${u._id}`) || '';
    }
    return '';
  });

  // Load selection from localStorage whenever user changes (keeps state synced on changes)
  useEffect(() => {
    if (user?._id) {
      const dept = localStorage.getItem(`selectedDept_${user._id}`);
      const sub = localStorage.getItem(`selectedSub_${user._id}`);
      const pos = localStorage.getItem(`selectedPos_${user._id}`);

      setSelectedDepartment(dept ? JSON.parse(dept) : null);
      setSelectedSubCategory(sub || '');
      setSelectedPosition(pos || '');
    } else {
      setSelectedDepartment(null);
      setSelectedSubCategory('');
      setSelectedPosition('');
    }
  }, [user]);

  // Setters
  const selectDepartment = (dept) => {
    if (!user?._id) return;
    if (dept) {
      localStorage.setItem(`selectedDept_${user._id}`, JSON.stringify(dept));
    } else {
      localStorage.removeItem(`selectedDept_${user._id}`);
    }
    setSelectedDepartment(dept);
    // Reset downstream fields on department change
    selectSubCategory('');
    selectPosition('');
  };

  const selectSubCategory = (sub) => {
    if (!user?._id) return;
    if (sub) {
      localStorage.setItem(`selectedSub_${user._id}`, sub);
    } else {
      localStorage.removeItem(`selectedSub_${user._id}`);
    }
    setSelectedSubCategory(sub);
    selectPosition(''); // Reset position on subcategory change
  };

  const selectPosition = (pos) => {
    if (!user?._id) return;
    if (pos) {
      localStorage.setItem(`selectedPos_${user._id}`, pos);
    } else {
      localStorage.removeItem(`selectedPos_${user._id}`);
    }
    setSelectedPosition(pos);
  };

  const clearSelection = () => {
    if (user?._id) {
      localStorage.removeItem(`selectedDept_${user._id}`);
      localStorage.removeItem(`selectedSub_${user._id}`);
      localStorage.removeItem(`selectedPos_${user._id}`);
    }
    setSelectedDepartment(null);
    setSelectedSubCategory('');
    setSelectedPosition('');
  };

  const value = {
    selectedDepartment,
    selectedSubCategory,
    selectedPosition,
    selectDepartment,
    selectSubCategory,
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
