import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Plus, Trash2, Edit, Save, Home, Building } from "lucide-react";

interface PropertyCard {
  id: string;
  name: string;
  color: string;
  price: number;
  rent: number;
  description: string;
}

interface BoardSpace {
  id: string;
  name: string;
  type: 'property' | 'special' | 'corner';
  color?: string;
  price?: number;
  rent?: number;
}

interface GameSettingsProps {
  onBack: () => void;
  properties: PropertyCard[];
  boardSpaces: BoardSpace[];
  onSaveProperties: (properties: PropertyCard[]) => void;
  onSaveBoardSpaces: (spaces: BoardSpace[]) => void;
}

const propertyColors = [
  { value: 'brown', label: 'Brown', color: 'bg-property-brown' },
  { value: 'light-blue', label: 'Light Blue', color: 'bg-property-light-blue' },
  { value: 'pink', label: 'Pink', color: 'bg-property-pink' },
  { value: 'orange', label: 'Orange', color: 'bg-property-orange' },
  { value: 'red', label: 'Red', color: 'bg-property-red' },
  { value: 'yellow', label: 'Yellow', color: 'bg-property-yellow' },
  { value: 'green', label: 'Green', color: 'bg-property-green' },
  { value: 'blue', label: 'Blue', color: 'bg-property-blue' },
];

const GameSettings = ({ onBack, properties, boardSpaces, onSaveProperties, onSaveBoardSpaces }: GameSettingsProps) => {
  const [localProperties, setLocalProperties] = useState<PropertyCard[]>(properties);
  const [localBoardSpaces, setLocalBoardSpaces] = useState<BoardSpace[]>(boardSpaces);
  const [editingProperty, setEditingProperty] = useState<string | null>(null);
  const [newProperty, setNewProperty] = useState<Partial<PropertyCard>>({
    name: '',
    color: 'brown',
    price: 100,
    rent: 10,
    description: ''
  });

  const addProperty = () => {
    if (newProperty.name) {
      const property: PropertyCard = {
        id: Date.now().toString(),
        name: newProperty.name!,
        color: newProperty.color!,
        price: newProperty.price!,
        rent: newProperty.rent!,
        description: newProperty.description!
      };
      setLocalProperties([...localProperties, property]);
      setNewProperty({ name: '', color: 'brown', price: 100, rent: 10, description: '' });
    }
  };

  const deleteProperty = (id: string) => {
    setLocalProperties(localProperties.filter(p => p.id !== id));
  };

  const updateProperty = (id: string, updates: Partial<PropertyCard>) => {
    setLocalProperties(localProperties.map(p => 
      p.id === id ? { ...p, ...updates } : p
    ));
    setEditingProperty(null);
  };

  const generateDefaultBoard = () => {
    const defaultSpaces: BoardSpace[] = [
      // Bottom row
      { id: '0', name: 'GO', type: 'corner' },
      { id: '1', name: 'Mediterranean Ave', type: 'property', color: 'brown', price: 60, rent: 2 },
      { id: '2', name: 'Community Chest', type: 'special' },
      { id: '3', name: 'Baltic Ave', type: 'property', color: 'brown', price: 60, rent: 4 },
      { id: '4', name: 'Income Tax', type: 'special' },
      { id: '5', name: 'Reading Railroad', type: 'property', price: 200, rent: 25 },
      { id: '6', name: 'Oriental Ave', type: 'property', color: 'light-blue', price: 100, rent: 6 },
      { id: '7', name: 'Chance', type: 'special' },
      { id: '8', name: 'Vermont Ave', type: 'property', color: 'light-blue', price: 100, rent: 6 },
      { id: '9', name: 'Connecticut Ave', type: 'property', color: 'light-blue', price: 120, rent: 8 },
      { id: '10', name: 'Jail', type: 'corner' },
      
      // Right side (continuing around)
      { id: '11', name: 'St. Charles Place', type: 'property', color: 'pink', price: 140, rent: 10 },
      { id: '12', name: 'Electric Company', type: 'special' },
      { id: '13', name: 'States Ave', type: 'property', color: 'pink', price: 140, rent: 10 },
      { id: '14', name: 'Virginia Ave', type: 'property', color: 'pink', price: 160, rent: 12 },
      { id: '15', name: 'Pennsylvania Railroad', type: 'property', price: 200, rent: 25 },
      { id: '16', name: 'St. James Place', type: 'property', color: 'orange', price: 180, rent: 14 },
      { id: '17', name: 'Community Chest', type: 'special' },
      { id: '18', name: 'Tennessee Ave', type: 'property', color: 'orange', price: 180, rent: 14 },
      { id: '19', name: 'New York Ave', type: 'property', color: 'orange', price: 200, rent: 16 },
      { id: '20', name: 'Free Parking', type: 'corner' },
      
      // Continue for top and left sides...
      { id: '21', name: 'Kentucky Ave', type: 'property', color: 'red', price: 220, rent: 18 },
      { id: '22', name: 'Chance', type: 'special' },
      { id: '23', name: 'Indiana Ave', type: 'property', color: 'red', price: 220, rent: 18 },
      { id: '24', name: 'Illinois Ave', type: 'property', color: 'red', price: 240, rent: 20 },
      { id: '25', name: 'B&O Railroad', type: 'property', price: 200, rent: 25 },
      { id: '26', name: 'Atlantic Ave', type: 'property', color: 'yellow', price: 260, rent: 22 },
      { id: '27', name: 'Ventnor Ave', type: 'property', color: 'yellow', price: 260, rent: 22 },
      { id: '28', name: 'Water Works', type: 'special' },
      { id: '29', name: 'Marvin Gardens', type: 'property', color: 'yellow', price: 280, rent: 24 },
      { id: '30', name: 'Go to Jail', type: 'corner' },
      
      { id: '31', name: 'Pacific Ave', type: 'property', color: 'green', price: 300, rent: 26 },
      { id: '32', name: 'North Carolina Ave', type: 'property', color: 'green', price: 300, rent: 26 },
      { id: '33', name: 'Community Chest', type: 'special' },
      { id: '34', name: 'Pennsylvania Ave', type: 'property', color: 'green', price: 320, rent: 28 },
      { id: '35', name: 'Short Line', type: 'property', price: 200, rent: 25 },
      { id: '36', name: 'Chance', type: 'special' },
      { id: '37', name: 'Park Place', type: 'property', color: 'blue', price: 350, rent: 35 },
      { id: '38', name: 'Luxury Tax', type: 'special' },
      { id: '39', name: 'Boardwalk', type: 'property', color: 'blue', price: 400, rent: 50 },
    ];
    setLocalBoardSpaces(defaultSpaces);
  };

  return (
    <div className="min-h-screen bg-gradient-board p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="w-4 h-4" />
            Back to Game
          </Button>
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Game Settings
          </h1>
        </div>

        <Tabs defaultValue="properties" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="properties" className="flex items-center gap-2">
              <Building className="w-4 h-4" />
              Property Cards
            </TabsTrigger>
            <TabsTrigger value="board" className="flex items-center gap-2">
              <Home className="w-4 h-4" />
              Board Layout
            </TabsTrigger>
          </TabsList>

          {/* Properties Tab */}
          <TabsContent value="properties" className="space-y-6">
            {/* Add New Property */}
            <Card variant="property">
              <CardHeader>
                <CardTitle>Create New Property Card</CardTitle>
                <CardDescription>
                  Add custom properties to your Monopoly game
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="prop-name">Property Name</Label>
                    <Input
                      id="prop-name"
                      value={newProperty.name}
                      onChange={(e) => setNewProperty({ ...newProperty, name: e.target.value })}
                      placeholder="Property name"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="prop-color">Color Group</Label>
                    <Select
                      value={newProperty.color}
                      onValueChange={(value) => setNewProperty({ ...newProperty, color: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {propertyColors.map(color => (
                          <SelectItem key={color.value} value={color.value}>
                            <div className="flex items-center gap-2">
                              <div className={`w-4 h-4 rounded ${color.color}`} />
                              {color.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="prop-price">Price ($)</Label>
                    <Input
                      id="prop-price"
                      type="number"
                      value={newProperty.price}
                      onChange={(e) => setNewProperty({ ...newProperty, price: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="prop-rent">Rent ($)</Label>
                    <Input
                      id="prop-rent"
                      type="number"
                      value={newProperty.rent}
                      onChange={(e) => setNewProperty({ ...newProperty, rent: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="prop-description">Description</Label>
                  <Input
                    id="prop-description"
                    value={newProperty.description}
                    onChange={(e) => setNewProperty({ ...newProperty, description: e.target.value })}
                    placeholder="Property description"
                  />
                </div>
                
                <Button onClick={addProperty} variant="game">
                  <Plus className="w-4 h-4" />
                  Add Property
                </Button>
              </CardContent>
            </Card>

            {/* Property List */}
            <Card variant="property">
              <CardHeader>
                <CardTitle>Property Cards ({localProperties.length})</CardTitle>
                <div className="flex gap-2">
                  <Button onClick={() => onSaveProperties(localProperties)} variant="default">
                    <Save className="w-4 h-4" />
                    Save Properties
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {localProperties.map(property => {
                    const colorInfo = propertyColors.find(c => c.value === property.color);
                    const isEditing = editingProperty === property.id;
                    
                    return (
                      <Card key={property.id} className="border-2 border-border hover:border-primary/40 transition-smooth">
                        <CardContent className="p-4">
                          {colorInfo && (
                            <div className={`h-3 ${colorInfo.color} rounded-t-md -mx-4 -mt-4 mb-3`} />
                          )}
                          
                          {isEditing ? (
                            <div className="space-y-3">
                              <Input
                                value={property.name}
                                onChange={(e) => updateProperty(property.id, { name: e.target.value })}
                                className="font-bold"
                              />
                              <div className="flex gap-2">
                                <Input
                                  type="number"
                                  value={property.price}
                                  onChange={(e) => updateProperty(property.id, { price: parseInt(e.target.value) || 0 })}
                                  className="text-sm"
                                />
                                <Input
                                  type="number"
                                  value={property.rent}
                                  onChange={(e) => updateProperty(property.id, { rent: parseInt(e.target.value) || 0 })}
                                  className="text-sm"
                                />
                              </div>
                              <Button size="sm" onClick={() => setEditingProperty(null)}>
                                <Save className="w-3 h-3" />
                              </Button>
                            </div>
                          ) : (
                            <>
                              <div className="font-bold text-lg mb-2">{property.name}</div>
                              <div className="space-y-1 text-sm">
                                <div>Price: <span className="font-bold text-primary">${property.price}</span></div>
                                <div>Rent: <span className="font-bold text-secondary">${property.rent}</span></div>
                                {property.description && (
                                  <div className="text-muted-foreground">{property.description}</div>
                                )}
                              </div>
                              <Separator className="my-3" />
                              <div className="flex gap-2">
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => setEditingProperty(property.id)}
                                >
                                  <Edit className="w-3 h-3" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="destructive"
                                  onClick={() => deleteProperty(property.id)}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Board Tab */}
          <TabsContent value="board" className="space-y-6">
            <Card variant="property">
              <CardHeader>
                <CardTitle>Board Configuration</CardTitle>
                <CardDescription>
                  Customize the game board layout and spaces
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4">
                  <Button onClick={generateDefaultBoard} variant="secondary">
                    Generate Default Board
                  </Button>
                  <Button onClick={() => onSaveBoardSpaces(localBoardSpaces)} variant="default">
                    <Save className="w-4 h-4" />
                    Save Board Layout
                  </Button>
                </div>
                
                <div className="text-sm text-muted-foreground">
                  Board Spaces: {localBoardSpaces.length} / 40
                </div>
                
                {/* Board preview */}
                <div className="grid grid-cols-8 gap-2 max-w-4xl">
                  {localBoardSpaces.slice(0, 32).map((space, index) => {
                    const colorInfo = space.color ? propertyColors.find(c => c.value === space.color) : null;
                    
                    return (
                      <Card key={space.id} className="p-2 text-xs">
                        {colorInfo && (
                          <div className={`h-1 ${colorInfo.color} rounded mb-1`} />
                        )}
                        <div className="font-medium">{space.name}</div>
                        {space.price && (
                          <div className="text-primary">${space.price}</div>
                        )}
                        <Badge variant="outline" className="text-xs">
                          {space.type}
                        </Badge>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default GameSettings;