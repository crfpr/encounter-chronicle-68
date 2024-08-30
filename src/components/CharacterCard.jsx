import React, { useState, useEffect } from 'react';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../components/ui/alert-dialog';
import TurnNavigator from './TurnNavigator';
import Token from './Token';
import CharacterNameType from './CharacterNameType';
import { PlusCircle } from 'lucide-react';

const CharacterCard = ({ character, updateCharacter, removeCharacter, isActive, turnTime, onPreviousTurn, onNextTurn, setIsNumericInputActive, onInitiativeBlur }) => {
  const [tokens, setTokens] = useState(character.tokens || []);

  useEffect(() => {
    if (isActive) {
      const updatedTokens = tokens.map(token => ({
        ...token,
        duration: Math.max(0, token.duration - 1)
      }));
      const filteredTokens = updatedTokens.filter(token => token.duration > 0);
      setTokens(filteredTokens);
      updateCharacter({ ...character, tokens: filteredTokens });
    }
  }, [isActive]);

  const getBackgroundColor = () => {
    if (isActive) return 'bg-white md:bg-white';
    switch (character.type) {
      case 'PC':
        return 'bg-blue-50 md:bg-blue-50';
      case 'Enemy':
        return 'bg-red-50 md:bg-red-50';
      case 'Neutral':
        return 'bg-green-50 md:bg-green-50';
      default:
        return 'bg-gray-50 md:bg-gray-50';
    }
  };

  const getBorderColor = () => {
    const baseClasses = 'md:border-[3px]';
    if (isActive) {
      return `${baseClasses} md:border-black`;
    }
    switch (character.type) {
      case 'PC':
        return `${baseClasses} md:border-blue-300`;
      case 'Enemy':
        return `${baseClasses} md:border-red-300`;
      case 'Neutral':
        return `${baseClasses} md:border-green-300`;
      default:
        return `${baseClasses} md:border-gray-300`;
    }
  };

  const getTabColor = () => {
    if (isActive) {
      return 'bg-black';
    }
    switch (character.type) {
      case 'PC':
        return 'bg-blue-300';
      case 'Enemy':
        return 'bg-red-300';
      case 'Neutral':
        return 'bg-green-300';
      default:
        return 'bg-gray-300';
    }
  };

  const handleInputChange = (field, value) => {
    if (field === 'currentHp') {
      value = Math.min(Math.max(0, value), character.maxHp);
    }
    if (field === 'maxHp') {
      value = Math.max(0, value);
      if (character.currentHp > value) {
        updateCharacter({ ...character, [field]: value, currentHp: value });
        return;
      }
    }
    if (field === 'initiative') {
      // Allow empty string or numbers up to 99
      if (value === '' || (Number.isInteger(Number(value)) && Number(value) >= 0 && Number(value) <= 99)) {
        updateCharacter({ ...character, [field]: value });
      }
      return;
    }
    updateCharacter({ ...character, [field]: value });
  };

  const handleNumericInputKeyDown = (e, field, currentValue) => {
    if (field === 'initiative') {
      // Prevent non-numeric input for initiative
      if (!/[0-9]/.test(e.key) && !['Backspace', 'ArrowLeft', 'ArrowRight', 'Tab', 'Enter'].includes(e.key)) {
        e.preventDefault();
      }
      // Handle enter key press for initiative
      if (e.key === 'Enter') {
        e.preventDefault();
        handleInitiativeSubmit();
      }
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
      const step = e.key === 'ArrowUp' ? 1 : -1;
      const newValue = parseInt(currentValue) + step;
      handleInputChange(field, newValue);
    }
  };

  const handleInitiativeBlur = () => {
    onInitiativeBlur(character.id, character.initiative);
  };

  const handleInitiativeSubmit = () => {
    setIsNumericInputActive(false);
    onInitiativeBlur(character.id, character.initiative);
  };

  const toggleAction = (action) => {
    updateCharacter({ ...character, [action]: !character[action] });
  };

  const handleAddToken = () => {
    const newToken = { label: `Token ${tokens.length + 1}`, duration: 1 };
    const updatedTokens = [...tokens, newToken];
    setTokens(updatedTokens);
    updateCharacter({ ...character, tokens: updatedTokens });
  };

  const handleRemoveToken = (index) => {
    const updatedTokens = tokens.filter((_, i) => i !== index);
    setTokens(updatedTokens);
    updateCharacter({ ...character, tokens: updatedTokens });
  };

  const handleUpdateToken = (index, newLabel, newDuration) => {
    const updatedTokens = tokens.map((token, i) => 
      i === index ? { ...token, label: newLabel, duration: newDuration } : token
    );
    setTokens(updatedTokens);
    updateCharacter({ ...character, tokens: updatedTokens });
  };

  return (
    <div className={`flex ${getBackgroundColor()} border border-black relative overflow-hidden rounded-lg ${getBorderColor()}`}>
      {/* Left Tab */}
      <div className={`w-16 ${getTabColor()} ${isActive ? 'text-white' : ''} flex flex-col items-center justify-between py-2`}>
        <div className="flex flex-col items-center">
          <label className={`text-xs font-semibold mb-1 ${isActive ? 'text-white' : ''}`}>Initiative</label>
          <Input
            type="text"
            value={character.initiative}
            onChange={(e) => handleInputChange('initiative', e.target.value)}
            onKeyDown={(e) => handleNumericInputKeyDown(e, 'initiative', character.initiative)}
            onFocus={() => setIsNumericInputActive(true)}
            onBlur={handleInitiativeSubmit}
            className="w-12 text-center bg-white text-black"
            maxLength={2}
          />
        </div>
        {isActive && (
          <div className="flex-1 flex items-center justify-center mt-2">
            <TurnNavigator
              turnTime={turnTime}
              onPreviousTurn={onPreviousTurn}
              onNextTurn={onNextTurn}
            />
          </div>
        )}
      </div>
      
      <div className="flex-grow p-4 flex flex-col">
        <div className="flex-grow space-y-4">
          {/* First row */}
          <div className="flex items-center space-x-2 relative">
            <div className="flex-grow">
              <CharacterNameType
                name={character.name}
                type={character.type}
                onUpdate={(newName, newType) => {
                  updateCharacter({ ...character, name: newName, type: newType });
                }}
              />
            </div>
          </div>

          {/* Second row */}
          <div className="flex flex-wrap items-center gap-2">
            <Button
              onClick={() => toggleAction('action')}
              variant={character.action ? 'default' : 'outline'}
              className="btn-sm"
            >
              Action
            </Button>
            <Button
              onClick={() => toggleAction('bonusAction')}
              variant={character.bonusAction ? 'default' : 'outline'}
              className="btn-sm"
            >
              Bonus Action
            </Button>
            <Button
              onClick={() => toggleAction('reaction')}
              variant={character.reaction ? 'default' : 'outline'}
              className="btn-sm"
            >
              Reaction
            </Button>
            <div className="flex items-end space-x-2">
              <Input
                type="number"
                value={character.currentMovement}
                onChange={(e) => handleInputChange('currentMovement', parseInt(e.target.value))}
                onKeyDown={(e) => handleNumericInputKeyDown(e, 'currentMovement', character.currentMovement)}
                onFocus={() => setIsNumericInputActive(true)}
                onBlur={() => setIsNumericInputActive(false)}
                className="w-16 text-center"
                placeholder="Current"
              />
              <span className="mb-2">/</span>
              <div className="flex items-end">
                <Input
                  type="number"
                  value={character.maxMovement}
                  onChange={(e) => handleInputChange('maxMovement', parseInt(e.target.value))}
                  onKeyDown={(e) => handleNumericInputKeyDown(e, 'maxMovement', character.maxMovement)}
                  onFocus={() => setIsNumericInputActive(true)}
                  onBlur={() => setIsNumericInputActive(false)}
                  className="w-16 text-center"
                  placeholder="Max"
                />
                <span className="text-sm ml-1">ft</span>
              </div>
            </div>
          </div>

          {/* Token display and Add token button */}
          <div className="mt-2 mb-2">
            <div className="flex flex-wrap items-center">
              {tokens.map((token, index) => (
                <Token
                  key={index}
                  label={token.label}
                  duration={token.duration}
                  onRemove={() => handleRemoveToken(index)}
                  onUpdate={(newLabel, newDuration) => handleUpdateToken(index, newLabel, newDuration)}
                />
              ))}
              <Button
                onClick={handleAddToken}
                variant="outline"
                className="h-[30px] px-3 py-1 text-sm flex items-center"
              >
                <PlusCircle className="h-4 w-4 mr-1" />
                Add token
              </Button>
            </div>
          </div>
        </div>

        {/* Delete button */}
        <div className="mt-auto self-end">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="link" 
                className="btn-sm text-gray-700 hover:text-red-500 transition-colors duration-200 whitespace-nowrap"
              >
                Delete character
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the character.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => removeCharacter(character.id)}>
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Right Tab */}
      <div className={`w-24 ${getTabColor()} flex flex-col items-center justify-between p-2`}>
        <div className="flex flex-col items-center space-y-2">
          <div className="flex flex-col items-center">
            <label className={`text-xs font-semibold mb-1 ${isActive ? 'text-white' : ''}`}>Temp HP</label>
            <Input
              type="number"
              value={character.tempHp}
              onChange={(e) => handleInputChange('tempHp', Math.max(0, parseInt(e.target.value) || 0))}
              onKeyDown={(e) => handleNumericInputKeyDown(e, 'tempHp', character.tempHp)}
              onFocus={() => setIsNumericInputActive(true)}
              onBlur={() => setIsNumericInputActive(false)}
              className="w-16 text-center bg-white text-black"
            />
          </div>
          <div className="flex flex-col items-center">
            <label className={`text-xs font-semibold mb-1 ${isActive ? 'text-white' : ''}`}>Current HP</label>
            <Input
              type="number"
              value={character.currentHp}
              onChange={(e) => handleInputChange('currentHp', parseInt(e.target.value) || 0)}
              onKeyDown={(e) => handleNumericInputKeyDown(e, 'currentHp', character.currentHp)}
              onFocus={() => setIsNumericInputActive(true)}
              onBlur={() => setIsNumericInputActive(false)}
              className="w-16 text-center bg-white text-black"
            />
          </div>
          <div className="flex flex-col items-center">
            <label className={`text-xs font-semibold mb-1 ${isActive ? 'text-white' : ''}`}>Max HP</label>
            <Input
              type="number"
              value={character.maxHp}
              onChange={(e) => handleInputChange('maxHp', parseInt(e.target.value) || 0)}
              onKeyDown={(e) => handleNumericInputKeyDown(e, 'maxHp', character.maxHp)}
              onFocus={() => setIsNumericInputActive(true)}
              onBlur={() => setIsNumericInputActive(false)}
              className="w-16 text-center bg-white text-black"
            />
          </div>
        </div>
        <div className="flex flex-col items-center mt-2">
          <label className={`text-xs font-semibold mb-1 ${isActive ? 'text-white' : ''}`}>AC</label>
          <Input
            type="number"
            value={character.ac}
            onChange={(e) => handleInputChange('ac', parseInt(e.target.value))}
            onKeyDown={(e) => handleNumericInputKeyDown(e, 'ac', character.ac)}
            onFocus={() => setIsNumericInputActive(true)}
            onBlur={() => setIsNumericInputActive(false)}
            className="w-16 text-center bg-white text-black"
          />
        </div>
      </div>
    </div>
  );
};

export default CharacterCard;
