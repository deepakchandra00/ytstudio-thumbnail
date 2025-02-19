import { create } from 'zustand';
import getEnvVars from '../config/constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { configureStore, createSlice } from '@reduxjs/toolkit';

const { apiUrl, authApiUrl } = getEnvVars();

// Auth Store
export const useAuth = create((set) => ({
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,

  login: async (email, password) => {
    try {
      const response = await fetch(`${authApiUrl}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      console.log('Login Request URL:', `${authApiUrl}/login`);
      console.log('Login Response Status:', response.status);

      const data = await response.json();
      console.log('Login Response Data:', data);
      
      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      if (data.token) {
        await AsyncStorage.setItem('authToken', data.token);
      }

      set({
        user: { ...data.user, role: data.user.role || 'user' },  // Explicitly set role, defaulting to 'user'
        isAuthenticated: true,
        error: null,
      });
      
      return data;
    } catch (error) {
      console.error('Login Error:', error);
      console.error('Error Details:', {
        message: error.message,
        name: error.name,
        stack: error.stack
      });
      set({ error: error.message });
      throw error;
    }
  },

  register: async (name, email, password) => {
    try {
      const response = await fetch(`${authApiUrl}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      if (data.token) {
        await AsyncStorage.setItem('authToken', data.token);
      }

      set({
        user: { ...data.user, role: data.user.role || 'user' },  // Explicitly set role, defaulting to 'user'
        isAuthenticated: true,
        error: null,
      });
      
      return data;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  logout: async () => {
    try {
      await AsyncStorage.removeItem('authToken');
      set({
        user: null,
        isAuthenticated: false,
        error: null,
      });
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  checkAuth: async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        return false;
      }

      const response = await fetch(`${apiUrl}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message);
      }

      set({
        user: { ...data.user, role: data.user.role || 'user' },  // Explicitly set role, defaulting to 'user'
        isAuthenticated: true,
        error: null,
      });

      return true;
    } catch (error) {
      await AsyncStorage.removeItem('authToken');
      set({
        user: null,
        isAuthenticated: false,
        error: error.message,
      });
      return false;
    }
  },
}));

// Template Store
export const useTemplateStore = create((set) => ({
  templates: [],
  loading: false,
  error: null,

  saveTemplate: async (template) => {
    set({ loading: true, error: null });
    try {
      const token = await AsyncStorage.getItem('authToken');
      const user = useAuth.getState().user;
      
      if (user?.role !== 'admin') {
        throw new Error('Unauthorized - Admin access required');
      }
console.log('Loading template:', template);
      // Process template elements to ensure image elements have necessary properties
      const processedTemplate = {
        ...template,
        elements: (template.elements || []).map(element => {
          if (element.type === 'image') {
            return {
              ...element,
              width: element.width || element.size || 100,
              height: element.height || element.size || 100,
              rotation: element.rotation || 0
            };
          }
          return element;
        })
      };

      console.log('Saving processed template:', processedTemplate);

      const response = await fetch(`${apiUrl}/templates/${template._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(processedTemplate),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to save template');
      }

      set(state => ({
        templates: state.templates.map(t => 
          t._id === template._id ? { ...t, ...data } : t
        )
      }));
      
      return data;
    } catch (error) {
      console.error('Template save error:', error);
      set({ error: error.message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  fetchTemplates: async () => {
    set({ loading: true, error: null });
    try {
      const token = await AsyncStorage.getItem('authToken');
      
      console.log('Fetching templates from:', `${apiUrl}/templates`);
      
      const response = await fetch(`${apiUrl}/templates`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers.get('content-type'));

      const rawText = await response.text();
      
      try {
        const data = JSON.parse(rawText);
        
        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch templates');
        }
console.log('Data:', Array.isArray(data));
        set({
          templates: Array.isArray(data) ? data : [],
          error: null,
        });
      } catch (parseError) {
        console.error('JSON Parse Error:', parseError);
        console.error('Raw response:', rawText);
        throw new Error('Invalid JSON response from server');
      }
    } catch (error) {
      console.error('Template fetch error:', error);
      set({ 
        error: error.message,
        templates: []
      });
    } finally {
      set({ loading: false });
    }
  },
}));

// Editor Store
export const useEditorStore = create((set, get) => ({
  elements: [
  ],
  selectedElement: null,
  history: {
    past: [],
    present: [],
    future: []
  },
  
  setElements: (elements) => set({ elements }),
  setSelectedElement: (selectedElement) => set({ selectedElement }),
  
  addElement: (element) => 
    set((state) => {
      const newState = {
        elements: [...state.elements, element],
        history: {
          past: [...state.history.past, state.elements],
          present: [...state.elements, element],
          future: []
        }
      };
      return newState;
    }),
    
  updateElement: (elementId, updates) => {
    set((state) => {
      const updatedElements = state.elements.map((element) => {
        if (element.id === elementId) {
          console.log('Updating element:', elementId, 'with', updates);
          // Ensure rotation is a number, not an object
          const finalUpdates = updates.rotation 
            ? { ...updates, rotation: updates.rotation.rotation || updates.rotation }
            : updates;
          return { ...element, ...finalUpdates };
        }
        return element;
      });
      return { elements: updatedElements };
    });
  },

  removeElement: (index) =>
    set((state) => {
      console.log('Removing element at index:', index);
      const updatedElements = state.elements.filter((_, elIndex) => elIndex !== index);
      console.log('Updated elements:', updatedElements);
      return {
        elements: updatedElements,
        history: {
          past: [...state.history.past, state.elements],
          present: updatedElements,
          future: []
        }
      };
    }),

  undo: () => set((state) => {
    if (state.history.past.length === 0) return state;
    
    const previous = state.history.past[state.history.past.length - 1];
    const newPast = state.history.past.slice(0, -1);
    
    return {
      elements: previous,
      history: {
        past: newPast,
        present: previous,
        future: [state.elements, ...state.history.future]
      }
    };
  }),

  redo: () => set((state) => {
    if (state.history.future.length === 0) return state;
    
    const next = state.history.future[0];
    const newFuture = state.history.future.slice(1);
    
    return {
      elements: next,
      history: {
        past: [...state.history.past, state.elements],
        present: next,
        future: newFuture
      }
    };
  }),
}));

// Remove or comment out the Redux-related code since we're using Zustand
// const editorSlice = createSlice({...})
// const store = configureStore({...})

export default useEditorStore; 