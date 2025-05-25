'use client';

import { useState, useRef, useEffect } from 'react';

export default function Home() {
  const canvasRef = useRef(null);
  const [rating, setRating] = useState(0);
  const [message, setMessage] = useState('');
  const [isDrawing, setIsDrawing] = useState(false);
  const [points, setPoints] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [level, setLevel] = useState(1);
  const [streak, setStreak] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [totalScore, setTotalScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [warning, setWarning] = useState('');
  const [penPosition, setPenPosition] = useState({ x: 0, y: 0 });
  const [isPenVisible, setIsPenVisible] = useState(false);
  const [showTutorial, setShowTutorial] = useState(true);
  const [combo, setCombo] = useState(0);
  const [lastScore, setLastScore] = useState(0);
  const [showScoreAnimation, setShowScoreAnimation] = useState(false);
  const [drawingTime, setDrawingTime] = useState(0);
  const [showPerfect, setShowPerfect] = useState(false);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [drawingStartTime, setDrawingStartTime] = useState(0);
  const [showReference, setShowReference] = useState(true);
  const [isGodArtist, setIsGodArtist] = useState(false);
  const [godArtistAttempts, setGodArtistAttempts] = useState(0);

  const funnyMessages = {
    0: "Did you even try? That's not a circle, that's a crime against geometry! 😱",
    20: "Looks like a drunk potato trying to dance! 🥔",
    40: "My grandma draws better circles with her eyes closed! 👵",
    60: "Not terrible, but my cat could do better! 🐱",
    80: "Almost there! Now try drawing it with your good hand! 🎯",
    100: "Holy smokes! Are you a robot? That's too perfect! 🤖"
  };

  const achievementsList = [
    { id: 'perfect', name: 'Perfect Circle', description: 'Draw a circle with 98% or higher rating', unlocked: false },
    { id: 'streak3', name: 'Hot Streak', description: 'Get 3 circles above 80% in a row', unlocked: false },
    { id: 'master', name: 'Circle Master', description: 'Reach level 5', unlocked: false },
    { id: 'consistent', name: 'Consistency is Key', description: 'Draw 5 circles above 60%', unlocked: false },
    { id: 'combo5', name: 'Combo Master', description: 'Get a 5x combo', unlocked: false },
    { id: 'speedster', name: 'Speedster', description: 'Draw a circle in under 3 seconds', unlocked: false },
    { id: 'persistent', name: 'Persistent Artist', description: 'Draw 50 circles', unlocked: false },
    { id: 'godartist', name: 'God Artist', description: 'Draw 3 perfect circles without reference', unlocked: false }
  ];

  const getBackgroundColor = (rating) => {
    if (rating >= 98) return 'bg-gradient-to-br from-green-400 to-green-600 animate-pulse';
    if (rating >= 80) return 'bg-gradient-to-br from-blue-400 to-blue-600';
    if (rating >= 60) return 'bg-gradient-to-br from-yellow-400 to-yellow-600';
    if (rating >= 40) return 'bg-gradient-to-br from-orange-400 to-orange-600';
    return 'bg-gradient-to-br from-red-400 to-red-600';
  };

  const drawGrid = (ctx, width, height) => {
    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw simple grid
    const gridSize = Math.min(width, height) / 6;
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 0.5;

    // Draw vertical lines
    for (let x = 0; x <= width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    // Draw horizontal lines
    for (let y = 0; y <= height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Draw center point and reference circle
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Draw center point
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(centerX, centerY, 3, 0, 2 * Math.PI);
    ctx.fill();

    // Draw reference circle only if showReference is true
    if (showReference) {
      const radius = Math.min(width, height) * 0.35;
      ctx.strokeStyle = '#60a5fa';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([8, 4]);
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  };

  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches?.[0] || e.changedTouches?.[0] || e;
    
    // Calculate coordinates relative to canvas
    const x = (touch.clientX - rect.left) * (canvas.width / rect.width);
    const y = (touch.clientY - rect.top) * (canvas.height / rect.height);
    
    return { x, y };
  };

  const startDrawing = (e) => {
    e.preventDefault();
    const { x, y } = getCoordinates(e);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGrid(ctx, canvas.width, canvas.height);
    
    setRating(0);
    setMessage('');
    setPoints([]);
    setIsDrawing(true);
    setIsPenVisible(true);
    setPenPosition({ x, y });
    setDrawingStartTime(Date.now());
    
    ctx.beginPath();
    ctx.moveTo(x, y);
    setPoints([{ x, y }]);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    e.preventDefault();

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const { x, y } = getCoordinates(e);

    // Update pen position
    setPenPosition({ x, y });
    setIsPenVisible(true);

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#000000';

    // Add smooth line drawing
    if (points.length > 1) {
      const prevPoint = points[points.length - 1];
      const midPoint = {
        x: (prevPoint.x + x) / 2,
        y: (prevPoint.y + y) / 2
      };

      ctx.beginPath();
      ctx.moveTo(prevPoint.x, prevPoint.y);
      ctx.quadraticCurveTo(prevPoint.x, prevPoint.y, midPoint.x, midPoint.y);
      ctx.stroke();
    }

    ctx.lineTo(x, y);
    ctx.stroke();
    setPoints(prev => [...prev, { x, y }]);
  };

  const stopDrawing = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    setIsDrawing(false);
    setIsPenVisible(false);
    setDrawingTime((Date.now() - drawingStartTime) / 1000);
    evaluateCircle();
  };

  const evaluateCircle = () => {
    if (points.length < 20) {
      setRating(0);
      setMessage(funnyMessages[0]);
      setWarning('Please draw a more complete shape');
      setCombo(0);
      return;
    }

    try {
      const center = {
        x: points.reduce((sum, p) => sum + p.x, 0) / points.length,
        y: points.reduce((sum, p) => sum + p.y, 0) / points.length
      };

      const radii = points.map(p => 
        Math.sqrt(Math.pow(p.x - center.x, 2) + Math.pow(p.y - center.y, 2))
      );

      const avgRadius = radii.reduce((sum, r) => sum + r, 0) / radii.length;
      const stdDev = Math.sqrt(
        radii.reduce((sum, r) => sum + Math.pow(r - avgRadius, 2), 0) / radii.length
      );

      // More forgiving circularity score
      const circularityScore = Math.max(0, Math.min(100, 
        100 - (stdDev / avgRadius) * 100 // Reduced penalty for small deviations
      ));

      const firstPoint = points[0];
      const lastPoint = points[points.length - 1];
      const closureDistance = Math.sqrt(
        Math.pow(lastPoint.x - firstPoint.x, 2) + 
        Math.pow(lastPoint.y - firstPoint.y, 2)
      );
      
      // More forgiving closure score
      const closureScore = Math.max(0, Math.min(100,
        100 - (closureDistance / avgRadius) * 50 // Reduced penalty for closure
      ));

      const canvas = canvasRef.current;
      const idealRadius = Math.min(canvas.width, canvas.height) * 0.35;
      
      // More forgiving size score
      const sizeScore = Math.max(0, Math.min(100,
        100 - (Math.abs(avgRadius - idealRadius) / idealRadius) * 100 // Reduced penalty for size
      ));

      // Calculate smoothness score with more tolerance
      const angles = [];
      for (let i = 1; i < points.length - 1; i++) {
        const prev = points[i - 1];
        const curr = points[i];
        const next = points[i + 1];
        
        const angle = Math.atan2(
          next.y - curr.y,
          next.x - curr.x
        ) - Math.atan2(
          curr.y - prev.y,
          curr.x - prev.x
        );
        
        angles.push(Math.abs(angle));
      }
      
      const avgAngle = angles.reduce((sum, a) => sum + a, 0) / angles.length;
      const smoothnessScore = Math.max(0, Math.min(100,
        100 - (avgAngle / Math.PI) * 75 // Reduced penalty for smoothness
      ));

      // Adjusted weights for better scoring
      const finalScore = Math.round(
        circularityScore * 0.4 +     // Increased weight for circularity
        closureScore * 0.2 +         // Reduced weight for closure
        sizeScore * 0.25 +           // Slightly reduced weight for size
        smoothnessScore * 0.15       // Kept smoothness weight the same
      );

      // Bonus points for very good circles
      let bonusScore = 0;
      if (circularityScore > 90 && closureScore > 90) {
        bonusScore = 5; // Add bonus points for very good circles
      }

      const totalScore = Math.min(100, finalScore + bonusScore);
      
      // Set the score difference before updating the rating
      const scoreDiff = totalScore - rating;
      setLastScore(scoreDiff);
      setShowScoreAnimation(true);
      
      // Update the rating after a short delay
      setTimeout(() => {
        setRating(totalScore);
        setTimeout(() => setShowScoreAnimation(false), 1000);
      }, 100);

      // Combo system with improved feedback
      if (totalScore >= 60) {
        const newCombo = combo + 1;
        setCombo(newCombo);
        if (newCombo >= 5 && !achievements.find(a => a.id === 'combo5')) {
          checkAchievements(totalScore, true);
        }
      } else {
        setCombo(0);
      }

      // Speed achievement check
      if (drawingTime < 3 && totalScore >= 80 && !achievements.find(a => a.id === 'speedster')) {
        checkAchievements(totalScore, false, true);
      }

      // Perfect circle celebration
      if (totalScore >= 98) {
        setShowPerfect(true);
        setTimeout(() => setShowPerfect(false), 2000);
      }

      // Level up animation
      const newLevel = Math.floor((totalScore + totalScore) / 1000) + 1;
      if (newLevel > level) {
        setShowLevelUp(true);
        setTimeout(() => setShowLevelUp(false), 2000);
      }

      if (totalScore > bestScore) {
        setBestScore(totalScore);
        localStorage.setItem('bestScore', totalScore.toString());
      }

      // God Artist achievement check
      if (!showReference && totalScore >= 98) {
        const newAttempts = godArtistAttempts + 1;
        setGodArtistAttempts(newAttempts);
        if (newAttempts >= 3 && !isGodArtist) {
          setIsGodArtist(true);
          checkAchievements(totalScore, false, false, true);
        }
      } else if (!showReference && totalScore < 98) {
        setGodArtistAttempts(0);
      }

      setWarning('');
      checkAchievements(totalScore);
      setAttempts(prev => prev + 1);

    } catch (error) {
      console.error('Error evaluating circle:', error);
      setRating(0);
      setMessage(funnyMessages[0]);
      setWarning('Please try drawing again');
      setCombo(0);
    }
  };

  const checkAchievements = (score, isCombo = false, isSpeed = false, isGodArtist = false) => {
    const newAchievements = [...achievements];
    let hasNewAchievement = false;

    if (score >= 98 && !achievements.find(a => a.id === 'perfect')) {
      newAchievements.push({ ...achievementsList.find(a => a.id === 'perfect'), unlocked: true });
      hasNewAchievement = true;
    }

    if (score >= 80) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      if (newStreak >= 3 && !achievements.find(a => a.id === 'streak3')) {
        newAchievements.push({ ...achievementsList.find(a => a.id === 'streak3'), unlocked: true });
        hasNewAchievement = true;
      }
    } else {
      setStreak(0);
    }

    const newTotalScore = totalScore + score;
    setTotalScore(newTotalScore);
    const newLevel = Math.floor(newTotalScore / 1000) + 1;
    setLevel(newLevel);
    localStorage.setItem('totalScore', newTotalScore.toString());

    if (newLevel >= 5 && !achievements.find(a => a.id === 'master')) {
      newAchievements.push({ ...achievementsList.find(a => a.id === 'master'), unlocked: true });
      hasNewAchievement = true;
    }

    if (isCombo && !achievements.find(a => a.id === 'combo5')) {
      newAchievements.push({ ...achievementsList.find(a => a.id === 'combo5'), unlocked: true });
      hasNewAchievement = true;
    }

    if (isSpeed && !achievements.find(a => a.id === 'speedster')) {
      newAchievements.push({ ...achievementsList.find(a => a.id === 'speedster'), unlocked: true });
      hasNewAchievement = true;
    }

    if (isGodArtist && !achievements.find(a => a.id === 'godartist')) {
      newAchievements.push({ ...achievementsList.find(a => a.id === 'godartist'), unlocked: true });
      hasNewAchievement = true;
    }

    if (hasNewAchievement) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }

    setAchievements(newAchievements);
    localStorage.setItem('achievements', JSON.stringify(newAchievements));
  };

  const initializeCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas size
    const isMobile = window.innerWidth <= 768;
    const size = isMobile ? Math.min(window.innerWidth, window.innerHeight - 120) : 600;
    
    // Set canvas dimensions
    canvas.width = size;
    canvas.height = size;
    
    // Set display size
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;

    // Initialize drawing context
    const ctx = canvas.getContext('2d');
    drawGrid(ctx, size, size);
  };

  useEffect(() => {
    initializeCanvas();
    window.addEventListener('resize', initializeCanvas);
    return () => window.removeEventListener('resize', initializeCanvas);
  }, []);

  return (
    <main className="min-h-screen flex flex-col items-center justify-start p-0 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="w-full max-w-[600px] mx-auto px-4 py-4">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden border border-gray-200/50 dark:border-gray-700/50">
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-xl font-bold text-gray-800 dark:text-white relative">
                <span className="relative z-10">
                  {isGodArtist ? (
                    <span className="bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
                      God Artist Mode ✨
                    </span>
                  ) : (
                    "Circle Drawing Challenge"
                  )}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 dark:from-blue-500/20 dark:to-purple-500/20 rounded-lg blur-sm"></div>
              </h1>
              <button
                onClick={() => {
                  setShowReference(!showReference);
                  if (!showReference) {
                    setGodArtistAttempts(0);
                  }
                }}
                className="px-3 py-1 text-xs font-medium rounded-full transition-all duration-300"
                style={{
                  background: showReference 
                    ? 'linear-gradient(to right, #3b82f6, #8b5cf6)'
                    : 'linear-gradient(to right, #f59e0b, #ef4444)',
                  color: 'white'
                }}
              >
                {showReference ? 'Hide Guide' : 'Show Guide'}
              </button>
            </div>
            
            {showTutorial && (
              <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-800 animate-fade-in">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  🎯 Draw the perfect circle! Follow the blue guide circle and try to match it as closely as possible.
                  <button 
                    onClick={() => setShowTutorial(false)}
                    className="ml-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                  >
                    Got it!
                  </button>
                </p>
              </div>
            )}

            <div className="flex justify-center items-center mb-4">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 dark:from-blue-500/30 dark:to-purple-500/30 rounded-lg blur-md group-hover:blur-lg transition-all duration-300"></div>
                <canvas
                  ref={canvasRef}
                  className="relative w-full max-w-[500px] aspect-square bg-white dark:bg-gray-700 rounded-lg border-2 border-gray-200 dark:border-gray-600 touch-none shadow-sm hover:shadow-xl transition-all duration-300"
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                />
                {isPenVisible && (
                  <div 
                    className="absolute w-6 h-6 pointer-events-none transition-transform duration-100 ease-out"
                    style={{
                      left: `${penPosition.x}px`,
                      top: `${penPosition.y}px`,
                      transform: 'translate(-50%, -50%)'
                    }}
                  >
                    <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-sm animate-pulse"></div>
                    <div className="absolute inset-0 border-2 border-blue-500 rounded-full"></div>
                    <div className="absolute inset-1 bg-blue-500/30 rounded-full"></div>
                  </div>
                )}
                {combo > 1 && (
                  <div className="absolute top-2 right-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-1 rounded-full text-xs font-bold animate-bounce">
                    {combo}x Combo!
                  </div>
                )}
                {showPerfect && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-4xl font-bold text-green-500 animate-bounce">
                      Perfect! ✨
                    </div>
                  </div>
                )}
                {showLevelUp && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-3xl font-bold text-blue-500 animate-bounce">
                      Level Up! 🎉
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex flex-row gap-2">
                <div className="flex-1 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-2 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 border border-gray-200/50 dark:border-gray-700/50">
                  <div className={`text-xl font-bold ${getBackgroundColor(rating)} text-white rounded-lg p-1 text-center transition-all duration-300 relative`}>
                    {rating}%
                    {showScoreAnimation && (
                      <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-green-500 font-bold animate-bounce">
                        {lastScore > 0 ? '+' : ''}{lastScore}
                      </div>
                    )}
                  </div>
                  <p className="mt-1 text-gray-600 dark:text-gray-300 text-center text-xs line-clamp-2">{message}</p>
                </div>

                <div className="flex-1 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-2 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 border border-gray-200/50 dark:border-gray-700/50">
                  <div className="grid grid-cols-2 gap-1">
                    <div className="text-xs group">
                      <span className="text-gray-500 dark:text-gray-400 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors">Lvl:</span>
                      <span className="ml-1 text-gray-800 dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors">{level}</span>
                    </div>
                    <div className="text-xs group">
                      <span className="text-gray-500 dark:text-gray-400 group-hover:text-green-500 dark:group-hover:text-green-400 transition-colors">Best:</span>
                      <span className="ml-1 text-gray-800 dark:text-gray-200 group-hover:text-green-600 dark:group-hover:text-green-300 transition-colors">{bestScore}%</span>
                    </div>
                    <div className="text-xs group">
                      <span className="text-gray-500 dark:text-gray-400 group-hover:text-purple-500 dark:group-hover:text-purple-400 transition-colors">Try:</span>
                      <span className="ml-1 text-gray-800 dark:text-gray-200 group-hover:text-purple-600 dark:group-hover:text-purple-300 transition-colors">{attempts}</span>
                    </div>
                    <div className="text-xs group">
                      <span className="text-gray-500 dark:text-gray-400 group-hover:text-orange-500 dark:group-hover:text-orange-400 transition-colors">Strk:</span>
                      <span className="ml-1 text-gray-800 dark:text-gray-200 group-hover:text-orange-600 dark:group-hover:text-orange-300 transition-colors">{streak}</span>
                    </div>
                  </div>
                </div>
              </div>

              {warning && (
                <div className="p-2 bg-yellow-100/90 dark:bg-yellow-900/90 backdrop-blur-sm text-yellow-800 dark:text-yellow-200 rounded-lg text-center text-xs animate-fade-in border border-yellow-200/50 dark:border-yellow-700/50">
                  {warning}
                </div>
              )}

              {achievements.length > 0 && (
                <div className="grid grid-cols-2 gap-2">
                  {achievements.map((achievement) => (
                    <div
                      key={achievement.id}
                      className="bg-green-100/90 dark:bg-green-900/90 backdrop-blur-sm text-green-800 dark:text-green-200 p-2 rounded-lg hover:shadow-md transition-all duration-300 border border-green-200/50 dark:border-green-700/50 group"
                    >
                      <p className="font-semibold text-xs group-hover:text-green-600 dark:group-hover:text-green-300 transition-colors">{achievement.name}</p>
                      <p className="text-[10px] line-clamp-2 group-hover:text-green-700 dark:group-hover:text-green-400 transition-colors">{achievement.description}</p>
                    </div>
                  ))}
                </div>
              )}

              <div className="text-center mt-4 pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Developed by{' '}
                  <span className="font-semibold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent hover:from-blue-600 hover:to-purple-600 transition-all duration-300">
                    Gowdham Krishna
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
