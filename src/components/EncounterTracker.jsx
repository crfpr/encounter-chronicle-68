import React, { useState, useEffect, useCallback, useRef, forwardRef, useImperativeHandle } from 'react';
import EncounterHeader from './EncounterHeader';
import CharacterList from './CharacterList';
import CombatantStats from './CombatantStats';
import NotesSection from './NotesSection';
import MobileMenu from './MobileMenu';
import SwipeHandler from './SwipeHandler';
import { useCombatantManagement } from '../hooks/useCombatantManagement';
import { useEncounterLogic } from '../hooks/useEncounterLogic';

const EncounterTracker = forwardRef(({ encounterName, setEncounterName, exportEncounterData, uploadEncounterData, isMobile, contentHeight, loadedEncounterData, autoSave, toggleAutoSave, autoSaveEncounter }, ref) => {
  const [notes, setNotes] = useState('');
  const [activePage, setActivePage] = useState('tracker');
  const [isNumericInputActive, setIsNumericInputActive] = useState(false);
  const trackerRef = useRef(null);
  const headerRef = useRef(null);
  const characterListRef = useRef(null);
  const renderCountRef = useRef(0);

  const {
    combatants,
    setCombatants,
    addCombatant,
    removeCombatant,
    updateCombatant
  } = useCombatantManagement(loadedEncounterData);

  const encounterLogic = useEncounterLogic(combatants, setCombatants, autoSaveEncounter);

  useEffect(() => {
    renderCountRef.current += 1;
    console.log(`EncounterTracker render #${renderCountRef.current} - combatants:`, combatants);
  });

  useImperativeHandle(ref, () => ({
    getEncounterData: () => ({
      encounterName,
      combatants,
      round: encounterLogic.round,
      encounterTime: encounterLogic.encounterTime,
      turnTime: encounterLogic.turnTime,
      notes,
      log: encounterLogic.encounterLog,
      activeCombatantIndex: encounterLogic.activeCombatantIndex,
      isRunning: encounterLogic.isRunning
    })
  }));

  useEffect(() => {
    if (loadedEncounterData) {
      encounterLogic.setRound(loadedEncounterData.round || 1);
      encounterLogic.setActiveCombatantIndex(loadedEncounterData.activeCombatantIndex || 0);
      encounterLogic.setEncounterTime(loadedEncounterData.encounterTime || 0);
      encounterLogic.setTurnTime(loadedEncounterData.turnTime || 0);
      setNotes(loadedEncounterData.notes || '');
      encounterLogic.setEncounterLog(loadedEncounterData.log || []);
      setEncounterName(loadedEncounterData.encounterName || 'New Encounter');
      encounterLogic.setIsRunning(loadedEncounterData.isRunning || false);
      setCombatants(loadedEncounterData.combatants || []);
      encounterLogic.logEvent('Encounter data loaded');
    }
  }, [loadedEncounterData, setEncounterName, encounterLogic, setCombatants]);

  const handleSwipe = useCallback((direction) => {
    if (isMobile) {
      setActivePage(prevPage => {
        const pages = ['tracker', 'notes', 'stats'];
        const currentIndex = pages.indexOf(prevPage);
        const newIndex = (currentIndex + (direction === 'left' ? 1 : -1) + pages.length) % pages.length;
        return pages[newIndex];
      });
    }
  }, [isMobile]);

  const handleKeyDown = useCallback((e) => {
    if (!isMobile && combatants.length > 1 && !isNumericInputActive) {
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        e.preventDefault();
        if (e.key === 'ArrowUp') {
          encounterLogic.handlePreviousTurn();
        } else {
          encounterLogic.handleNextTurn();
        }
      }
    }
  }, [isMobile, combatants.length, isNumericInputActive, encounterLogic]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const renderContent = () => {
    const commonProps = {
      combatants,
      setCombatants,
      activeCombatantIndex: encounterLogic.activeCombatantIndex,
      onPreviousTurn: encounterLogic.handlePreviousTurn,
      onNextTurn: encounterLogic.handleNextTurn,
      setIsNumericInputActive,
      updateCombatant,
      addCombatant,
      removeCombatant,
      round: encounterLogic.round,
      isMobile
    };

    const renderTracker = () => (
      <div className="flex-grow overflow-hidden flex flex-col h-full px-2 sm:px-4 py-2 sm:py-4">
        <div ref={headerRef} className="sticky top-0 z-10 bg-white dark:bg-zinc-950 mb-2">
          <EncounterHeader
            isRunning={encounterLogic.isRunning}
            toggleEncounter={encounterLogic.toggleEncounter}
            encounterTime={encounterLogic.encounterTime}
            turnTime={encounterLogic.turnTime}
            round={encounterLogic.round}
          />
        </div>
        <div ref={trackerRef} className={`flex-grow overflow-y-auto ${isMobile ? 'pb-20' : ''}`}>
          <CharacterList ref={characterListRef} {...commonProps} />
        </div>
      </div>
    );

    const renderNotes = () => (
      <div className="h-full flex flex-col px-2 sm:px-4">
        <div className="flex-grow">
          <NotesSection 
            key={`notes-section-${activePage}-${isMobile}`} 
            notes={notes} 
            setNotes={(newNotes) => {
              setNotes(newNotes);
              encounterLogic.logEvent(`Notes updated`);
            }} 
            isMobile={isMobile} 
          />
        </div>
      </div>
    );

    const renderStats = () => (
      <div className="h-full flex flex-col px-2 sm:px-4">
        <div className="flex-grow overflow-y-auto">
          <CombatantStats combatants={combatants} round={encounterLogic.round} key={encounterLogic.round} />
        </div>
      </div>
    );

    if (isMobile) {
      switch (activePage) {
        case 'tracker': return renderTracker();
        case 'notes': return renderNotes();
        case 'stats': return renderStats();
        default: return null;
      }
    } else {
      return (
        <div className="flex flex-col lg:flex-row w-full h-full space-y-4 lg:space-y-0 lg:space-x-4">
          <div className="lg:w-2/3 h-full flex flex-col">
            <div className="bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-lg flex flex-col overflow-hidden h-full shadow-md dark:shadow-none">
              {renderTracker()}
            </div>
          </div>
          <div className="lg:w-1/3 h-full flex flex-col space-y-4">
            <div className="bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-lg p-4 flex-1 overflow-hidden flex flex-col shadow-md dark:shadow-none">
              <div className="flex-grow overflow-y-auto">
                <NotesSection notes={notes} setNotes={(newNotes) => {
                  setNotes(newNotes);
                  encounterLogic.logEvent(`Notes updated`);
                }} isMobile={false} />
              </div>
            </div>
            <div className="bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-lg p-4 flex-1 overflow-hidden flex flex-col shadow-md dark:shadow-none">
              <h2 className="text-xl font-semibold mb-2">Combatant Stats</h2>
              <div className="flex-grow overflow-y-auto">
                <CombatantStats combatants={combatants} round={encounterLogic.round} />
              </div>
            </div>
          </div>
        </div>
      );
    }
  };


  return (
    <div className="flex flex-col h-full">
      <div className="flex-grow overflow-y-auto">
        {renderContent()}
      </div>
      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 z-[10001]">
          <MobileMenu 
            activePage={activePage} 
            setActivePage={setActivePage} 
            onExport={exportEncounterData}
            autoSave={autoSave}
            toggleAutoSave={toggleAutoSave}
          />
        </div>
      )}
      {isMobile && <SwipeHandler onSwipeLeft={() => handleSwipe('left')} onSwipeRight={() => handleSwipe('right')} />}
    </div>
  );
});

export default EncounterTracker;