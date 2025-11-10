export interface FreezingInfo {
  category: string;
  item: string;
  freezable: boolean;
  shelfLife: number; // giorni in frigo
  freezerLife: number; // mesi in freezer
  quality: 'Ottima' | 'Buona' | 'Discreta' | 'Sconsigliato';
  notes: string;
}

export const freezingGuide: FreezingInfo[] = [
  // PROTEINE - Carne
  {
    category: 'proteina',
    item: 'Pollo',
    freezable: true,
    shelfLife: 2,
    freezerLife: 9,
    quality: 'Ottima',
    notes: 'Congelare in porzioni singole. Mantiene qualità perfetta.'
  },
  {
    category: 'proteina',
    item: 'Manzo',
    freezable: true,
    shelfLife: 3,
    freezerLife: 12,
    quality: 'Ottima',
    notes: 'Sottovuoto dura 2-3 anni. Ottima qualità post-scongelamento.'
  },
  {
    category: 'proteina',
    item: 'Macinato',
    freezable: true,
    shelfLife: 1,
    freezerLife: 4,
    quality: 'Buona',
    notes: 'Congelare piatto (scongela più veloce). Max 4 mesi.'
  },
  {
    category: 'proteina',
    item: 'Salmone',
    freezable: true,
    shelfLife: 2,
    freezerLife: 3,
    quality: 'Buona',
    notes: 'Grassi si ossidano. Meglio consumare entro 3 mesi.'
  },
  {
    category: 'proteina',
    item: 'Tonno',
    freezable: true,
    shelfLife: 2,
    freezerLife: 6,
    quality: 'Ottima',
    notes: 'Mantiene qualità meglio del pesce grasso.'
  },
  {
    category: 'proteina',
    item: 'Prosciutto crudo',
    freezable: false,
    shelfLife: 7,
    freezerLife: 0,
    quality: 'Sconsigliato',
    notes: 'Perde texture e diventa molliccio. MAI congelare.'
  },
  {
    category: 'proteina',
    item: 'Prosciutto cotto',
    freezable: true,
    shelfLife: 3,
    freezerLife: 2,
    quality: 'Discreta',
    notes: 'Solo se necessario. Perde texture. Congelare in porzioni.'
  },
  {
    category: 'proteina',
    item: 'Uova',
    freezable: true,
    shelfLife: 35,
    freezerLife: 12,
    quality: 'Buona',
    notes: 'Sbattere prima. Mai congelare con guscio (esplodono).'
  },
  
  // CARBOIDRATI
  {
    category: 'carboidrato',
    item: 'Pane',
    freezable: true,
    shelfLife: 3,
    freezerLife: 6,
    quality: 'Ottima',
    notes: 'Congelare freschissimo. Tostare direttamente da congelato.'
  },
  {
    category: 'carboidrato',
    item: 'Pasta',
    freezable: true,
    shelfLife: 3,
    freezerLife: 2,
    quality: 'Discreta',
    notes: 'Solo se cotta. Scolare al dente. Aggiungere olio.'
  },
  {
    category: 'carboidrato',
    item: 'Riso',
    freezable: true,
    shelfLife: 4,
    freezerLife: 6,
    quality: 'Buona',
    notes: 'Ottimo per meal prep. Riscaldare con vapore.'
  },
  {
    category: 'carboidrato',
    item: 'Patate',
    freezable: false,
    shelfLife: 14,
    freezerLife: 0,
    quality: 'Sconsigliato',
    notes: 'Crude diventano mollicci. Solo patate cotte/fritte OK.'
  },
  
  // LATTICINI
  {
    category: 'latticino',
    item: 'Latte',
    freezable: true,
    shelfLife: 7,
    freezerLife: 3,
    quality: 'Discreta',
    notes: 'Si separa un po\'. Agitare bene dopo. OK per cucinare.'
  },
  {
    category: 'latticino',
    item: 'Yogurt',
    freezable: false,
    shelfLife: 7,
    freezerLife: 0,
    quality: 'Sconsigliato',
    notes: 'Si separa completamente. Solo per smoothie congelati.'
  },
  {
    category: 'latticino',
    item: 'Parmigiano',
    freezable: true,
    shelfLife: 21,
    freezerLife: 6,
    quality: 'Buona',
    notes: 'Grattugiare prima. Perde un po\' di texture.'
  },
  {
    category: 'latticino',
    item: 'Mozzarella',
    freezable: false,
    shelfLife: 7,
    freezerLife: 0,
    quality: 'Sconsigliato',
    notes: 'Diventa gommosa. Solo se per cucinare (pizza).'
  },
  {
    category: 'latticino',
    item: 'Burro',
    freezable: true,
    shelfLife: 30,
    freezerLife: 12,
    quality: 'Ottima',
    notes: 'Perfetto. Mantiene qualità. Sempre utile averlo.'
  },
  
  // VERDURE
  {
    category: 'verdura',
    item: 'Spinaci',
    freezable: true,
    shelfLife: 3,
    freezerLife: 12,
    quality: 'Buona',
    notes: 'Sbollentare 2 min prima. Ottimi per cotture.'
  },
  {
    category: 'verdura',
    item: 'Broccoli',
    freezable: true,
    shelfLife: 5,
    freezerLife: 12,
    quality: 'Buona',
    notes: 'Sbollentare 3 min. Mantiene croccantezza.'
  },
  {
    category: 'verdura',
    item: 'Pomodoro',
    freezable: true,
    shelfLife: 5,
    freezerLife: 8,
    quality: 'Buona',
    notes: 'Solo per sughi. Sbollentare e pelare prima.'
  },
  
  // FRUTTA
  {
    category: 'frutta',
    item: 'Banana',
    freezable: true,
    shelfLife: 2,
    freezerLife: 6,
    quality: 'Ottima',
    notes: 'Perfette per smoothie. Sbucciare prima.'
  },
  {
    category: 'frutta',
    item: 'Mirtilli',
    freezable: true,
    shelfLife: 3,
    freezerLife: 12,
    quality: 'Ottima',
    notes: 'Congelare su teglia singolarmente. Ottima qualità.'
  },
  {
    category: 'frutta',
    item: 'Mela',
    freezable: true,
    shelfLife: 14,
    freezerLife: 12,
    quality: 'Buona',
    notes: 'Sbucciare, tagliare, limone. Solo per cotture.'
  },
  
  // GRASSI
  {
    category: 'grasso',
    item: 'Avocado',
    freezable: true,
    shelfLife: 3,
    freezerLife: 6,
    quality: 'Discreta',
    notes: 'Schiacciare con limone. Solo per guacamole.'
  },
  {
    category: 'grasso',
    item: 'Noci',
    freezable: true,
    shelfLife: 30,
    freezerLife: 12,
    quality: 'Ottima',
    notes: 'Previene irrancidimento. Sempre congelare.'
  },
  {
    category: 'grasso',
    item: 'Mandorle',
    freezable: true,
    shelfLife: 30,
    freezerLife: 12,
    quality: 'Ottima',
    notes: 'Previene irrancidimento. Sempre congelare.'
  }
];

export const getFreezingInfo = (itemName: string): FreezingInfo | undefined => {
  return freezingGuide.find(
    item => item.item.toLowerCase() === itemName.toLowerCase() ||
           itemName.toLowerCase().includes(item.item.toLowerCase())
  );
};

export const shouldFreeze = (itemName: string, daysUntilExpiry: number): {
  shouldFreeze: boolean;
  reason: string;
  urgency: 'high' | 'medium' | 'low';
} => {
  const info = getFreezingInfo(itemName);
  
  if (!info || !info.freezable) {
    return {
      shouldFreeze: false,
      reason: info ? info.notes : 'Non congelare - perde qualità',
      urgency: 'low'
    };
  }
  
  if (daysUntilExpiry <= 1) {
    return {
      shouldFreeze: true,
      reason: `⚠️ Scade domani! ${info.notes}`,
      urgency: 'high'
    };
  }
  
  if (daysUntilExpiry <= 3) {
    return {
      shouldFreeze: true,
      reason: `❄️ Consigliato. Durata freezer: ${info.freezerLife} mesi`,
      urgency: 'medium'
    };
  }
  
  if (daysUntilExpiry <= info.shelfLife / 2) {
    return {
      shouldFreeze: true,
      reason: `Opzionale. Qualità: ${info.quality}`,
      urgency: 'low'
    };
  }
  
  return {
    shouldFreeze: false,
    reason: 'Non necessario per ora',
    urgency: 'low'
  };
};
