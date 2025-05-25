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
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Calculate grid size based on canvas dimensions
    const gridSize = Math.min(width, height) / 10;
    const isMobileDevice = window.innerWidth <= 768;

    // Draw grid
    ctx.strokeStyle = isMobileDevice ? '#f3f4f6' : '#e5e7eb';
    ctx.lineWidth = isMobileDevice ? 0.3 : 0.5;

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
    ctx.strokeStyle = isMobileDevice ? '#d1d5db' : '#9ca3af';
    ctx.lineWidth = isMobileDevice ? 0.5 : 1;
    
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
    ctx.arc(centerX, centerY, isMobileDevice ? 2 : 3, 0, 2 * Math.PI);
    ctx.fill();

    // Draw ideal circle
    const idealRadius = Math.min(width, height) * 0.25;
    ctx.strokeStyle = isMobileDevice ? '#93c5fd' : '#60a5fa';
    ctx.lineWidth = isMobileDevice ? 0.5 : 1;
    ctx.setLineDash(isMobileDevice ? [3, 3] : [5, 5]);
    ctx.beginPath();
    ctx.arc(centerX, centerY, idealRadius, 0, 2 * Math.PI);
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
    
    // Calculate coordinates relative to canvas
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    
    // Calculate normalized coordinates (0-1 range)
    const normalizedX = x / rect.width;
    const normalizedY = y / rect.height;
    
    return {
      x,
      y,
      pressure: touchPressure,
      normalizedX,
      normalizedY
    };
  };

  const startDrawing = (e) => {
    e.preventDefault();
    const { x, y, normalizedX, normalizedY } = getCoordinates(e);
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
    setPoints([{ x, y, normalizedX, normalizedY }]);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    e.preventDefault();

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const { x, y, normalizedX, normalizedY, pressure } = getCoordinates(e);

    // Enhanced line drawing with pressure sensitivity and smoothing
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = Math.max(1, Math.min(5, pressure * 3)); // Pressure-based line width
    ctx.strokeStyle = `rgba(0, 0, 0, ${0.5 + pressure * 0.5})`; // Pressure-based opacity

    // Smooth line drawing using quadratic curves
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
    setPoints(prev => [...prev, { x, y, normalizedX, normalizedY, pressure }]);
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
      // 1. Calculate the center point using the average of all points
      const center = {
        x: points.reduce((sum, p) => sum + p.x, 0) / points.length,
        y: points.reduce((sum, p) => sum + p.y, 0) / points.length
      };

      // 2. Calculate the radius for each point
      const radii = points.map(p => 
        Math.sqrt(Math.pow(p.x - center.x, 2) + Math.pow(p.y - center.y, 2))
      );

      // 3. Calculate the average radius
      const avgRadius = radii.reduce((sum, r) => sum + r, 0) / radii.length;

      // 4. Calculate the standard deviation of radii
      const stdDev = Math.sqrt(
        radii.reduce((sum, r) => sum + Math.pow(r - avgRadius, 2), 0) / radii.length
      );

      // 5. Calculate the circularity score (0-100)
      // Lower standard deviation means more circular
      const circularityScore = Math.max(0, Math.min(100, 
        100 - (stdDev / avgRadius) * 100
      ));

      // 6. Calculate the closure score (0-100)
      const firstPoint = points[0];
      const lastPoint = points[points.length - 1];
      const closureDistance = Math.sqrt(
        Math.pow(lastPoint.x - firstPoint.x, 2) + 
        Math.pow(lastPoint.y - firstPoint.y, 2)
      );
      const closureScore = Math.max(0, Math.min(100,
        100 - (closureDistance / avgRadius) * 50
      ));

      // 7. Calculate the size score (0-100)
      const canvas = canvasRef.current;
      const idealRadius = Math.min(canvas.width, canvas.height) * 0.25;
      const sizeScore = Math.max(0, Math.min(100,
        100 - (Math.abs(avgRadius - idealRadius) / idealRadius) * 100
      ));

      // 8. Calculate the smoothness score (0-100)
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
        100 - (avgAngle / Math.PI) * 100
      ));

      // 9. Calculate the final score with weighted components
      const finalScore = Math.round(
        circularityScore * 0.4 +    // How circular the shape is
        closureScore * 0.2 +        // How well the circle is closed
        sizeScore * 0.2 +           // How close to ideal size
        smoothnessScore * 0.2       // How smooth the drawing is
      );

      // 10. Update state and achievements
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

  const setCanvasSize = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const isMobileDevice = window.innerWidth <= 768;
    setIsMobile(isMobileDevice);

    // Set canvas size based on device and screen orientation
    if (isMobileDevice) {
      const isLandscape = window.innerWidth > window.innerHeight;
      const safeArea = window.visualViewport?.height || window.innerHeight;
      const headerHeight = 60; // Approximate header height
      const footerHeight = 100; // Approximate footer height
      const availableHeight = safeArea - headerHeight - footerHeight;

      if (isLandscape) {
        canvas.width = window.innerWidth * 0.9;
        canvas.height = availableHeight * 0.9;
      } else {
        canvas.width = window.innerWidth;
        canvas.height = availableHeight * 0.7; // Use 70% of available height in portrait
      }
    } else {
      // For desktop, use a responsive size based on viewport
      const maxWidth = Math.min(window.innerWidth * 0.8, 800);
      const maxHeight = Math.min(window.innerHeight * 0.8, 600);
      canvas.width = maxWidth;
      canvas.height = maxHeight;
    }

    // Set high DPI support for retina displays
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGrid(ctx);
  };

  useEffect(() => {
    setCanvasSize();
    window.addEventListener('resize', setCanvasSize);
    return () => window.removeEventListener('resize', setCanvasSize);
  }, []);

  return (
    <main className="min-h-screen flex flex-col items-center justify-start p-0 bg-gray-50 dark:bg-gray-900">
      <div className={`w-full ${isMobile ? 'h-screen flex flex-col' : 'max-w-4xl px-4 py-4'}`}>
        <div className={`bg-white dark:bg-gray-800 ${isMobile ? 'flex-1 flex flex-col' : 'rounded-xl shadow-lg overflow-hidden'}`}>
          <div className={`${isMobile ? 'flex-1 flex flex-col' : 'p-4'}`}>
            <div className={`${isMobile ? 'p-2 bg-gray-50 dark:bg-gray-700' : ''}`}>
              <h1 className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold text-center text-gray-800 dark:text-white`}>
                Circle Drawing Challenge
              </h1>
            </div>
            
            <div className={`relative ${isMobile ? 'flex-1 min-h-0' : ''}`}>
              <canvas
                ref={canvasRef}
                className={`w-full ${isMobile ? 'h-full' : 'h-[400px]'} bg-white dark:bg-gray-700 ${isMobile ? '' : 'rounded-lg'} border-2 border-gray-200 dark:border-gray-600 touch-none`}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
              />
            </div>

            <div className={`${isMobile ? 'p-2 bg-gray-50 dark:bg-gray-700' : 'mt-4'} ${isMobile ? 'text-sm space-y-2' : 'text-base'}`}>
              <div className={`flex ${isMobile ? 'flex-row gap-2' : 'flex-wrap gap-4'} justify-center`}>
                <div className={`${isMobile ? 'flex-1' : 'flex-1'} min-w-[120px] bg-white dark:bg-gray-800 p-2 rounded-lg shadow-sm`}>
                  <h2 className={`${isMobile ? 'text-sm' : 'text-lg'} font-semibold mb-1 text-gray-800 dark:text-white`}>Score</h2>
                  <div className={`text-xl font-bold ${getBackgroundColor(rating)} text-white rounded-lg p-1 text-center`}>
                    {rating}%
                  </div>
                  <p className="mt-1 text-gray-600 dark:text-gray-300 text-center text-xs line-clamp-2">{message}</p>
                </div>

                <div className={`${isMobile ? 'flex-1' : 'flex-1'} min-w-[120px] bg-white dark:bg-gray-800 p-2 rounded-lg shadow-sm`}>
                  <h2 className={`${isMobile ? 'text-sm' : 'text-lg'} font-semibold mb-1 text-gray-800 dark:text-white`}>Stats</h2>
                  <div className={`${isMobile ? 'grid grid-cols-2 gap-1' : 'space-y-2'}`}>
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
                <div className="mt-2 p-2 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded-lg text-center text-xs">
                  {warning}
                </div>
              )}

              {achievements.length > 0 && (
                <div className="mt-2">
                  <h2 className={`${isMobile ? 'text-sm' : 'text-lg'} font-semibold mb-1 text-gray-800 dark:text-white`}>Achievements</h2>
                  <div className="grid grid-cols-2 gap-1">
                    {achievements.map((achievement) => (
                      <div
                        key={achievement.id}
                        className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 p-1.5 rounded-lg"
                      >
                        <p className="font-semibold text-xs">{achievement.name}</p>
                        <p className="text-[10px] line-clamp-2">{achievement.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
