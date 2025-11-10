import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { User, Edit3, Check, Info } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface UserProfile {
  bodyType: string;
  allergies: string[];
  excludeFromDiet: string[];
  healthIssues: string[];
  dietaryPreference: string;
}

interface PersonalCardProps {
  userProfile: UserProfile | null;
  onProfileUpdate: (profile: UserProfile) => void;
}

const allergyOptions = [
  'Lattosio',
  'Glutine',
  'Frutta secca',
  'Crostacei',
  'Uova',
  'Soia',
  'Pesce',
  'Arachidi',
  'Sesamo'
];

const excludeOptions = [
  'Carne',
  'Carne rossa',
  'Pesce',
  'Latticini',
  'Frutta',
  'Verdura',
  'Verdure amare',
  'Funghi',
  'Cipolle',
  'Aglio',
  'Formaggi stagionati',
  'Legumi',
  'Spezie piccanti',
  'Zuccheri raffinati',
  'Alcool',
  'Caffeina',
  'Fritti',
  'Carboidrati serali'
];

const healthIssuesOptions = [
  'Diabete',
  'Ipertensione',
  'Colesterolo alto',
  'Problemi digestivi',
  'Reflusso gastrico',
  'Colon irritabile',
  'Intolleranze alimentari'
];

export function PersonalCard({ userProfile, onProfileUpdate }: PersonalCardProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<UserProfile>(
    userProfile || {
      bodyType: 'normale',
      allergies: [],
      excludeFromDiet: [],
      healthIssues: [],
      dietaryPreference: 'onnivoro'
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onProfileUpdate(formData);
    setOpen(false);
    toast.success('Preferenze salvate con successo!');
  };

  const toggleArrayItem = (field: keyof UserProfile, item: string) => {
    setFormData(prev => {
      const currentArray = prev[field] as string[];
      const newArray = currentArray.includes(item)
        ? currentArray.filter(i => i !== item)
        : [...currentArray, item];
      return { ...prev, [field]: newArray };
    });
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3>Preferenze Alimentari</h3>
            <p className="text-sm text-gray-600">
              {userProfile ? 'Configurato' : 'Imposta preferenze'}
            </p>
          </div>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant={userProfile ? 'outline' : 'default'} size="sm">
              {userProfile ? <Edit3 className="w-4 h-4" /> : 'Configura'}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl h-[80vh] flex flex-col overflow-hidden">
            <DialogHeader className="flex-shrink-0">
              <DialogTitle>Preferenze Alimentari</DialogTitle>
              <DialogDescription>
                Configura le tue preferenze per ricevere suggerimenti personalizzati
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto space-y-6 pr-2">
              {/* Info da Sport */}
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-start gap-2">
                  <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-blue-900">
                      I dati fisici (età, peso, altezza, livello attività) vengono recuperati automaticamente dalla sezione Sport.
                    </p>
                  </div>
                </div>
              </div>

              {/* Preferenza Dietetica */}
              <div className="space-y-3">
                <Label>Preferenza Dietetica</Label>
                <Select value={formData.dietaryPreference} onValueChange={(value) => setFormData(prev => ({ ...prev, dietaryPreference: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="onnivoro">Onnivoro</SelectItem>
                    <SelectItem value="vegetariano">Vegetariano</SelectItem>
                    <SelectItem value="vegano">Vegano</SelectItem>
                    <SelectItem value="pescetariano">Pescetariano</SelectItem>
                    <SelectItem value="flexitariano">Flexitariano</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Tipo di Corporatura */}
              <div className="space-y-3">
                <Label>Tipo di Corporatura</Label>
                <Select value={formData.bodyType} onValueChange={(value) => setFormData(prev => ({ ...prev, bodyType: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ectomorfo">Ectomorfo (magro, metabolismo veloce)</SelectItem>
                    <SelectItem value="mesomorfo">Mesomorfo (atletico, muscoloso)</SelectItem>
                    <SelectItem value="endomorfo">Endomorfo (tende ad accumulare grasso)</SelectItem>
                    <SelectItem value="normale">Corporatura normale</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Allergie */}
              <div className="space-y-3">
                <Label>Allergie e Intolleranze</Label>
                <div className="grid grid-cols-2 gap-3">
                  {allergyOptions.map((allergy) => (
                    <div key={allergy} className="flex items-center space-x-2">
                      <Checkbox
                        id={`allergy-${allergy}`}
                        checked={formData.allergies.includes(allergy)}
                        onCheckedChange={() => toggleArrayItem('allergies', allergy)}
                      />
                      <Label htmlFor={`allergy-${allergy}`} className="font-normal cursor-pointer">
                        {allergy}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cibi da Escludere / Non Mi Piacciono */}
              <div className="space-y-3">
                <Label>Cibi da Escludere dalla Dieta</Label>
                <p className="text-xs text-gray-600">Seleziona cibi che non mangi o che preferisci evitare</p>
                <div className="grid grid-cols-2 gap-3">
                  {excludeOptions.map((exclude) => (
                    <div key={exclude} className="flex items-center space-x-2">
                      <Checkbox
                        id={`exclude-${exclude}`}
                        checked={formData.excludeFromDiet.includes(exclude)}
                        onCheckedChange={() => toggleArrayItem('excludeFromDiet', exclude)}
                      />
                      <Label htmlFor={`exclude-${exclude}`} className="font-normal cursor-pointer">
                        {exclude}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Problemi di Salute */}
              <div className="space-y-3">
                <Label>Condizioni di Salute</Label>
                <div className="grid grid-cols-2 gap-3">
                  {healthIssuesOptions.map((issue) => (
                    <div key={issue} className="flex items-center space-x-2">
                      <Checkbox
                        id={`health-${issue}`}
                        checked={formData.healthIssues.includes(issue)}
                        onCheckedChange={() => toggleArrayItem('healthIssues', issue)}
                      />
                      <Label htmlFor={`health-${issue}`} className="font-normal cursor-pointer">
                        {issue}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              </div>

              <div className="flex-shrink-0 flex justify-end gap-2 pt-4 border-t bg-white mt-4">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Annulla
                </Button>
                <Button type="submit">
                  <Check className="w-4 h-4 mr-2" />
                  Salva Preferenze
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {userProfile && (
        <div className="space-y-3 mt-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Dieta:</span>
            <span className="capitalize">{userProfile.dietaryPreference}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Corporatura:</span>
            <span className="capitalize">{userProfile.bodyType}</span>
          </div>
          {userProfile.allergies.length > 0 && (
            <div className="pt-2 border-t">
              <p className="text-xs text-gray-600 mb-1">Allergie:</p>
              <div className="flex flex-wrap gap-1">
                {userProfile.allergies.map((allergy) => (
                  <span key={allergy} className="text-xs px-2 py-1 bg-red-50 text-red-700 rounded-full border border-red-200">
                    {allergy}
                  </span>
                ))}
              </div>
            </div>
          )}
          {userProfile.excludeFromDiet.length > 0 && (
            <div className="pt-2 border-t">
              <p className="text-xs text-gray-600 mb-1">Esclusi:</p>
              <div className="flex flex-wrap gap-1">
                {userProfile.excludeFromDiet.map((item) => (
                  <span key={item} className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full border border-gray-200">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
