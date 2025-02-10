import { create } from 'zustand';
import getEnvVars from '../config/constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
        user: data.user,
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
        user: data.user,
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
        user: data.user,
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

  saveTemplate: async (template) => {
    set({ loading: true });
    try {
      const token = await AsyncStorage.getItem('authToken');
      const response = await fetch(`${apiUrl}/templates`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(template),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to save template');
      }

      set((state) => ({
        templates: [...state.templates, data],
        error: null,
      }));
      return data;
    } catch (error) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },
}));

// Editor Store
export const useEditorStore = create((set) => ({
  elements: [],
  selectedElement: null,
  
  setElements: (elements) => set({ elements }),
  setSelectedElement: (selectedElement) => set({ selectedElement }),
  
  addElement: (element) => 
    set((state) => ({ elements: [...state.elements, element] })),
    
  updateElement: (index, updates) =>
    set((state) => ({
      elements: state.elements.map((el, i) =>
        i === index ? { ...el, ...updates } : el
      ),
    })),
})); 