import React from 'react';
import { Input } from '../components/ui/input';
import { Checkbox } from '../components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../components/ui/alert-dialog';
import { Label } from '../components/ui/label';

const CharacterCard = ({ character, updateCharacter, removeCharacter }) => {
  const handleChange = (field, value) => {
    updateCharacter({ ...character, [field]: value });
  };

  const addCondition = () => {
    const newCondition = { name: 'New Condition', duration: 1 };
    handleChange('conditions', [...character.conditions, newCondition]);
  };

  const updateCondition = (index, field, value) => {
    const updatedConditions = character.conditions.map((condition, i) => 
      i === index ? { ...condition, [field]: value } : condition
    );
    handleChange('conditions', updatedConditions);
  };

  const removeCondition = (index) => {
    const updatedConditions = character.conditions.filter((_, i) => i !== index);
    handleChange('conditions', updatedConditions);
  };

  const getBackgroundColor = () => {
    switch (character.type) {
      case 'PC': return 'bg-blue-100';
      case 'NPC': return 'bg-gray-100';
      case 'Enemy': return 'bg-red-100';
      default: return 'bg-white';
    }
  };

  const getBorderColor = () => {
    return character.currentHp <= character.maxHp / 2 ? 'border-red-600' : 'border-gray-200';
  };

  return (
    <div className={`p-4 rounded-lg border-2 ${getBackgroundColor()} ${getBorderColor()}`}>
      <div className="flex items-center space-x-2 mb-2">
        <div className="flex flex-col">
          <Label htmlFor={`initiative-${character.id}`}>Initiative</Label>
          <Input
            id={`initiative-${character.id}`}
            value={character.initiative}
            onChange={(e) => handleChange('initiative', e.target.value)}
            className="w-16"
          />
        </div>
        <div className="flex flex-col">
          <Label htmlFor={`type-${character.id}`}>Type</Label>
          <Select value={character.type} onValueChange={(value) => handleChange('type', value)}>
            <SelectTrigger id={`type-${character.id}`} className="w-24">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PC">PC</SelectItem>
              <SelectItem value="NPC">NPC</SelectItem>
              <SelectItem value="Enemy">Enemy</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col flex-grow">
          <Label htmlFor={`name-${character.id}`}>Name</Label>
          <Input
            id={`name-${character.id}`}
            value={character.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className="w-full"
          />
        </div>
      </div>
      <div className="flex items-center space-x-2 mb-2">
        <div className="flex flex-col">
          <Label htmlFor={`currentHp-${character.id}`}>Current HP</Label>
          <Input
            id={`currentHp-${character.id}`}
            value={character.currentHp}
            onChange={(e) => handleChange('currentHp', e.target.value)}
            className="w-16"
          />
        </div>
        <span className="self-end">/</span>
        <div className="flex flex-col">
          <Label htmlFor={`maxHp-${character.id}`}>Max HP</Label>
          <Input
            id={`maxHp-${character.id}`}
            value={character.maxHp}
            onChange={(e) => handleChange('maxHp', e.target.value)}
            className="w-16"
          />
        </div>
        <div className="flex flex-col items-center">
          <Label htmlFor={`action-${character.id}`}>Action</Label>
          <Checkbox
            id={`action-${character.id}`}
            checked={character.action}
            onCheckedChange={(checked) => handleChange('action', checked)}
          />
        </div>
        <div className="flex flex-col items-center">
          <Label htmlFor={`bonus-action-${character.id}`}>Bonus Action</Label>
          <Checkbox
            id={`bonus-action-${character.id}`}
            checked={character.bonusAction}
            onCheckedChange={(checked) => handleChange('bonusAction', checked)}
          />
        </div>
        <div className="flex flex-col">
          <Label htmlFor={`movement-${character.id}`}>Movement</Label>
          <div className="flex items-center">
            <Input
              id={`movement-${character.id}`}
              value={character.movement}
              onChange={(e) => handleChange('movement', e.target.value)}
              className="w-16"
            />
            <span className="ml-1">ft</span>
          </div>
        </div>
        <div className="flex flex-col items-center">
          <Label htmlFor={`reaction-${character.id}`}>Reaction</Label>
          <Checkbox
            id={`reaction-${character.id}`}
            checked={character.reaction}
            onCheckedChange={(checked) => handleChange('reaction', checked)}
          />
        </div>
      </div>
      <div className="flex items-center space-x-2 mb-2">
        <Button onClick={addCondition} variant="outline" size="sm">Add Condition</Button>
        {character.conditions.map((condition, index) => (
          <Badge key={index} variant="secondary" className="px-2 py-1">
            <Input
              value={condition.name}
              onChange={(e) => updateCondition(index, 'name', e.target.value)}
              className="w-24 mr-1"
            />
            <Input
              value={condition.duration}
              onChange={(e) => updateCondition(index, 'duration', e.target.value)}
              className="w-12 mr-1"
              type="number"
            />
            <button onClick={() => removeCondition(index)} className="ml-2 text-red-500">×</button>
          </Badge>
        ))}
      </div>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="destructive" size="sm">Remove Character</Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the character from the encounter.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => removeCharacter(character.id)}>
              Yes, remove character
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CharacterCard;