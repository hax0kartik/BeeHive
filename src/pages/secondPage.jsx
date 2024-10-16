import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import "../css/sp.css";

function NewPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [filePath, setFilePath] = useState(location.state?.filePath);
  const [Message, setMessage] = useState('');
  const [System, setSystem] = useState(false);
  const [Software, setSoftware] = useState(false);
  const [Security, setSecurity] = useState(false);
  const [Sam, setSam] = useState(false);

  useEffect(() => {
    if (filePath) {
      invoke('fileexists', { filepath: filePath })
        .then((message) => {
          console.log(message);
          const split = message.split(":");
          if (split[0] != "false") {
            setSystem(true);
          }
          if (split[1] != "false") {
            setSoftware(true);
          }
          if (split[2] != "false") {
            setSecurity(true);
          }
          if (split[3] != "false") {
            setSam(true);
          }
        })
        .catch((error) => console.error('Error invoking greet:', error));
    }
  }, [filePath]);

  const handleBackClick = () => {
    navigate(-1);
  };
  const samReader = () =>{
    invoke('hive_sam_reader', { filepath: filePath })
    .then((message) => {
      console.log(message);
      setMessage(message);
    })
    .catch((error) => console.error('Error invoking greet:', error));
  };

  return (
    <div className='ini'>
      <div className='details'>
        <button onClick={handleBackClick} className="back">Go Back</button>
        <div className='foldername'>
          {filePath ? (
            <p className="mt-4">Folder selected: <span className='path'>{filePath}</span></p>
          ) : (
            <p>No file selected.</p>
          )}</div>
      </div>
      <div className="body">
        <div className='div1'>
          {System && <button className='button'>SYSTEM</button>}
          {Software && <button className='button'>SOFTWARE</button>}
          {Security && <button className='button'>SECURITY</button>}
          {Sam && <button onClick={samReader} className='button' >SAM</button>}
        </div>
        <div className='div2'>
          {Message && <p className="mt-4">{Message}</p>}
        </div>
      </div>
    </div>
  );
}

export default NewPage;
