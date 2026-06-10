import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Play, Pause, Square, SkipBack, SkipForward,
  Volume2, VolumeX, Volume1, Maximize, Settings, Monitor
} from 'lucide-react';
import { Slider } from '../../components/ui/slider';
import logoImage from '../youtube assets/lk.png';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import './video.css';

const VideoPlayer = ({ videoId }) => {
  const playerRef = useRef(null);
  const containerRef = useRef(null);
  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(100);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [quality, setQuality] = useState('default');
  const [availableQualities, setAvailableQualities] = useState([]);
  const [showTopMask, setShowTopMask] = useState(false);
  const [showLogoOverlay, setShowLogoOverlay] = useState(true);
  const [showEndCover, setShowEndCover] = useState(false);
  const [logoPosition, setLogoPosition] = useState('top-left');
  const [showDetailedSolution, setShowDetailedSolution] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const hideControlsTimeout = useRef();

  const qualityLabels = {
    'small': '360p',
    'medium': '480p',
    'large': '720p',
    'hd720': '720p',
    'default': 'Auto',
  };

  useEffect(() => {
    if (!videoId) return;

    const initPlayer = () => {
      if (playerRef.current) {
        playerRef.current.destroy();
      }
      playerRef.current = new window.YT.Player('youtube-player', {
        videoId: videoId,
        playerVars: {
          controls: 0,
          disablekb: 1,
          fs: 0,
          iv_load_policy: 3,
          modestbranding: 1,
          rel: 0,
          showinfo: 0,
          cc_load_policy: 0,
          playsinline: 1,
        },
        events: {
          onReady: (event) => {
            setIsReady(true);
            setDuration(event.target.getDuration());
            event.target.setVolume(100);
          },
          onStateChange: (event) => {
            setIsPlaying(event.data === window.YT.PlayerState.PLAYING);
          },
        },
      });
    };

    if (!window.YT) {
      // Load YouTube IFrame API
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
      window.onYouTubeIframeAPIReady = initPlayer;
    } else if (!window.YT.Player) {
      window.onYouTubeIframeAPIReady = initPlayer;
    } else {
      initPlayer();
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, [videoId]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (playerRef.current && isPlaying) {
        const time = playerRef.current.getCurrentTime() || 0;
        setCurrentTime(time);
        setShowTopMask(true);

        // Show logo overlay for first 5 seconds at top-left, then cycle every 2 minutes
        setShowLogoOverlay(time < 5);

        // Show "DETAILED SOLUTION" text for first 5 seconds
        setShowDetailedSolution(time < 5);

        // After 5 seconds, cycle logo position every 2 minutes (120 seconds)
        if (time >= 5) {
          const cycleTime = time - 5; // Time since initial 5 seconds ended
          const cycleNumber = Math.floor(cycleTime / 120);
          setLogoPosition(cycleNumber % 2 === 0 ? 'bottom-right' : 'top-left');
        } else {
          setLogoPosition('top-left');
        }

        // Show end cover when video is near end (last 3 seconds)
        const videoDuration = playerRef.current.getDuration() || 0;
        setShowEndCover(videoDuration > 0 && time >= videoDuration - 3);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying]);

  // Update available qualities when player is ready
  useEffect(() => {
    if (isReady && playerRef.current) {
      const qualities = playerRef.current.getAvailableQualityLevels?.() || [];
      setAvailableQualities(qualities);
    }
  }, [isReady]);

  const handleMouseMove = useCallback(() => {
    setShowControls(true);
    if (hideControlsTimeout.current) {
      clearTimeout(hideControlsTimeout.current);
    }
    hideControlsTimeout.current = setTimeout(() => {
      if (isPlaying && !isMenuOpen) {
        setShowControls(false);
      }
    }, 3000);
  }, [isPlaying, isMenuOpen]);

  const togglePlay = () => {
    if (!playerRef.current) return;
    if (isPlaying) {
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.playVideo();
    }
  };

  const handleStop = () => {
    if (!playerRef.current) return;
    playerRef.current.stopVideo();
    playerRef.current.seekTo(0);
    setCurrentTime(0);
    setIsPlaying(false);
  };

  const handleSeek = (value) => {
    if (!playerRef.current) return;
    const time = (value[0] / 100) * duration;
    playerRef.current.seekTo(time, true);
    setCurrentTime(time);
  };

  const handleSkipBackward = () => {
    if (!playerRef.current) return;
    const newTime = Math.max(0, currentTime - 10);
    playerRef.current.seekTo(newTime, true);
    setCurrentTime(newTime);
  };

  const handleSkipForward = () => {
    if (!playerRef.current) return;
    const newTime = Math.min(duration, currentTime + 10);
    playerRef.current.seekTo(newTime, true);
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (value) => {
    if (!playerRef.current) return;
    const newVolume = value[0];
    setVolume(newVolume);
    playerRef.current.setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    if (!playerRef.current) return;
    if (isMuted) {
      playerRef.current.unMute();
      playerRef.current.setVolume(volume || 100);
      setIsMuted(false);
    } else {
      playerRef.current.mute();
      setIsMuted(true);
    }
  };

  const handleSpeedChange = (speed) => {
    if (!playerRef.current) return;
    playerRef.current.setPlaybackRate(speed);
    setPlaybackRate(speed);
  };

  const handleQualityChange = (newQuality) => {
    if (!playerRef.current) return;
    playerRef.current.setPlaybackQuality(newQuality);
    setQuality(newQuality);
  };

  const getFilteredQualities = () => {
    const preferredOrder = ['small', 'medium', 'large', 'hd720'];
    return preferredOrder.filter(q => availableQualities.includes(q));
  };

  const handleFullscreen = () => {
    if (!containerRef.current) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      containerRef.current.requestFullscreen();
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const VolumeIcon = isMuted || volume === 0 ? VolumeX : volume < 50 ? Volume1 : Volume2;
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      ref={containerRef}
      className={`relative w-full mx-auto aspect-video bg-player rounded-player overflow-hidden shadow-player group select-none youtube-cover ${isPlaying ? 'is-playing' : ''}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      onContextMenu={(e) => e.preventDefault()}
      onDragStart={(e) => e.preventDefault()}
    >
      {/* YouTube Player Container - z-0 to ensure overlays can appear above */}
      <div className="absolute inset-0 overflow-hidden z-0">
        <div id="youtube-player" className="absolute inset-0 w-full h-full" />
      </div>

      {/* Full overlay to block YouTube UI and handle clicks */}
      <div
        className="absolute inset-0 z-10 cursor-pointer"
        onClick={togglePlay}
      >
        {/* Top edge blocker - always visible gradient */}
        <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-black/80 to-transparent" />

        {/* Bottom edge blocker - for controls area */}
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/70 to-transparent" />
      </div>

      {/* Logo Overlay for first 5 seconds - hides YouTube channel name */}
      {showLogoOverlay && (
        <div className="absolute top-2 left-2 z-30">
          <img
            src={logoImage}
            alt="Logo"
            className="w-16 h-16 md:w-20 md:h-20 object-contain drop-shadow-[0_0_8px_rgba(0,0,0,0.8)] shadow-black"
            style={{
              filter: 'drop-shadow(0 0 6px rgba(0,0,0,0.9)) drop-shadow(0 0 12px rgba(0,0,0,0.7)) drop-shadow(2px 2px 4px rgba(0,0,0,0.8))'
            }}
          />
        </div>
      )}

      {/* "DETAILED SOLUTION" text for first 5 seconds - hides share icon */}
      {showDetailedSolution && (
        <div className="absolute top-8 right-2 z-30">
          <span
            className="text-yellow-400 font-bold text-sm md:text-lg tracking-wide"
            style={{
              textShadow: '3px 3px 8px rgba(0,0,0,1), 0 0 15px rgba(0,0,0,0.95), -2px -2px 6px rgba(0,0,0,0.9), 0 0 25px rgba(0,0,0,0.8), 4px 4px 12px rgba(0,0,0,0.85)'
            }}
          >
            DETAILED SOLUTION
          </span>
        </div>
      )}

      {/* Cycling Logo - appears after 5 seconds, cycles position every 2 minutes */}
      {!showLogoOverlay && !showEndCover && (
        <div className={`absolute z-30 ${logoPosition === 'top-left' ? 'top-2 left-2' : 'bottom-12 right-2'}`}>
          <img
            src={logoImage}
            alt="Logo"
            className="w-12 h-12 md:w-16 md:h-16 object-contain transition-all duration-500"
            style={{
              filter: 'drop-shadow(0 0 4px rgba(0,0,0,0.8)) drop-shadow(0 0 8px rgba(0,0,0,0.6))'
            }}
          />
        </div>
      )}

      {/* Branded Top Mask - always visible */}
      <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black via-black/90 to-transparent py-4 px-4">
        <div className="flex items-center justify-center">
          <h2 className="text-blue-500 font-bold text-lg md:text-xl tracking-wide">
            ANIRBAN'S ACADEMY
          </h2>
        </div>
      </div>

      {/* End Cover - hides YouTube thumbnail at end of video */}
      {showEndCover && (
        <div className="absolute inset-0 z-[60] bg-black flex items-center justify-center">
          <img
            src={logoImage}
            alt="End Screen"
            className="w-32 h-32 md:w-48 md:h-48 object-contain"
          />
        </div>
      )}

      {/* Bottom Website Bar - at very bottom */}
      <div className="absolute bottom-0 left-0 right-0 z-50 bg-blue-600 py-1.5 px-4">
        <p className="text-white text-xs md:text-sm text-center font-medium">
          Official Website - <a href="https://anirbansacademy.com/" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-200 transition-colors">https://anirbansacademy.com/</a>
        </p>
      </div>

      {/* Loading State */}
      {!isReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-player z-20">
          <div className="w-12 h-12 border-4 border-control-accent border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Custom Center Play Button - shown when paused, designed to cover YouTube's button */}
      {!isPlaying && isReady && (
        <div className="absolute inset-0 flex items-center justify-center z-[100]">
          <button
            onClick={togglePlay}
            className="relative w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center 
                       hover:bg-blue-500 hover:scale-110 transition-all duration-300 
                       shadow-[0_0_30px_rgba(59,130,246,0.5)] shadow-glow"
          >
            <Play className="w-10 h-10 text-white ml-1" fill="currentColor" />
          </button>
        </div>
      )}

      {/* Controls Overlay - above bottom bar */}
      <div
        className={`absolute bottom-8 left-0 right-0 z-30 bg-gradient-to-t from-black/90 via-black/50 to-transparent 
                    p-4 pt-16 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}
      >
        {/* Progress Bar */}
        <div className="mb-4 group/progress">
          <Slider
            value={[progressPercent]}
            onValueChange={handleSeek}
            max={100}
            step={0.1}
            className="cursor-pointer"
          />
        </div>

        {/* Controls Row */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Play/Pause */}
          <button onClick={togglePlay} className="control-button">
            {isPlaying ? (
              <Pause className="w-5 h-5 md:w-6 md:h-6" fill="currentColor" />
            ) : (
              <Play className="w-5 h-5 md:w-6 md:h-6" fill="currentColor" />
            )}
          </button>

          {/* Stop */}
          <button onClick={handleStop} className="control-button">
            <Square className="w-4 h-4 md:w-5 md:h-5" fill="currentColor" />
          </button>

          {/* Skip Backward */}
          <button onClick={handleSkipBackward} className="control-button">
            <SkipBack className="w-5 h-5 md:w-6 md:h-6" fill="currentColor" />
          </button>

          {/* Skip Forward */}
          <button onClick={handleSkipForward} className="control-button">
            <SkipForward className="w-5 h-5 md:w-6 md:h-6" fill="currentColor" />
          </button>

          {/* Volume Controls */}
          <div className="flex items-center gap-2 group/volume">
            <button onClick={toggleMute} className="control-button">
              <VolumeIcon className="w-5 h-5 md:w-6 md:h-6" />
            </button>
            <div className="w-0 md:w-20 overflow-hidden transition-all duration-300 group-hover/volume:w-20">
              <Slider
                value={[isMuted ? 0 : volume]}
                onValueChange={handleVolumeChange}
                max={100}
                step={1}
                className="cursor-pointer"
              />
            </div>
          </div>

          {/* Time Display */}
          <div className="text-control-foreground text-xs md:text-sm font-mono ml-2 whitespace-nowrap">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Quality Control */}
          <DropdownMenu onOpenChange={setIsMenuOpen} modal={false}>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="control-button flex items-center gap-1 px-2"
                onClick={(e) => e.stopPropagation()}
              >
                <Monitor className="w-4 h-4 md:w-5 md:h-5" />
                <span className="text-xs hidden md:inline">{qualityLabels[quality] || 'Auto'}</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              container={document.fullscreenElement ? containerRef.current : undefined}
              className="bg-[#1a1c23] border-[#313540] z-[1001] opacity-100 shadow-2xl"
              onOpenAutoFocus={(e) => e.preventDefault()}
              onCloseAutoFocus={(e) => e.preventDefault()}
            >
              <DropdownMenuItem
                onSelect={() => handleQualityChange('default')}
                className={`cursor-pointer ${quality === 'default' ? 'text-blue-500' : 'text-control-foreground'}`}
              >
                Auto
              </DropdownMenuItem>
              {getFilteredQualities().map((q) => (
                <DropdownMenuItem
                  key={q}
                  onSelect={() => handleQualityChange(q)}
                  className={`cursor-pointer ${quality === q ? 'text-blue-500' : 'text-control-foreground'}`}
                >
                  {qualityLabels[q] || q}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Speed Control */}
          <DropdownMenu onOpenChange={setIsMenuOpen} modal={false}>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="control-button flex items-center gap-1 px-2"
                onClick={(e) => e.stopPropagation()}
              >
                <Settings className="w-4 h-4 md:w-5 md:h-5" />
                <span className="text-xs hidden md:inline">{playbackRate}x</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              container={document.fullscreenElement ? containerRef.current : undefined}
              className="bg-[#1a1c23] border-[#313540] z-[1001] opacity-100 shadow-2xl"
              onOpenAutoFocus={(e) => e.preventDefault()}
              onCloseAutoFocus={(e) => e.preventDefault()}
            >
              {[0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map((speed) => (
                <DropdownMenuItem
                  key={speed}
                  onSelect={() => handleSpeedChange(speed)}
                  className={`cursor-pointer ${playbackRate === speed ? 'text-control-accent' : 'text-control-foreground'}`}
                >
                  {speed}x
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Fullscreen */}
          <button onClick={handleFullscreen} className="control-button">
            <Maximize className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
