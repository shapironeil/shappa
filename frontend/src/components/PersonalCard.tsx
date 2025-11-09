import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { User, Plus, Weight, Ruler, Target, Dumbbell, Zap, TrendingDown, Activity, Sparkles, Heart } from "lucide-react";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Progress } from "./ui/progress";
import { toast } from "sonner@2.0.3";

interface GoalOption {
  id: string;
  title: string;
  description: string;
  icon: typeof Dumbbell;
  color: string;
}

interface QuizQuestion {
  id: string;
  question: string;
  type: 'text' | 'number' | 'select';
  options?: { value: string; label: string }[];
  placeholder?: string;
  unit?: string;
}

export function PersonalCard() {
  const [goalOpen, setGoalOpen] = useState(false);
  const [quizOpen, setQuizOpen] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState("");
  
  const [userData, setUserData] = useState({
    name: "",
    age: "",
    weight: "",
    height: "",
    sport: "",
    goal: "muscle",
    level: "intermediate",
    frequency: "",
    duration: ""
  });

  // Carica dati da localStorage al mount
  useEffect(() => {
    const saved = localStorage.getItem('userData');
    if (saved) {
      setUserData(JSON.parse(saved));
    }
  }, []);

  const quizQuestions: QuizQuestion[] = [
    {
      id: "name",
      question: "Come ti chiami?",
      type: "text",
      placeholder: "Il tuo nome"
    },
    {
      id: "age",
      question: "Quanti anni hai?",
      type: "number",
      placeholder: "La tua età"
    },
    {
      id: "weight",
      question: "Qual è il tuo peso?",
      type: "number",
      placeholder: "Il tuo peso",
      unit: "kg"
    },
    {
      id: "height",
      question: "Qual è la tua altezza?",
      type: "number",
      placeholder: "La tua altezza",
      unit: "cm"
    },
    {
      id: "sport",
      question: "Che tipo di attività fisica pratichi?",
      type: "select",
      options: [
        { value: "palestra", label: "Palestra / Fitness" },
        { value: "corsa", label: "Corsa / Running" },
        { value: "ciclismo", label: "Ciclismo" },
        { value: "nuoto", label: "Nuoto" },
        { value: "calcio", label: "Calcio" },
        { value: "basket", label: "Basket" },
        { value: "tennis", label: "Tennis" },
        { value: "altro", label: "Altro" }
      ]
    },
    {
      id: "level",
      question: "Qual è il tuo livello di esperienza?",
      type: "select",
      options: [
        { value: "beginner", label: "Principiante - Appena iniziato" },
        { value: "intermediate", label: "Intermedio - Mi alleno da qualche mese" },
        { value: "advanced", label: "Avanzato - Mi alleno regolarmente da anni" }
      ]
    },
    {
      id: "frequency",
      question: "Quante volte a settimana ti alleni?",
      type: "select",
      options: [
        { value: "1-2", label: "1-2 volte a settimana" },
        { value: "3-4", label: "3-4 volte a settimana" },
        { value: "5+", label: "5 o più volte a settimana" }
      ]
    },
    {
      id: "duration",
      question: "Quanto dura mediamente ogni tua sessione?",
      type: "select",
      options: [
        { value: "20-30", label: "20-30 minuti" },
        { value: "30-45", label: "30-45 minuti" },
        { value: "45-60", label: "45-60 minuti" },
        { value: "60+", label: "Più di 60 minuti" }
      ]
    }
  ];

  const goalOptions: GoalOption[] = [
    {
      id: "strength",
      title: "Forza",
      description: "Carichi elevati, sistema nervoso, coordinazione",
      icon: Sparkles,
      color: "bg-orange-600"
    },
    {
      id: "muscle",
      title: "Massa Muscolare",
      description: "Ipertrofia, volume, spessore muscolare",
      icon: Dumbbell,
      color: "bg-blue-600"
    },
    {
      id: "shape",
      title: "Volume e Shape",
      description: "Forma muscolare, angolazioni, simmetria",
      icon: Target,
      color: "bg-purple-600"
    },
    {
      id: "pump",
      title: "Dettagli Estetici",
      description: "Pompaggio, vascolarizzazione, qualità",
      icon: Zap,
      color: "bg-pink-600"
    },
    {
      id: "endurance",
      title: "Resistenza",
      description: "Cardio, condizionamento, energia",
      icon: Activity,
      color: "bg-green-500"
    },
    {
      id: "wellness",
      title: "Benessere",
      description: "Equilibrio, salute, mantenimento",
      icon: Heart,
      color: "bg-teal-500"
    }
  ];

  const handleGoalSelect = (goalId: string) => {
    const newUserData = { ...userData, goal: goalId };
    setUserData(newUserData);
    localStorage.setItem('userData', JSON.stringify(newUserData));
    setGoalOpen(false);
    toast.success("Obiettivo aggiornato!");
  };

  const handleQuizNext = () => {
    const currentQ = quizQuestions[currentQuestion];
    
    if (!currentAnswer.trim()) {
      toast.error("Per favore, rispondi alla domanda");
      return;
    }

    const newUserData = { ...userData, [currentQ.id]: currentAnswer };
    setUserData(newUserData);

    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setCurrentAnswer("");
    } else {
      // Quiz completato - salva tutto
      localStorage.setItem('userData', JSON.stringify(newUserData));
      toast.success("Profilo completato con successo!");
      setQuizOpen(false);
      setCurrentQuestion(0);
      setCurrentAnswer("");
    }
  };

  const startQuiz = () => {
    setCurrentQuestion(0);
    setCurrentAnswer("");
    setQuizOpen(true);
  };

  const currentGoal = goalOptions.find(g => g.id === userData.goal);
  const progressPercentage = ((currentQuestion + 1) / quizQuestions.length) * 100;
  const currentQ = quizQuestions[currentQuestion];

  // Mappa sport
  const sportLabels: Record<string, string> = {
    "palestra": "Palestra",
    "corsa": "Corsa",
    "ciclismo": "Ciclismo",
    "nuoto": "Nuoto",
    "calcio": "Calcio",
    "basket": "Basket",
    "tennis": "Tennis",
    "yoga": "Yoga/Pilates",
    "crossfit": "CrossFit",
    "arti-marziali": "Arti Marziali",
    "danza": "Danza",
    "altro": "Altro"
  };

  return (
    <>
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <User className="text-blue-500" size={24} />
            <h2>Scheda Personale</h2>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={startQuiz}
            className="w-8 h-8 p-0 rounded-full"
          >
            <Plus size={18} />
          </Button>
        </div>
        
        {userData.name ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-sm text-gray-600">Nome</span>
              <span>{userData.name}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-sm text-gray-600">Età</span>
              <span>{userData.age} anni</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                <Weight size={18} className="text-gray-600" />
                <div>
                  <div className="text-xs text-gray-500">Peso</div>
                  <div>{userData.weight} kg</div>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                <Ruler size={18} className="text-gray-600" />
                <div>
                  <div className="text-xs text-gray-500">Altezza</div>
                  <div>{userData.height} cm</div>
                </div>
              </div>
            </div>
            {userData.sport && (
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-sm text-gray-600">Sport</span>
                <span>{sportLabels[userData.sport] || userData.sport}</span>
              </div>
            )}
            <div 
              className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200 cursor-pointer hover:bg-blue-100 transition-colors"
              onClick={() => setGoalOpen(true)}
            >
              <Target size={18} className="text-blue-600" />
              <div className="flex-1">
                <div className="text-xs text-blue-600">Obiettivo</div>
                <div className="text-blue-700">{currentGoal?.title}</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">Completa il tuo profilo per iniziare</p>
            <Button onClick={startQuiz}>Inizia Quiz</Button>
          </div>
        )}
      </Card>

      {/* Quiz Dialog */}
      <Dialog open={quizOpen} onOpenChange={setQuizOpen}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-center">Completa il tuo profilo</DialogTitle>
            <DialogDescription className="text-center text-gray-500 text-sm">
              Aiutaci a creare il programma perfetto per te
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            {/* Progress bar minimal */}
            <div className="mb-5">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-gray-500">
                  Domanda {currentQuestion + 1} di {quizQuestions.length}
                </span>
                <span className="text-xs text-gray-500">
                  {Math.round(progressPercentage)}%
                </span>
              </div>
              <Progress value={progressPercentage} className="h-1.5" />
            </div>

            {/* Domanda minimal */}
            <div className="mb-4">
              <h3 className="text-center mb-5 text-gray-900 text-base">
                {currentQ.question}
              </h3>
              
              <div className="max-w-2xl mx-auto">
                {currentQ.type === 'text' && (
                  <div className="mb-4">
                    <Input
                      value={currentAnswer}
                      onChange={(e) => setCurrentAnswer(e.target.value)}
                      placeholder={currentQ.placeholder}
                      className="h-10 text-center"
                      onKeyPress={(e) => e.key === 'Enter' && handleQuizNext()}
                      autoFocus
                    />
                  </div>
                )}
                {currentQ.type === 'number' && (
                  <div className="flex gap-3 items-center mb-4 justify-center">
                    <Input
                      type="number"
                      value={currentAnswer}
                      onChange={(e) => setCurrentAnswer(e.target.value)}
                      placeholder={currentQ.placeholder}
                      className="w-28 h-10 text-center"
                      onKeyPress={(e) => e.key === 'Enter' && handleQuizNext()}
                      autoFocus
                    />
                    {currentQ.unit && (
                      <span className="text-sm text-gray-600">{currentQ.unit}</span>
                    )}
                  </div>
                )}
                {currentQ.type === 'select' && currentQ.options && (
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {currentQ.options.map((option, index) => {
                      const isSelected = currentAnswer === option.value;
                      const colors = [
                        { bg: 'bg-blue-500', border: 'border-blue-500', light: 'bg-blue-50', text: 'text-blue-700' },
                        { bg: 'bg-purple-500', border: 'border-purple-500', light: 'bg-purple-50', text: 'text-purple-700' },
                        { bg: 'bg-green-500', border: 'border-green-500', light: 'bg-green-50', text: 'text-green-700' },
                        { bg: 'bg-orange-500', border: 'border-orange-500', light: 'bg-orange-50', text: 'text-orange-700' },
                        { bg: 'bg-pink-500', border: 'border-pink-500', light: 'bg-pink-50', text: 'text-pink-700' },
                        { bg: 'bg-teal-500', border: 'border-teal-500', light: 'bg-teal-50', text: 'text-teal-700' },
                        { bg: 'bg-red-500', border: 'border-red-500', light: 'bg-red-50', text: 'text-red-700' },
                        { bg: 'bg-indigo-500', border: 'border-indigo-500', light: 'bg-indigo-50', text: 'text-indigo-700' },
                        { bg: 'bg-cyan-500', border: 'border-cyan-500', light: 'bg-cyan-50', text: 'text-cyan-700' },
                        { bg: 'bg-emerald-500', border: 'border-emerald-500', light: 'bg-emerald-50', text: 'text-emerald-700' },
                      ];
                      const colorSet = colors[index % colors.length];
                      
                      return (
                        <button
                          key={option.value}
                          onClick={() => setCurrentAnswer(option.value)}
                          className={`relative p-3 rounded-lg border-2 transition-all text-left hover:scale-102 hover:shadow-sm ${
                            isSelected 
                              ? `${colorSet.border} ${colorSet.light} shadow-sm` 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0 ${
                              isSelected ? colorSet.bg : 'bg-gray-100'
                            }`}>
                              <span className={`text-xs ${isSelected ? 'text-white' : 'text-gray-600'}`}>
                                {String.fromCharCode(65 + index)}
                              </span>
                            </div>
                            <span className={`text-xs ${isSelected ? colorSet.text : 'text-gray-700'}`}>
                              {option.label}
                            </span>
                          </div>
                          {isSelected && (
                            <div className="absolute top-1.5 right-1.5">
                              <div className={`w-5 h-5 ${colorSet.bg} rounded-full flex items-center justify-center`}>
                                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              </div>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
                
                <Button 
                  onClick={handleQuizNext}
                  className="w-full h-10"
                  disabled={!currentAnswer.trim()}
                >
                  {currentQuestion < quizQuestions.length - 1 ? 'Continua' : 'Completa'}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Goal Selection Dialog */}
      <Dialog open={goalOpen} onOpenChange={setGoalOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>🎯 Seleziona un Obiettivo</DialogTitle>
            <DialogDescription>
              Ottieni il tuo programma personalizzato basato su periodizzazione professionale
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            {goalOptions.map((goal) => {
              const Icon = goal.icon;
              const isSelected = userData.goal === goal.id;
              return (
                <div
                  key={goal.id}
                  onClick={() => handleGoalSelect(goal.id)}
                  className={`p-5 rounded-xl border-2 cursor-pointer transition-all hover:shadow-lg hover:scale-102 ${
                    isSelected 
                      ? 'border-blue-500 bg-blue-50 shadow-md' 
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`${goal.color} w-14 h-14 rounded-lg flex items-center justify-center flex-shrink-0`}>
                      <Icon className="text-white" size={26} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="mb-1.5">{goal.title}</h3>
                      <p className="text-xs text-gray-600 leading-relaxed">{goal.description}</p>
                    </div>
                  </div>
                  {isSelected && (
                    <div className="mt-3 pt-3 border-t border-blue-200">
                      <p className="text-xs text-blue-700 flex items-center gap-1">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Obiettivo selezionato
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
