import React, { useState, useMemo, useEffect, useRef } from 'react';
import { RoscaCycle, RuleType } from '../types';
import { UserIcon, PencilIcon } from './Icons';

interface AddMemberModalProps {
  roscaCycle: RoscaCycle;
  onClose: () => void;
  onAddMember: (name: string, joiningAmount: number, avatarDataUrl: string | null) => void;
}

export const AddMemberModal: React.FC<AddMemberModalProps> = ({ roscaCycle, onClose, onAddMember }) => {
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState<string | null>(null);
  const { ruleType, currentMonth, joiningFee } = roscaCycle;
  
  const modalContentRef = useRef<HTMLDivElement>(null);
  const triggerElementRef = useRef<Element | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    triggerElementRef.current = document.activeElement;

    const focusableElements = modalContentRef.current?.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements?.[0];
    if (firstElement) {
      firstElement.focus();
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      if (e.key === 'Tab') {
        if (!modalContentRef.current) return;
        // Fix: Cast element to a type with a 'disabled' property to satisfy TypeScript, as the base HTMLElement type lacks it.
        const focusableElements = Array.from(
          modalContentRef.current.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          )
        ).filter(el => !(el as HTMLInputElement).disabled);

        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        const isFirstElement = document.activeElement === firstElement;
        const isLastElement = document.activeElement === lastElement;

        if (e.shiftKey) { // Shift + Tab
          if (isFirstElement) {
            // FIX: Explicitly cast to HTMLElement to resolve type inference issue.
            (lastElement as HTMLElement).focus();
            e.preventDefault();
          }
        } else { // Tab
          if (isLastElement) {
            // FIX: Explicitly cast to HTMLElement to resolve type inference issue.
            (firstElement as HTMLElement).focus();
            e.preventDefault();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (triggerElementRef.current instanceof HTMLElement) {
        triggerElementRef.current.focus();
      }
    };
  }, [onClose]);

  const { isEligible, message } = useMemo(() => {
    if (ruleType === RuleType.STRICT && currentMonth > 1) {
      return {
        isEligible: false,
        message: 'New members can only join at the start of a cycle in Strict mode.'
      };
    }

    return {
      isEligible: true,
      message: ''
    };
  }, [ruleType, currentMonth]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && isEligible) {
      onAddMember(name.trim(), joiningFee, avatar);
      onClose();
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setAvatar(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50" aria-modal="true" role="dialog" aria-labelledby="add-member-title">
      <div ref={modalContentRef} className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-6 sm:p-8 w-full max-w-md m-4">
        <h2 id="add-member-title" className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">Add New Member</h2>
        
        {!isEligible ? (
          <div className="p-4 text-center bg-yellow-50 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-200 rounded-lg">
            <p>{message}</p>
            <button
                type="button"
                onClick={onClose}
                className="mt-4 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-500 rounded-md shadow-sm hover:bg-slate-50 dark:hover:bg-slate-600"
              >
                Close
              </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="mb-4 flex flex-col items-center">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Member Avatar (Optional)
              </label>
              <div className="relative">
                {avatar ? (
                  <img src={avatar} alt="Avatar preview" className="w-24 h-24 rounded-full object-cover border-2 border-slate-300 dark:border-slate-600"/>
                ) : (
                  <div className="w-24 h-24 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center border-2 border-slate-300 dark:border-slate-600">
                    <UserIcon className="w-12 h-12 text-slate-400 dark:text-slate-500" />
                  </div>
                )}
                <button 
                  type="button" 
                  onClick={handleAvatarClick} 
                  className="absolute -bottom-1 -right-1 bg-primary-600 text-white rounded-full p-2 hover:bg-primary-500 shadow-md"
                  aria-label="Upload avatar"
                >
                  <PencilIcon className="w-4 h-4" />
                </button>
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange}
                className="hidden" 
                accept="image/png, image/jpeg, image/gif"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="memberName" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Member Name
              </label>
              <input
                type="text"
                id="memberName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="e.g., Heidy"
                required
              />
            </div>
            
            <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg space-y-2 mb-6">
                <div className='flex justify-between border-t border-slate-200 dark:border-slate-600 pt-2 mt-2'>
                    <span className='font-bold text-slate-700 dark:text-slate-200'>Total Amount Due on Joining:</span>
                    <span className='font-bold text-primary-600 dark:text-primary-400'>{joiningFee.toLocaleString()} BDT</span>
                </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-500 rounded-md shadow-sm hover:bg-slate-50 dark:hover:bg-slate-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!name.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md shadow-sm hover:bg-primary-500 disabled:bg-slate-400 dark:disabled:bg-slate-600"
              >
                Confirm & Add Member
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};