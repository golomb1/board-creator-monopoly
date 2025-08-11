import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Plus, Trash2, Edit, Save, Home, Building, Check, Loader2, Upload, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";

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
  type: 'property' | 'action' | 'corner';
  color?: string;
  price?: number;
  rent?: number;
  actionEffect?: 'go-to-jail' | 'skip-turn' | 'extra-turn'; // For action spaces
  svgXml?: string; // Optional inline SVG XML for board rendering
}

interface GameSettingsProps {
  onBack: () => void;
  properties: PropertyCard[];
  boardSpaces: BoardSpace[];
  onSaveProperties: (properties: PropertyCard[]) => void;
  onSaveBoardSpaces: (spaces: BoardSpace[]) => void;
  gameTitle: string;
  onSaveGameTitle: (title: string) => void;
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

const GameSettings = ({ onBack, properties, boardSpaces, onSaveProperties, onSaveBoardSpaces, gameTitle, onSaveGameTitle }: GameSettingsProps) => {
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
  const [editingSpace, setEditingSpace] = useState<string | null>(null);
  const [newSpace, setNewSpace] = useState<Partial<BoardSpace>>({
    name: '',
    type: 'property',
    color: 'brown',
    price: 100,
    rent: 10
  });
  const [editingPropertyDraft, setEditingPropertyDraft] = useState<Partial<PropertyCard> | null>(null);
  const [editingSpaceDraft, setEditingSpaceDraft] = useState<Partial<BoardSpace> | null>(null);
  const [localTitle, setLocalTitle] = useState<string>(gameTitle);
  const [isPropertiesDirty, setIsPropertiesDirty] = useState(false);
  const [isBoardDirty, setIsBoardDirty] = useState(false);
  const [isTitleDirty, setIsTitleDirty] = useState(false);
  const [isSavingProperties, setIsSavingProperties] = useState(false);
  const [isSavingBoard, setIsSavingBoard] = useState(false);
  const [isSavingTitle, setIsSavingTitle] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { toast } = useToast();

  // Auto-dirty tracking
  useEffect(() => {
    setIsBoardDirty(JSON.stringify(localBoardSpaces) !== JSON.stringify(boardSpaces));
  }, [localBoardSpaces, boardSpaces]);

  useEffect(() => {
    setIsPropertiesDirty(JSON.stringify(localProperties) !== JSON.stringify(properties));
  }, [localProperties, properties]);

  useEffect(() => {
    setIsTitleDirty(localTitle.trim() !== gameTitle);
  }, [localTitle, gameTitle]);

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
  };

  const addSpace = () => {
    if (newSpace.name) {
      const space: BoardSpace = {
        id: Date.now().toString(),
        name: newSpace.name!,
        type: newSpace.type!,
        ...(newSpace.type === 'property' && {
          color: newSpace.color,
          price: newSpace.price,
          rent: newSpace.rent
        }),
        ...(newSpace.type === 'action' && {
          actionEffect: newSpace.actionEffect
        })
      };
      setLocalBoardSpaces([...localBoardSpaces, space]);
      setNewSpace({ name: '', type: 'property', color: 'brown', price: 100, rent: 10 });
    }
  };

  const deleteSpace = (id: string) => {
    setLocalBoardSpaces(localBoardSpaces.filter(s => s.id !== id));
  };

  const updateSpace = (id: string, updates: Partial<BoardSpace>) => {
    setLocalBoardSpaces(localBoardSpaces.map(s => 
      s.id === id ? { ...s, ...updates } : s
    ));
  };

  const generateDefaultBoard = () => {
    const defaultSpaces: BoardSpace[] = [
      // Bottom row
      { id: '0', name: 'GO', type: 'corner' },
      { id: '1', name: 'Mediterranean Ave', type: 'property', color: 'brown', price: 60, rent: 2 },
      { id: '2', name: 'Skip Turn Action', type: 'action', actionEffect: 'skip-turn' },
      { id: '3', name: 'Baltic Ave', type: 'property', color: 'brown', price: 60, rent: 4 },
      { id: '4', name: 'Go to Jail Action', type: 'action', actionEffect: 'go-to-jail' },
      { id: '5', name: 'Reading Railroad', type: 'property', price: 200, rent: 25 },
      { id: '6', name: 'Oriental Ave', type: 'property', color: 'light-blue', price: 100, rent: 6 },
      { id: '7', name: 'Extra Turn Action', type: 'action', actionEffect: 'extra-turn' },
      { id: '8', name: 'Vermont Ave', type: 'property', color: 'light-blue', price: 100, rent: 6 },
      { id: '9', name: 'Connecticut Ave', type: 'property', color: 'light-blue', price: 120, rent: 8 },
      { id: '10', name: 'Jail', type: 'corner' },
      
      // Right side (continuing around)
      { id: '11', name: 'St. Charles Place', type: 'property', color: 'pink', price: 140, rent: 10 },
      { id: '12', name: 'Skip Turn Action', type: 'action', actionEffect: 'skip-turn' },
      { id: '13', name: 'States Ave', type: 'property', color: 'pink', price: 140, rent: 10 },
      { id: '14', name: 'Virginia Ave', type: 'property', color: 'pink', price: 160, rent: 12 },
      { id: '15', name: 'Pennsylvania Railroad', type: 'property', price: 200, rent: 25 },
      { id: '16', name: 'St. James Place', type: 'property', color: 'orange', price: 180, rent: 14 },
      { id: '17', name: 'Go to Jail Action', type: 'action', actionEffect: 'go-to-jail' },
      { id: '18', name: 'Tennessee Ave', type: 'property', color: 'orange', price: 180, rent: 14 },
      { id: '19', name: 'New York Ave', type: 'property', color: 'orange', price: 200, rent: 16 },
      { id: '20', name: 'Free Parking', type: 'corner' },
      
      // Continue for top and left sides...
      { id: '21', name: 'Kentucky Ave', type: 'property', color: 'red', price: 220, rent: 18 },
      { id: '22', name: 'Extra Turn Action', type: 'action', actionEffect: 'extra-turn' },
      { id: '23', name: 'Indiana Ave', type: 'property', color: 'red', price: 220, rent: 18 },
      { id: '24', name: 'Illinois Ave', type: 'property', color: 'red', price: 240, rent: 20 },
      { id: '25', name: 'B&O Railroad', type: 'property', price: 200, rent: 25 },
      { id: '26', name: 'Atlantic Ave', type: 'property', color: 'yellow', price: 260, rent: 22 },
      { id: '27', name: 'Ventnor Ave', type: 'property', color: 'yellow', price: 260, rent: 22 },
      { id: '28', name: 'Skip Turn Action', type: 'action', actionEffect: 'skip-turn' },
      { id: '29', name: 'Marvin Gardens', type: 'property', color: 'yellow', price: 280, rent: 24 },
      { id: '30', name: 'Go to Jail', type: 'corner' },
      
      { id: '31', name: 'Pacific Ave', type: 'property', color: 'green', price: 300, rent: 26 },
      { id: '32', name: 'North Carolina Ave', type: 'property', color: 'green', price: 300, rent: 26 },
      { id: '33', name: 'Go to Jail Action', type: 'action', actionEffect: 'go-to-jail' },
      { id: '34', name: 'Pennsylvania Ave', type: 'property', color: 'green', price: 320, rent: 28 },
      { id: '35', name: 'Short Line', type: 'property', price: 200, rent: 25 },
      { id: '36', name: 'Extra Turn Action', type: 'action', actionEffect: 'extra-turn' },
      { id: '37', name: 'Park Place', type: 'property', color: 'blue', price: 350, rent: 35 },
      { id: '38', name: 'Go to Jail Action', type: 'action', actionEffect: 'go-to-jail' },
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

        {/* General Settings */}
        <Card variant="property" className="mb-6">
          <CardHeader>
            <CardTitle>General</CardTitle>
            <CardDescription>Set game-wide preferences</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="md:col-span-2">
              <Label htmlFor="game-title">Game Title</Label>
              <Input id="game-title" value={localTitle} onChange={(e) => setLocalTitle(e.target.value)} placeholder="Enter game title" />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  setIsSavingTitle(true);
                  onSaveGameTitle(localTitle);
                  setTimeout(() => {
                    setIsSavingTitle(false);
                    toast({ title: "Title Saved", description: `Game title set to ${localTitle}` });
                  }, 600);
                }}
                variant="default"
                disabled={!isTitleDirty || isSavingTitle}
              >
                {isSavingTitle ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Title
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

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
                  <Button 
                    onClick={() => {
                      setIsSavingProperties(true);
                      onSaveProperties(localProperties);
                      setTimeout(() => {
                        setIsSavingProperties(false);
                        toast({ title: "Properties Saved", description: `${localProperties.length} properties saved` });
                      }, 700);
                    }} 
                    variant="default"
                    disabled={!isPropertiesDirty || isSavingProperties}
                  >
                    {isSavingProperties ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Save Properties
                      </>
                    )}
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
                                value={editingPropertyDraft?.name ?? property.name}
                                onChange={(e) => setEditingPropertyDraft({ ...(editingPropertyDraft ?? {}), name: e.target.value })}
                                onBlur={() => {
                                  if (editingPropertyDraft?.name !== undefined) {
                                    updateProperty(property.id, { name: editingPropertyDraft.name as string });
                                  }
                                }}
                                className="font-bold"
                              />
                              <div className="flex gap-2">
                                <Input
                                  type="number"
                                  value={editingPropertyDraft?.price ?? property.price}
                                  onChange={(e) => setEditingPropertyDraft({
                                    ...(editingPropertyDraft ?? {}),
                                    price: parseInt(e.target.value) || 0
                                  })}
                                  onBlur={() => {
                                    if (editingPropertyDraft?.price !== undefined) {
                                      updateProperty(property.id, { price: editingPropertyDraft.price as number });
                                    }
                                  }}
                                  className="text-sm"
                                />
                                <Input
                                  type="number"
                                  value={editingPropertyDraft?.rent ?? property.rent}
                                  onChange={(e) => setEditingPropertyDraft({
                                    ...(editingPropertyDraft ?? {}),
                                    rent: parseInt(e.target.value) || 0
                                  })}
                                  onBlur={() => {
                                    if (editingPropertyDraft?.rent !== undefined) {
                                      updateProperty(property.id, { rent: editingPropertyDraft.rent as number });
                                    }
                                  }}
                                  className="text-sm"
                                />
                              </div>
                              <Button size="sm" onClick={() => { 
                                if (editingPropertyDraft) updateProperty(property.id, editingPropertyDraft); 
                                setEditingProperty(null);
                                setEditingPropertyDraft(null);
                              }}>
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
            {/* Add New Board Space */}
            <Card variant="property">
              <CardHeader>
                <CardTitle>Create New Board Space</CardTitle>
                <CardDescription>
                  Add properties, actions, or corner spaces to your board
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  <div>
                    <Label htmlFor="space-name">Space Name</Label>
                    <Input
                      id="space-name"
                      value={newSpace.name}
                      onChange={(e) => setNewSpace({ ...newSpace, name: e.target.value })}
                      placeholder="Space name"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="space-type">Space Type</Label>
                    <Select
                      value={newSpace.type}
                      onValueChange={(value: 'property' | 'action' | 'corner') => setNewSpace({ ...newSpace, type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="property">Property</SelectItem>
                        <SelectItem value="action">Action</SelectItem>
                        <SelectItem value="corner">Corner</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {newSpace.type === 'property' && (
                    <>
                      <div>
                        <Label htmlFor="space-color">Color Group</Label>
                        <Select
                          value={newSpace.color}
                          onValueChange={(value) => setNewSpace({ ...newSpace, color: value })}
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
                        <Label htmlFor="space-price">Price ($)</Label>
                        <Input
                          id="space-price"
                          type="number"
                          value={newSpace.price}
                          onChange={(e) => setNewSpace({ ...newSpace, price: parseInt(e.target.value) || 0 })}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="space-rent">Rent ($)</Label>
                        <Input
                          id="space-rent"
                          type="number"
                          value={newSpace.rent}
                          onChange={(e) => setNewSpace({ ...newSpace, rent: parseInt(e.target.value) || 0 })}
                        />
                      </div>
                    </>
                  )}
                  
                  {newSpace.type === 'action' && (
                    <div className="col-span-2">
                      <Label htmlFor="action-effect">Action Effect</Label>
                      <Select
                        value={newSpace.actionEffect}
                        onValueChange={(value: 'go-to-jail' | 'skip-turn' | 'extra-turn') => setNewSpace({ ...newSpace, actionEffect: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select action effect" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="go-to-jail">Go to Jail</SelectItem>
                          <SelectItem value="skip-turn">Skip Next Turn</SelectItem>
                          <SelectItem value="extra-turn">Get Extra Turn</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
                
                <Button onClick={addSpace} variant="game">
                  <Plus className="w-4 h-4" />
                  Add Board Space
                </Button>
              </CardContent>
            </Card>

            {/* Board Management */}
            <Card variant="property">
              <CardHeader>
                <CardTitle>Board Layout ({localBoardSpaces.length} spaces)</CardTitle>
                <div className="flex flex-wrap gap-2 items-center">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="application/json"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      try {
                        const text = await file.text();
                        const data = JSON.parse(text);
                        if (!Array.isArray(data)) throw new Error("Invalid JSON");
                        setLocalBoardSpaces(data as BoardSpace[]);
                        toast({ title: "Board Imported", description: `Loaded ${data.length} spaces` });
                      } catch (err) {
                        toast({ title: "Import Failed", description: "Invalid board JSON", variant: "destructive" });
                      } finally {
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }
                    }}
                  />
                  <Button onClick={generateDefaultBoard} variant="secondary">
                    Generate Default Board
                  </Button>
                  <Button
                    onClick={() => {
                      const blob = new Blob([JSON.stringify(localBoardSpaces, null, 2)], { type: 'application/json' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = 'board.json';
                      a.click();
                      URL.revokeObjectURL(url);
                      toast({ title: "Board Exported", description: "Downloaded board.json" });
                    }}
                    variant="outline"
                  >
                    <Download className="w-4 h-4" />
                    Export JSON
                  </Button>
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    variant="outline"
                  >
                    <Upload className="w-4 h-4" />
                    Import JSON
                  </Button>
                  <Button 
                    onClick={() => {
                      setIsSavingBoard(true);
                      onSaveBoardSpaces(localBoardSpaces);
                      setTimeout(() => {
                        setIsSavingBoard(false);
                        toast({ title: "Board Saved", description: `${localBoardSpaces.length} spaces saved` });
                      }, 700);
                    }} 
                    variant="default"
                    disabled={!isBoardDirty || isSavingBoard}
                  >
                    {isSavingBoard ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Save Board Layout
                      </>
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {localBoardSpaces.map(space => {
                    const colorInfo = space.color ? propertyColors.find(c => c.value === space.color) : null;
                    const isEditing = editingSpace === space.id;
                    
                    return (
                      <Card key={space.id} className="border-2 border-border hover:border-primary/40 transition-smooth">
                        <CardContent className="p-4">
                          {colorInfo && (
                            <div className={`h-3 ${colorInfo.color} rounded-t-md -mx-4 -mt-4 mb-3`} />
                          )}
                          
                          {isEditing ? (
                            <div className="space-y-3">
                              <Input
                                value={editingSpaceDraft?.name ?? space.name}
                                onChange={(e) => setEditingSpaceDraft({ ...(editingSpaceDraft ?? space), name: e.target.value })}
                                onBlur={() => {
                                  if (editingSpaceDraft?.name !== undefined) {
                                    updateSpace(space.id, { name: editingSpaceDraft.name as string });
                                  }
                                }}
                                className="font-bold"
                              />
                              <Select
                                value={editingSpaceDraft?.type ?? space.type}
                                onValueChange={(value: 'property' | 'action' | 'corner') => {
                                  setEditingSpaceDraft({ ...(editingSpaceDraft ?? space), type: value });
                                  updateSpace(space.id, { type: value });
                                }}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="property">Property</SelectItem>
                                  <SelectItem value="action">Action</SelectItem>
                                  <SelectItem value="corner">Corner</SelectItem>
                                </SelectContent>
                              </Select>
                              
                              { (editingSpaceDraft?.type ?? space.type) === 'property' && (
                                <div className="flex gap-2">
                                  <Input
                                    type="number"
                                    value={editingSpaceDraft?.price ?? space.price}
                                    onChange={(e) => setEditingSpaceDraft({
                                      ...(editingSpaceDraft ?? space),
                                      price: parseInt(e.target.value) || 0
                                    })}
                                    onBlur={() => {
                                      if (editingSpaceDraft?.price !== undefined) {
                                        updateSpace(space.id, { price: editingSpaceDraft.price as number });
                                      }
                                    }}
                                    placeholder="Price"
                                    className="text-sm"
                                  />
                                  <Input
                                    type="number"
                                    value={editingSpaceDraft?.rent ?? space.rent}
                                    onChange={(e) => setEditingSpaceDraft({
                                      ...(editingSpaceDraft ?? space),
                                      rent: parseInt(e.target.value) || 0
                                    })}
                                    onBlur={() => {
                                      if (editingSpaceDraft?.rent !== undefined) {
                                        updateSpace(space.id, { rent: editingSpaceDraft.rent as number });
                                      }
                                    }}
                                    placeholder="Rent"
                                    className="text-sm"
                                  />
                                </div>
                              )}
                              
                              { (editingSpaceDraft?.type ?? space.type) === 'action' && (
                                <Select
                                  value={editingSpaceDraft?.actionEffect ?? space.actionEffect}
                                  onValueChange={(value: 'go-to-jail' | 'skip-turn' | 'extra-turn') => {
                                    setEditingSpaceDraft({ ...(editingSpaceDraft ?? space), actionEffect: value });
                                    updateSpace(space.id, { actionEffect: value });
                                  }}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="go-to-jail">Go to Jail</SelectItem>
                                    <SelectItem value="skip-turn">Skip Next Turn</SelectItem>
                                    <SelectItem value="extra-turn">Get Extra Turn</SelectItem>
                                  </SelectContent>
                                </Select>
                              )}
                              
                              <div>
                                <Label htmlFor={`svg-${space.id}`}>SVG XML (optional)</Label>
                                <Textarea
                                  id={`svg-${space.id}`}
                                  value={editingSpaceDraft?.svgXml ?? space.svgXml ?? ''}
                                  onChange={(e) => setEditingSpaceDraft({ ...(editingSpaceDraft ?? space), svgXml: e.target.value })}
                                  onBlur={() => {
                                    if (editingSpaceDraft?.svgXml !== undefined) {
                                      updateSpace(space.id, { svgXml: editingSpaceDraft.svgXml as string });
                                    }
                                  }}
                                  placeholder="<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'>...</svg>"
                                  className="text-xs font-mono"
                                  rows={4}
                                />
                                {(editingSpaceDraft?.svgXml ?? space.svgXml) ? (
                                  <div className="h-8 mt-2 overflow-hidden" dangerouslySetInnerHTML={{ __html: (editingSpaceDraft?.svgXml ?? space.svgXml) as string }} />
                                ) : null}
                              </div>
                              <Button size="sm" onClick={() => { 
                                if (editingSpaceDraft) updateSpace(space.id, editingSpaceDraft);
                                setEditingSpace(null);
                                setEditingSpaceDraft(null);
                              }}>
                                <Save className="w-3 h-3" />
                              </Button>
                            </div>
                          ) : (
                            <>
                              <div className="font-bold text-lg mb-2">{space.name}</div>
                              <div className="space-y-1 text-sm">
                                <Badge variant="outline">{space.type}</Badge>
                                {space.type === 'property' && (
                                  <>
                                    <div>Price: <span className="font-bold text-primary">${space.price}</span></div>
                                    <div>Rent: <span className="font-bold text-secondary">${space.rent}</span></div>
                                  </>
                                )}
                                {space.type === 'action' && space.actionEffect && (
                                  <div className="text-muted-foreground">
                                    Effect: {space.actionEffect.replace('-', ' ')}
                                  </div>
                                )}
                              </div>
                              <Separator className="my-3" />
                              <div className="flex gap-2">
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => {
                                    setEditingSpace(space.id);
                                    setEditingSpaceDraft({
                                      name: space.name,
                                      type: space.type,
                                      color: space.color,
                                      price: space.price,
                                      rent: space.rent,
                                      actionEffect: space.actionEffect
                                    });
                                  }}
                                >
                                  <Edit className="w-3 h-3" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="destructive"
                                  onClick={() => deleteSpace(space.id)}
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
        </Tabs>
      </div>
    </div>
  );
};

export default GameSettings;