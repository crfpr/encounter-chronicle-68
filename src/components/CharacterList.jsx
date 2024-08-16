import React from 'react';
import CharacterCard from './CharacterCard';
import TurnNavigator from './TurnNavigator';
import { Button } from '../components/ui/button';

const CharacterList = ({ characters, setCharacters, activeCharacterIndex, turnTime, onNextTurn, onPreviousTurn }) => {
  const addCharacter = () => {
    const newCharacter = {
      id: Date.now(),
      initiative: 10,
      name: 'New Character',
      type: 'PC',
      currentHp: 10,
      maxHp: 10,
      ac: 10,
      action: false,
      bonusAction: false,
      currentMovement: 30,
      maxMovement: 30,
      reaction: false,
      conditions: []
    };
    setCharacters(prevCharacters => [...prevCharacters, newCharacter].sort((a, b) => b.initiative - a.initiative));
  };

  const removeCharacter = (id) => {
    setCharacters(prevCharacters => prevCharacters.filter(c => c.id !== id).sort((a, b) => b.initiative - a.initiative));
  };

  const updateCharacter = (updatedCharacter) => {
    setCharacters(prevCharacters => 
      prevCharacters.map(c => c.id === updatedCharacter.id ? updatedCharacter : c)
        .sort((a, b) => b.initiative - a.initiative)
    );
  };

  return (
    <div className="space-y-4 mb-4 flex-grow">
      {characters.map((character, index) => (
        <div key={character.id} className="flex items-stretch">
          {index === activeCharacterIndex && (
            <TurnNavigator
              turnTime={turnTime}
              onNextTurn={onNextTurn}
              onPreviousTurn={onPreviousTurn}
            />
          )}
          <div className={index === activeCharacterIndex ? '' : 'ml-16'}>
            <CharacterCard
              character={character}
              updateCharacter={updateCharacter}
              removeCharacter={removeCharacter}
              isActive={index === activeCharacterIndex}
            />
          </div>
        </div>
      ))}
      <div className="flex mt-4">
        <div className="w-16 mr-2"></div>
        <Button onClick={addCharacter} className="flex-grow bg-black hover:bg-gray-800 text-white">Add Character</Button>
      </div>
    </div>
  );
};

export default CharacterList;