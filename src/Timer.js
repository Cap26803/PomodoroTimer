import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import PlayButton from "./PlayButton";
import PauseButton from "./PauseButton";
import SettingsButton from "./SettingsButton";
import { useContext, useState, useEffect, useRef } from "react";
import SettingsContext from "./SettingsContext";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const red = '#f54e4e';
const green = '#4aec8c';

function Timer() {
  const settingsInfo = useContext(SettingsContext);

  const [isPaused, setIsPaused] = useState(true);
  const [mode, setMode] = useState('work'); // work/break/null
  const [secondsLeft, setSecondsLeft] = useState(0);

  const secondsLeftRef = useRef(secondsLeft);
  const isPausedRef = useRef(isPaused);
  const modeRef = useRef(mode);

  function tick() {
    secondsLeftRef.current--;
    setSecondsLeft(secondsLeftRef.current);
  }

  const notify = () => toast('Time is up!');

  useEffect(() => {
    function switchMode() {
      const nextMode = modeRef.current === 'work' ? 'break' : 'work';
      const nextSeconds = nextMode === 'work' ? settingsInfo.workMinutes * 60 : settingsInfo.breakMinutes * 60;
    
      setMode(nextMode);
      modeRef.current = nextMode;
    
      setSecondsLeft(nextSeconds);
      secondsLeftRef.current = nextSeconds;
    }    

    const initialSeconds = mode === 'work' ? settingsInfo.workMinutes * 60 : settingsInfo.breakMinutes * 60;
    secondsLeftRef.current = initialSeconds;
    setSecondsLeft(initialSeconds);

    const interval = setInterval(() => {
      if (isPausedRef.current) {
        return;
      }
  
      if (secondsLeftRef.current === 0) {
        clearInterval(interval);
        notify();
        switchMode();
      } else {
        tick();
      }
    }, 1000);
  
    return () => clearInterval(interval);
  }, [settingsInfo, mode]);

  const totalSeconds = mode === 'work'
    ? settingsInfo.workMinutes * 60
    : settingsInfo.breakMinutes * 60;
  const percentage = Math.round(secondsLeft / totalSeconds * 100);

  const minutes = Math.floor(secondsLeft / 60);
  let seconds = secondsLeft % 60;
  if (seconds < 10) seconds = '0' + seconds;

  useEffect(() => {
    console.log('Mode:', mode);
    console.log('Seconds left:', secondsLeft);
  }, [mode, secondsLeft]);

  return (
    <div>
      <CircularProgressbar
        value={percentage}
        text={minutes + ':' + seconds}
        styles={buildStyles({
          textColor: '#fff',
          pathColor: mode === 'work' ? red : green,
          tailColor: 'rgba(255,255,255,.2)',
        })} />
      <div style={{ marginTop: '20px' }}>
        {isPaused
          ? <PlayButton onClick={() => { setIsPaused(false); isPausedRef.current = false; }} />
          : <PauseButton onClick={() => { setIsPaused(true); isPausedRef.current = true; }} />}
      </div>
      <div style={{ marginTop: '20px' }}>
        <SettingsButton onClick={() => settingsInfo.setShowSettings(true)} />
      </div>
    </div>
  );
}

export default Timer;