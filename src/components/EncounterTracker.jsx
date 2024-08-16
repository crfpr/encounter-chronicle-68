import React, { useState, useEffect, useCallback } from 'react';
import EncounterHeader from './EncounterHeader';
import CharacterList from './CharacterList';
import CharacterStats from './CharacterStats';
import NotesSection from './NotesSection';
import Sparkles from './Sparkles';
import { Button } from '../components/ui/button';

const EncounterTracker = () => {
  const [encounterName, setEncounterName] = useState('New Encounter');
  const [round, setRound] = useState(1);
  const [characters, setCharacters] = useState([]);
  const [activeCharacterIndex, setActiveCharacterIndex] = useState(0);
  const [encounterTime, setEncounterTime] = useState(0);
  const [turnTime, setTurnTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [showSparkles, setShowSparkles] = useState(false);
  const [roundStates, setRoundStates] = useState([]);
  const [notes, setNotes] = useState('');
  const [history, setHistory] = useState([]);

  useEffect(() => {
    setHistory(prevHistory => [
      ...prevHistory,
      {
        round,
        characters: characters.map(char => ({ ...char })),
        activeCharacterIndex,
        encounterTime,
        turnTime,
        notes
      }
    ]);
  }, [round, characters, activeCharacterIndex, encounterTime, turnTime, notes]);

  useEffect(() => {
    let interval;
    if (isRunning) {
      interval = setInterval(() => {
        setEncounterTime((prevTime) => prevTime + 1);
        setTurnTime((prevTime) => prevTime + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const handleNextTurn = useCallback(() => {
    if (characters.length === 0) return;

    const nextIndex = (activeCharacterIndex + 1) % characters.length;

    setCharacters(prevCharacters => prevCharacters.map((char, index) => {
      if (index === activeCharacterIndex) {
        // Update current character
        return {
          ...char,
          turnCount: Math.min((char.turnCount || 0) + 1, round),
          cumulativeTurnTime: (char.cumulativeTurnTime || 0) + turnTime
        };
      } else if (index === nextIndex) {
        // Reset action, bonus action, and movement for the next character
        return {
          ...char,
          action: false,
          bonusAction: false,
          currentMovement: char.maxMovement,
          conditions: char.conditions.map(condition => ({
            ...condition,
            duration: condition.duration === 'P' ? 'P' : 
              (parseInt(condition.duration) > 1 ? (parseInt(condition.duration) - 1).toString() : '0')
          })).filter(condition => condition.duration !== '0')
        };
      }
      return char;
    }));

    setTurnTime(0);
    setActiveCharacterIndex(nextIndex);

    if (nextIndex === 0) {
      setRoundStates(prevStates => [...prevStates, characters]);

      setRound((prevRound) => {
        setShowSparkles(true);
        setTimeout(() => setShowSparkles(false), 1000);
        return prevRound + 1;
      });

      // Reset reactions for all characters at the start of a new round
      setCharacters(prevCharacters => prevCharacters.map(char => ({
        ...char,
        reaction: false
      })));
    }
  }, [characters, activeCharacterIndex, turnTime, round]);

  const handlePreviousTurn = useCallback(() => {
    if (characters.length === 0) return;

    setTurnTime(0);
    const prevIndex = (activeCharacterIndex - 1 + characters.length) % characters.length;
    setActiveCharacterIndex(prevIndex);

    if (prevIndex === characters.length - 1) {
      setRound((prevRound) => {
        if (prevRound > 1) {
          const previousState = roundStates[prevRound - 2];
          if (previousState) {
            setCharacters(previousState);
            setRoundStates(prevStates => prevStates.slice(0, -1));
          }
        }
        return Math.max(1, prevRound - 1);
      });
    }
  }, [characters.length, roundStates, activeCharacterIndex]);

  const toggleEncounter = () => {
    setIsRunning((prevIsRunning) => !prevIsRunning);
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') {
        return;
      }

      if (event.key === 'ArrowUp') {
        event.preventDefault();
        handlePreviousTurn();
      } else if (event.key === 'ArrowDown') {
        event.preventDefault();
        handleNextTurn();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleNextTurn, handlePreviousTurn]);

  const exportEncounterData = () => {
    const encounterData = {
      encounterName,
      history,
      roundStates
    };
    const dataStr = JSON.stringify(encounterData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `${encounterName.replace(/\s+/g, '_')}_export.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <div className="flex space-x-6">
      <div className="flex-grow space-y-6">
        <div className="bg-white shadow-md rounded-lg p-6 relative">
          <EncounterHeader
            encounterName={encounterName}
            setEncounterName={setEncounterName}
            isRunning={isRunning}
            toggleEncounter={toggleEncounter}
            encounterTime={encounterTime}
          />
          <div className="flex items-center mb-4">
            <div className="text-xl font-semibold flex items-center">
              Round {round}
              {showSparkles && <Sparkles />}
            </div>
          </div>
          <div className="flex">
            <div className="w-12 mr-2 flex flex-col items-start">
              {characters.length > 0 && (
                <>
                  <Button onClick={handlePreviousTurn} variant="ghost" size="icon" className="p-0 mb-2">
                    <ChevronUp className="h-6 w-6" />
                  </Button>
                  <div className="text-sm font-semibold mb-2">{formatTime(turnTime)}</div>
                  <Button onClick={handleNextTurn} variant="ghost" size="icon" className="p-0">
                    <ChevronDown className="h-6 w-6" />
                  </Button>
                </>
              )}
            </div>
            <div className="flex-grow">
              <CharacterList 
                characters={characters} 
                setCharacters={setCharacters} 
                activeCharacterIndex={activeCharacterIndex}
                turnTime={turnTime}
                onNextTurn={handleNextTurn}
                onPreviousTurn={handlePreviousTurn}
              />
            </div>
          </div>
        </div>
        <div className="bg-white shadow-md rounded-lg p-6">
          <CharacterStats characters={characters} round={round} />
        </div>
        <div className="flex justify-center">
          <Button onClick={exportEncounterData} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            Export Encounter Data
          </Button>
        </div>
      </div>
      <div className="w-1/3">
        <NotesSection notes={notes} setNotes={setNotes} />
      </div>
    </div>
  );
};

export default EncounterTracker;