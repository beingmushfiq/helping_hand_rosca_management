

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { RoscaCycle } from '../types';
import { TrashIcon, PencilIcon, UserPlusIcon, ArchiveIcon, LogOutIcon, SunIcon, MoonIcon } from './Icons';
import { ConfirmRemovalModal } from './ConfirmRemovalModal';

interface CycleSelectorProps {
  cycles: RoscaCycle[];
  activeCycleId: string | null;
  onSelectCycle: (id: string) => void;
  onCreateCycle: () => void;
  onDeleteCycle: (id: string) => void;
  onRenameCycle: (id: string, newName: string) => void;
  onArchiveCycle: (id: string) => void;
  onLogout: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export const CycleSelector: React.FC<CycleSelectorProps> = ({
  cycles,
  activeCycleId,
  onSelectCycle,
  onCreateCycle,
  onDeleteCycle,
  onRenameCycle,
  onArchiveCycle,
  onLogout,
  theme,
  onToggleTheme,
}) => {
  const [editingCycleId, setEditingCycleId] = useState<string | null>(null);
  const [editedName, setEditedName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [cycleToDelete, setCycleToDelete] = useState<RoscaCycle | null>(null);

  const { activeCycles, archivedCycles } = useMemo(() => {
    const active: RoscaCycle[] = [];
    const archived: RoscaCycle[] = [];
    cycles.forEach(cycle => {
      if (cycle.isArchived) {
        archived.push(cycle);
      } else {
        active.push(cycle);
      }
    });
    return { activeCycles: active, archivedCycles: archived };
  }, [cycles]);

  useEffect(() => {
    if (editingCycleId && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingCycleId]);
    
  const handleOpenDeleteModal = (e: React.MouseEvent, cycle: RoscaCycle) => {
    e.stopPropagation();
    setCycleToDelete(cycle);
    setDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setCycleToDelete(null);
    setDeleteModalOpen(false);
  };

  const handleConfirmDelete = () => {
    if (cycleToDelete) {
      onDeleteCycle(cycleToDelete.id);
      handleCloseDeleteModal();
    }
  };

  const handleEditClick = (e: React.MouseEvent, cycle: RoscaCycle) => {
    e.stopPropagation();
    setEditingCycleId(cycle.id);
    setEditedName(cycle.name);
  };
  
  const handleArchiveClick = (e: React.MouseEvent, cycleId: string) => {
    e.stopPropagation();
    onArchiveCycle(cycleId);
  };

  const handleRenameSubmit = (cycleId: string, originalName: string) => {
    if (editedName.trim() && editedName.trim() !== originalName) {
      onRenameCycle(cycleId, editedName.trim());
    }
    setEditingCycleId(null);
  };
    
  return (
    <>
      <aside className="w-64 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-r border-white/50 dark:border-slate-700/50 flex flex-col">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Trust Circles</h2>
        </div>
        <nav className="flex-1 overflow-y-auto p-2">
          <div className="space-y-1">
            {activeCycles.map(cycle => {
              const isComplete = cycle.currentMonth > cycle.cycleLength;
              return (
                <button
                  key={cycle.id}
                  onClick={() => editingCycleId !== cycle.id && onSelectCycle(cycle.id)}
                  className={`w-full text-left p-3 rounded-lg flex items-center justify-between group transition-colors duration-200 ${
                    activeCycleId === cycle.id && !editingCycleId
                      ? 'bg-primary-500 text-white font-semibold shadow-md'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {editingCycleId === cycle.id ? (
                    <input
                      ref={inputRef}
                      type="text"
                      value={editedName}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => setEditedName(e.target.value)}
                      onBlur={() => handleRenameSubmit(cycle.id, cycle.name)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleRenameSubmit(cycle.id, cycle.name);
                        if (e.key === 'Escape') setEditingCycleId(null);
                      }}
                      className="w-full bg-transparent text-slate-800 dark:text-white border-b-2 border-primary-500 focus:outline-none"
                    />
                  ) : (
                    <>
                      <span className="truncate flex-1">{cycle.name}</span>
                      <div className="flex items-center pl-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        {isComplete ? (
                          <span
                            onClick={(e) => handleArchiveClick(e, cycle.id)}
                            className={`p-1.5 rounded-full ${activeCycleId === cycle.id ? 'hover:bg-primary-400' : 'hover:bg-slate-300 dark:hover:bg-slate-600'}`}
                            aria-label={`Archive ${cycle.name}`}
                            title="Archive Cycle"
                          >
                            <ArchiveIcon className="w-4 h-4 text-green-600 dark:text-green-400"/>
                          </span>
                        ) : (
                          <>
                            <span
                              onClick={(e) => handleEditClick(e, cycle)}
                              className={`p-1.5 rounded-full ${activeCycleId === cycle.id ? 'hover:bg-primary-400' : 'hover:bg-slate-300 dark:hover:bg-slate-600'}`}
                              aria-label={`Rename ${cycle.name}`}
                              title="Rename Cycle"
                            >
                              <PencilIcon className="w-4 h-4"/>
                            </span>
                            <span
                                onClick={(e) => handleOpenDeleteModal(e, cycle)}
                                className={`p-1.5 rounded-full ${
                                    activeCycleId === cycle.id 
                                    ? 'hover:bg-primary-400'
                                    : 'hover:bg-red-200 dark:hover:bg-red-800 text-red-500 dark:text-red-400'
                                }`}
                                aria-label={`Delete ${cycle.name}`}
                                title="Delete Cycle"
                            >
                                <TrashIcon className="w-4 h-4"/>
                            </span>
                          </>
                        )}
                      </div>
                    </>
                  )}
                </button>
              )
            })}
          </div>

          {archivedCycles.length > 0 && (
            <>
              <div className="px-3 pt-4 pb-2">
                <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Archived</h3>
              </div>
              <div className="space-y-1">
                {archivedCycles.map(cycle => (
                  <button
                    key={cycle.id}
                    onClick={() => onSelectCycle(cycle.id)}
                    className={`w-full text-left p-3 rounded-lg flex items-center justify-between group transition-colors duration-200 ${
                      activeCycleId === cycle.id
                        ? 'bg-slate-300 dark:bg-slate-600 text-slate-800 dark:text-slate-100 font-semibold'
                        : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                    aria-label={`${cycle.name} (Archived)`}
                  >
                    <span className="truncate flex-1 italic">{cycle.name}</span>
                    <ArchiveIcon className="w-4 h-4 text-slate-400 dark:text-slate-500 flex-shrink-0" />
                  </button>
                ))}
              </div>
            </>
          )}
        </nav>
        <div className="p-4 border-t border-slate-200 dark:border-slate-700 space-y-2">
          <button
            onClick={onCreateCycle}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg shadow-sm hover:bg-indigo-500"
          >
            <UserPlusIcon className="w-5 h-5"/>
            Create New Circle
          </button>
          <div className="flex items-center gap-2">
             <button
              onClick={onLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 bg-slate-200 dark:bg-slate-600 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-500"
            >
              <LogOutIcon className="w-5 h-5"/>
              Logout
            </button>
            <button
              onClick={onToggleTheme}
              className="flex-shrink-0 p-2 text-slate-700 dark:text-slate-200 bg-slate-200 dark:bg-slate-600 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-500"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <MoonIcon className="w-5 h-5"/> : <SunIcon className="w-5 h-5"/>}
            </button>
           </div>
        </div>
      </aside>
      {isDeleteModalOpen && cycleToDelete && (
        <ConfirmRemovalModal
          isOpen={isDeleteModalOpen}
          title="Delete Trust Circle"
          message={
            <>
              Are you sure you want to delete the circle{' '}
              <span className="font-bold">{cycleToDelete.name}</span>? This action
              cannot be undone.
            </>
          }
          onClose={handleCloseDeleteModal}
          onConfirm={handleConfirmDelete}
          confirmButtonText="Delete Circle"
        />
      )}
    </>
  );
};
