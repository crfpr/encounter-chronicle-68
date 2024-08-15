import React from 'react';
import CharacterCard from './CharacterCard';
import { Button } from '../components/ui/button';

const CharacterList = ({ characters, setCharacters }) => {
  const addCharacter = () => {
    const newCharacter = {
      id: Date.now(),
      initiative: 10,
      name: 'New Character',
      type: 'PC',
      currentHp: 10,
      maxHp: 10,
      action: false,
      bonusAction: false,
      movement: 30,
      reaction: false,
      conditions: []
    };
    setCharacters([...characters, newCharacter]);
  };

  const removeCharacter = (id) => {
    setCharacters(characters.filter(c => c.id !== id));
  };

  return (
    <div className="space-y-4 mb-4">
      {characters.map((character) => (
        <CharacterCard
          key={character.id}
          character={character}
          updateCharacter={(updatedCharacter) => {
            setCharacters(characters.map(c => c.id === updatedCharacter.id ? updatedCharacter : c));
          }}
          removeCharacter={removeCharacter}
        />
      ))}
      <Button onClick={addCharacter} className="w-full">Add Character</Button>
    </div>
  );
};

export default CharacterList;