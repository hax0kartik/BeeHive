import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';

function NewPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [filePath, setFilePath] = useState(location.state?.filePath);
  const [greetingMessage, setGreetingMessage] = useState('');

  useEffect(() => {
    if (filePath) {
      invoke('hivereader', { filepath: filePath })
        .then((message) => {
          console.log(message);
          setGreetingMessage(message);
        })
        .catch((error) => console.error('Error invoking greet:', error));
    }
  }, [filePath]);

  const handleBackClick = () => {
    navigate(-1);
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-3xl font-bold">File Selected</h1>
      {filePath ? (
        <p className="mt-4">You selected: {filePath}</p>
      ) : (
        <p>No file selected.</p>
      )}
      {greetingMessage && <p className="mt-4">{greetingMessage}</p>}
      
      <h1 className="text-3xl font-bold">fking works!!!!..</h1>
      <button onClick={handleBackClick} className="btn btn-primary">Go Back</button>
    </div>
  );
}

export default NewPage;
