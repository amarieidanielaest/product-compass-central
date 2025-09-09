import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { EnhancedFeedbackItem } from '@/services/api/BoardService';

interface OptimisticAction {
  type: 'UPDATE_FEEDBACK' | 'ADD_FEEDBACK' | 'DELETE_FEEDBACK' | 'VOTE_FEEDBACK' | 'REVERT';
  payload?: any;
  id?: string;
}

interface OptimisticState {
  feedback: EnhancedFeedbackItem[];
  pendingActions: Set<string>;
}

const OptimisticContext = createContext<{
  state: OptimisticState;
  dispatch: React.Dispatch<OptimisticAction>;
  executePendingAction: (id: string, action: () => Promise<any>) => Promise<void>;
} | null>(null);

function optimisticReducer(state: OptimisticState, action: OptimisticAction): OptimisticState {
  switch (action.type) {
    case 'UPDATE_FEEDBACK':
      return {
        ...state,
        feedback: state.feedback.map(item =>
          item.id === action.payload.id ? { ...item, ...action.payload.updates } : item
        )
      };
    
    case 'ADD_FEEDBACK':
      return {
        ...state,
        feedback: [action.payload, ...state.feedback]
      };
    
    case 'DELETE_FEEDBACK':
      return {
        ...state,
        feedback: state.feedback.filter(item => item.id !== action.payload.id)
      };
    
    case 'VOTE_FEEDBACK':
      return {
        ...state,
        feedback: state.feedback.map(item =>
          item.id === action.payload.id
            ? { 
                ...item, 
                votes_count: item.votes_count + action.payload.increment,
                user_vote: action.payload.voteType
              }
            : item
        )
      };
    
    case 'REVERT':
      return {
        ...state,
        feedback: action.payload.originalData
      };
    
    default:
      return state;
  }
}

interface OptimisticProviderProps {
  children: ReactNode;
  initialFeedback: EnhancedFeedbackItem[];
}

export const OptimisticProvider: React.FC<OptimisticProviderProps> = ({ 
  children, 
  initialFeedback 
}) => {
  const [state, dispatch] = useReducer(optimisticReducer, {
    feedback: initialFeedback,
    pendingActions: new Set<string>()
  });

  const executePendingAction = async (id: string, action: () => Promise<any>) => {
    const originalData = [...state.feedback];
    
    try {
      const newPendingActions = new Set(state.pendingActions);
      newPendingActions.add(id);
      const result = await action();
      newPendingActions.delete(id);
      return result;
    } catch (error) {
      // Revert optimistic update on error
      dispatch({ type: 'REVERT', payload: { originalData } });
      throw error;
    }
  };

  return (
    <OptimisticContext.Provider value={{ state, dispatch, executePendingAction }}>
      {children}
    </OptimisticContext.Provider>
  );
};

export const useOptimisticUpdates = () => {
  const context = useContext(OptimisticContext);
  if (!context) {
    throw new Error('useOptimisticUpdates must be used within OptimisticProvider');
  }
  return context;
};

// Utility hooks for specific optimistic actions
export const useOptimisticVote = () => {
  const { dispatch, executePendingAction } = useOptimisticUpdates();

  return {
    vote: async (feedbackId: string, voteType: 'upvote' | 'downvote', apiCall: () => Promise<any>) => {
      const increment = voteType === 'upvote' ? 1 : -1;
      
      // Optimistic update
      dispatch({
        type: 'VOTE_FEEDBACK',
        payload: { id: feedbackId, increment, voteType }
      });

      // Execute API call
      return executePendingAction(feedbackId, apiCall);
    }
  };
};

export const useOptimisticFeedback = () => {
  const { dispatch, executePendingAction } = useOptimisticUpdates();

  return {
    addFeedback: async (newFeedback: EnhancedFeedbackItem, apiCall: () => Promise<any>) => {
      // Optimistic update
      dispatch({
        type: 'ADD_FEEDBACK',
        payload: { ...newFeedback, id: `temp-${Date.now()}` }
      });

      // Execute API call
      return executePendingAction(newFeedback.id, apiCall);
    },

    updateFeedback: async (feedbackId: string, updates: Partial<EnhancedFeedbackItem>, apiCall: () => Promise<any>) => {
      // Optimistic update
      dispatch({
        type: 'UPDATE_FEEDBACK',
        payload: { id: feedbackId, updates }
      });

      // Execute API call
      return executePendingAction(feedbackId, apiCall);
    },

    deleteFeedback: async (feedbackId: string, apiCall: () => Promise<any>) => {
      // Optimistic update
      dispatch({
        type: 'DELETE_FEEDBACK',
        payload: { id: feedbackId }
      });

      // Execute API call
      return executePendingAction(feedbackId, apiCall);
    }
  };
};