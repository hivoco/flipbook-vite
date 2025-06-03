import { useState, useCallback, useRef } from 'react';

// Custom hook for audio recording
 const useAudioRecorder = ({permission,setPermission}) => {
  const [recordingStatus, setRecordingStatus] = useState('inactive');
  const [audioURL, setAudioURL] = useState('');
  const [error, setError] = useState(null);
  
  const mediaRecorder = useRef(null);
  const audioChunks = useRef([]);
  const streamRef = useRef(null);
  
  const requestPermission = useCallback(async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream;
      setPermission(true);
      return true;
    } catch (err) {
      setError(`Mic permission denied: `);
      return false;
    }
  }, []);
  
  const startRecording = useCallback(() => {
    if (!permission || !streamRef.current) {
      console.warn('Stream not ready yet');
      return;
    }
  
    audioChunks.current = [];
    mediaRecorder.current = new MediaRecorder(streamRef.current);
  
    mediaRecorder.current.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunks.current.push(event.data);
      }
    };
  
    mediaRecorder.current.onstop = () => {
      const audioBlob = new Blob(audioChunks.current, { type: 'audio/wav' });
      const audioUrl = URL.createObjectURL(audioBlob);
      setAudioURL(audioUrl);
      setRecordingStatus('inactive');
    };
  
    mediaRecorder.current.start();
    setRecordingStatus('recording');
  }, [permission]);
    
  const stopRecording = useCallback(() => {
    if (mediaRecorder.current && recordingStatus === 'recording') {
      mediaRecorder.current.stop();
    }
  }, [recordingStatus]);
  
  const clearRecording = useCallback(() => {
    setAudioURL('');
  }, []);

  const handleStart = async () => {
    const granted = await requestPermission();
    if (granted) {
      startRecording();
    }
  };
    
  
  return {
    permission,
    recordingStatus,
    audioURL,
    error,
    requestPermission,
    startRecording,
    handleStart,
    stopRecording,
    clearRecording
  };
};

export default useAudioRecorder
