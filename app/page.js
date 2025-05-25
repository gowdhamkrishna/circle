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
    { id: 'consistent', name: 'Consistency is Key', description: 'Draw 5 circles above 60%', unlocked: false }
  ];

  const getBackgroundColor = (rating) => {
    if (rating >= 98) return 'bg-gradient-to-br from-green-400 to-green-600';
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

    // Draw reference circle
    const radius = Math.min(width, height) * 0.35;
    ctx.strokeStyle = '#60a5fa';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.setLineDash([]);
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

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#000000';

    ctx.lineTo(x, y);
    ctx.stroke();
    setPoints(prev => [...prev, { x, y }]);
  };

  const stopDrawing = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    setIsDrawing(false);
    evaluateCircle();
  };

  const evaluateCircle = () => {
    if (points.length < 20) {
      setRating(0);
      setMessage(funnyMessages[0]);
      setWarning('Please draw a more complete shape');
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

      const circularityScore = Math.max(0, Math.min(100, 
        100 - (stdDev / avgRadius) * 100
      ));

      const firstPoint = points[0];
      const lastPoint = points[points.length - 1];
      const closureDistance = Math.sqrt(
        Math.pow(lastPoint.x - firstPoint.x, 2) + 
        Math.pow(lastPoint.y - firstPoint.y, 2)
      );
      const closureScore = Math.max(0, Math.min(100,
        100 - (closureDistance / avgRadius) * 50
      ));

      const canvas = canvasRef.current;
      const idealRadius = Math.min(canvas.width, canvas.height) * 0.35;
      const sizeScore = Math.max(0, Math.min(100,
        100 - (Math.abs(avgRadius - idealRadius) / idealRadius) * 100
      ));

      const finalScore = Math.round(
        circularityScore * 0.4 +
        closureScore * 0.2 +
        sizeScore * 0.4
      );

      if (finalScore > bestScore) {
        setBestScore(finalScore);
        localStorage.setItem('bestScore', finalScore.toString());
      }

      setRating(finalScore);
      const ratingKey = Math.floor(finalScore / 20) * 20;
      setMessage(funnyMessages[ratingKey]);
      setWarning('');
      checkAchievements(finalScore);
      setAttempts(prev => prev + 1);

    } catch (error) {
      console.error('Error evaluating circle:', error);
      setRating(0);
      setMessage(funnyMessages[0]);
      setWarning('Please try drawing again');
    }
  };

  const checkAchievements = (score) => {
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
    <main className="min-h-screen flex flex-col items-center justify-start p-0 bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-[600px] mx-auto px-4 py-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          <div className="p-4">
            <h1 className="text-xl font-bold text-center text-gray-800 dark:text-white mb-4">
              Circle Drawing Challenge
            </h1>
            
            <div className="flex justify-center items-center mb-4">
              <canvas
                ref={canvasRef}
                className="w-full max-w-[500px] aspect-square bg-white dark:bg-gray-700 rounded-lg border-2 border-gray-200 dark:border-gray-600 touch-none"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
              />
            </div>

            <div className="space-y-4">
              <div className="flex flex-row gap-2">
                <div className="flex-1 bg-white dark:bg-gray-800 p-2 rounded-lg shadow-sm">
                  <div className={`text-xl font-bold ${getBackgroundColor(rating)} text-white rounded-lg p-1 text-center`}>
                    {rating}%
                  </div>
                  <p className="mt-1 text-gray-600 dark:text-gray-300 text-center text-xs line-clamp-2">{message}</p>
                </div>

                <div className="flex-1 bg-white dark:bg-gray-800 p-2 rounded-lg shadow-sm">
                  <div className="grid grid-cols-2 gap-1">
                    <div className="text-xs">
                      <span className="text-gray-500 dark:text-gray-400">Lvl:</span>
                      <span className="ml-1 text-gray-800 dark:text-gray-200">{level}</span>
                    </div>
                    <div className="text-xs">
                      <span className="text-gray-500 dark:text-gray-400">Best:</span>
                      <span className="ml-1 text-gray-800 dark:text-gray-200">{bestScore}%</span>
                    </div>
                    <div className="text-xs">
                      <span className="text-gray-500 dark:text-gray-400">Try:</span>
                      <span className="ml-1 text-gray-800 dark:text-gray-200">{attempts}</span>
                    </div>
                    <div className="text-xs">
                      <span className="text-gray-500 dark:text-gray-400">Strk:</span>
                      <span className="ml-1 text-gray-800 dark:text-gray-200">{streak}</span>
                    </div>
                  </div>
                </div>
              </div>

              {warning && (
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded-lg text-center text-xs">
                  {warning}
                </div>
              )}

              {achievements.length > 0 && (
                <div className="grid grid-cols-2 gap-2">
                  {achievements.map((achievement) => (
                    <div
                      key={achievement.id}
                      className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 p-2 rounded-lg"
                    >
                      <p className="font-semibold text-xs">{achievement.name}</p>
                      <p className="text-[10px] line-clamp-2">{achievement.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
