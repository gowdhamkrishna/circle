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
  const [pressure, setPressure] = useState(1);
  const [isMobile, setIsMobile] = useState(false);

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

  const drawGrid = (ctx) => {
    const canvas = canvasRef.current;
    const width = canvas.width;
    const height = canvas.height;
    const gridSize = 50;

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

    // Draw center point and crosshair
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Draw crosshair
    ctx.strokeStyle = '#9ca3af';
    ctx.lineWidth = 1;
    
    // Horizontal line
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(width, centerY);
    ctx.stroke();
    
    // Vertical line
    ctx.beginPath();
    ctx.moveTo(centerX, 0);
    ctx.lineTo(centerX, height);
    ctx.stroke();

    // Draw center point
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(centerX, centerY, 3, 0, 2 * Math.PI);
    ctx.fill();

    // Draw ideal circle radius
    ctx.strokeStyle = '#60a5fa';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.arc(centerX, centerY, 50, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.setLineDash([]);
  };

  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches?.[0] || e.changedTouches?.[0] || e;
    
    // Get pressure if available (iOS devices)
    const touchPressure = touch.force || 1;
    setPressure(touchPressure);
    
    // Calculate coordinates relative to canvas and scale
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    return {
      x: (touch.clientX - rect.left) * scaleX,
      y: (touch.clientY - rect.top) * scaleY,
      pressure: touchPressure
    };
  };

  const startDrawing = (e) => {
    e.preventDefault();
    const { x, y } = getCoordinates(e);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGrid(ctx);
    
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

    // Calculate center and radius
    let sumX = 0, sumY = 0;
    points.forEach(point => {
      sumX += point.x;
      sumY += point.y;
    });
    const center = {
      x: sumX / points.length,
      y: sumY / points.length
    };

    // Calculate average radius and standard deviation
    const distances = points.map(p => Math.hypot(p.x - center.x, p.y - center.y));
    const avgRadius = distances.reduce((a, b) => a + b) / distances.length;
    const stdDev = Math.sqrt(
      distances.reduce((acc, d) => acc + Math.pow(d - avgRadius, 2), 0) / distances.length
    );

    // Calculate circularity score
    const circularityScore = Math.max(0, 100 - (stdDev / avgRadius) * 100);

    // Calculate closure score
    const firstPoint = points[0];
    const lastPoint = points[points.length - 1];
    const closureDistance = Math.hypot(firstPoint.x - lastPoint.x, firstPoint.y - lastPoint.y);
    const closureScore = Math.max(0, 100 - (closureDistance / 20) * 100);

    // Calculate size score
    const idealRadius = 50;
    const sizeScore = Math.max(0, 100 - (Math.abs(avgRadius - idealRadius) / idealRadius) * 100);

    // Calculate final score
    const finalScore = Math.round(
      circularityScore * 0.6 +
      closureScore * 0.2 +
      sizeScore * 0.2
    );

    // Update state
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
  };

  const checkAchievements = (score) => {
    const newAchievements = [...achievements];
    let hasNewAchievement = false;

    // Check for perfect circle
    if (score >= 98 && !achievements.find(a => a.id === 'perfect')) {
      newAchievements.push({ ...achievementsList.find(a => a.id === 'perfect'), unlocked: true });
      hasNewAchievement = true;
    }

    // Check for streak
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

    // Update total score and level
    const newTotalScore = totalScore + score;
    setTotalScore(newTotalScore);
    const newLevel = Math.floor(newTotalScore / 1000) + 1;
    setLevel(newLevel);
    localStorage.setItem('totalScore', newTotalScore.toString());

    // Check for master achievement
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

  useEffect(() => {
    // Check if device is mobile
    setIsMobile(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Set canvas size based on screen size
    const setCanvasSize = () => {
      const maxWidth = Math.min(window.innerWidth - 32, 500); // 32px padding, max 500px
      const maxHeight = Math.min(window.innerHeight - 200, 500); // Leave space for UI elements
      const size = Math.min(maxWidth, maxHeight);
      
      // Set device pixel ratio for sharp rendering
      const dpr = window.devicePixelRatio || 1;
      canvas.width = size * dpr;
      canvas.height = size * dpr;
      canvas.style.width = `${size}px`;
      canvas.style.height = `${size}px`;
      
      // Scale context to match device pixel ratio
      ctx.scale(dpr, dpr);
      
      // Clear and redraw
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      drawGrid(ctx);
    };

    setCanvasSize();
    window.addEventListener('resize', setCanvasSize);

    // Load saved data
    const savedAchievements = localStorage.getItem('achievements');
    if (savedAchievements) {
      setAchievements(JSON.parse(savedAchievements));
    }

    const savedBestScore = localStorage.getItem('bestScore');
    if (savedBestScore) {
      setBestScore(parseInt(savedBestScore));
    }

    const savedTotalScore = localStorage.getItem('totalScore');
    if (savedTotalScore) {
      setTotalScore(parseInt(savedTotalScore));
      setLevel(Math.floor(parseInt(savedTotalScore) / 1000) + 1);
    }

    return () => {
      window.removeEventListener('resize', setCanvasSize);
    };
  }, []);

  return (
    <main className={`min-h-screen p-4 md:p-8 flex flex-col items-center transition-colors duration-500 ${getBackgroundColor(rating)}`}>
      <div className="w-full max-w-2xl">
        <div className="flex justify-between items-center mb-4">
          <div className="text-gray-900">
            <h1 className="text-2xl md:text-3xl font-bold">Circle Master</h1>
            <p className="text-sm md:text-base font-medium">Level {level} • Streak: {streak}</p>
            <p className="text-sm text-gray-700">Total Score: {totalScore}</p>
          </div>
          <div className="text-gray-900 text-right">
            <p className="text-sm md:text-base font-medium">Best Score: {bestScore}%</p>
            <p className="text-sm text-gray-700">Attempts: {attempts}</p>
          </div>
        </div>

        {showConfetti && (
          <div className="fixed top-0 left-0 w-full h-full pointer-events-none">
            {[...Array(50)].map((_, i) => (
              <div
                key={i}
                className="absolute animate-confetti"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: '-10px',
                  backgroundColor: `hsl(${Math.random() * 360}, 100%, 50%)`,
                  width: '10px',
                  height: '10px',
                  animationDelay: `${Math.random() * 3}s`,
                  animationDuration: `${2 + Math.random() * 2}s`
                }}
              />
            ))}
          </div>
        )}

        <div className="bg-white/90 backdrop-blur-sm p-4 md:p-6 rounded-lg shadow-lg">
          <div className="relative">
            <canvas
              ref={canvasRef}
              width={400}
              height={400}
              className={`w-full max-w-[400px] h-auto border-2 border-gray-300 rounded-lg mb-4 touch-feedback ${
                isMobile ? 'touch-none' : ''
              }`}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              style={{
                touchAction: 'none',
                WebkitTouchCallout: 'none',
                WebkitUserSelect: 'none',
                userSelect: 'none',
                WebkitTapHighlightColor: 'transparent',
                cursor: 'crosshair'
              }}
            />
            {isMobile && (
              <div className="absolute bottom-4 right-4 bg-black/50 text-white px-2 py-1 rounded text-sm">
                Pressure: {Math.round(pressure * 100)}%
              </div>
            )}
          </div>
          <div className="text-center">
            <p className="text-xl font-semibold mb-2 text-gray-900">Your Rating: {rating}%</p>
            <p className="text-lg text-gray-800 mb-2 font-medium">{message}</p>
            {warning && (
              <p className="text-red-600 font-medium mb-4">{warning}</p>
            )}
          </div>
        </div>

        <div className="mt-4 bg-white/90 backdrop-blur-sm p-4 rounded-lg shadow-lg">
          <h2 className="text-xl font-bold mb-2 text-gray-900">Achievements</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {achievementsList.map((achievement) => {
              const isUnlocked = achievements.find(a => a.id === achievement.id)?.unlocked;
              return (
                <div
                  key={achievement.id}
                  className={`p-2 rounded ${
                    isUnlocked ? 'bg-green-100' : 'bg-gray-100'
                  }`}
                >
                  <div className="flex items-center">
                    <span className="mr-2">
                      {isUnlocked ? '🏆' : '🔒'}
                    </span>
                    <div>
                      <p className="font-semibold text-gray-900">{achievement.name}</p>
                      <p className="text-sm text-gray-700">{achievement.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
}
