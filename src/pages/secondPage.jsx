import { open } from '@tauri-apps/plugin-dialog';
import { warn } from '@tauri-apps/plugin-log';
import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';

function NewPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [filePath, setFilePath] = useState(location.state?.filePath);
  const [Message, setMessage] = useState('');
  const [System, setSystem] = useState(false);
  const [Software, setSoftware] = useState(false);
  const [Security, setSecurity] = useState(false);
  const [Sam, setSam] = useState(false);
  const [User, setUser] = useState(false);

  const systemReader = () =>{
    invoke('hive_system_reader', { filepath: filePath })
    .then((message) => {
      console.log(message);
      setMessage(message);
    })
    .catch((error) => console.error('Error invoking greet:', error));
  };

  const softwareReader = () =>{
    invoke('hive_software_reader', { filepath: filePath })
    .then((message) => {
      console.log(message);
      setMessage(message);
    })
    .catch((error) => console.error('Error invoking greet:', error));
  };

  const securityReader = () =>{
    invoke('hive_security_reader', { filepath: filePath })
    .then((message) => {
      console.log(message);
      setMessage(message);
    })
    .catch((error) => console.error('Error invoking greet:', error));
  };

  const samReader = () =>{
    invoke('hive_sam_reader', { filepath: filePath })
    .then((message) => {
      console.log(message);
      setMessage(message);
    })
    .catch((error) => console.error('Error invoking greet:', error));
  };

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
  async function selectFile() {
    setMessage('');
    const file = await open({
      multiple: false,
      directory: true,
      filters: [],
    });
    if (!file) {
      warn("No folder selected");
      return;
    }

    warn("Folder selected: " + file);
    setFilePath(file);
  }

  return (
    <div className='flex flex-col h-screen w-screen'>
      <ul className='menu menu-horizontal gap-2 bg-base-300'>
      <div className='dropdown dropdown-hover'>
          <div className='btn btn-ghost btn-sm'>Folder</div>
          <ul className='dropdown-content menu bg-base-100 shadow w-40 rounded-box'>
            <li><a onClick={selectFile}>Open Folder</a></li>
            <li><a>Create Backup</a></li>
          </ul>
        </div>
        <div className='dropdown dropdown-hover'>
          <div className='btn btn-ghost btn-sm'>Mode</div>
          <ul className='dropdown-content menu bg-base-100 shadow w-40 rounded-box'>
            <li className=''><a>Classic</a></li>
            <li className=''><a>Diff View</a></li>
          </ul>
        </div>
        <div className='dropdown dropdown-hover'>
          <div className='btn btn-ghost btn-sm'>Help</div>
          <ul className='dropdown-content menu bg-base-100 shadow w-40 rounded-box'>
            <li className='' onClick={handleBackClick}><a>Welcome</a></li>
            <li className=''><a>Preferences...</a></li>
            <li className=''><a>About</a></li>
          </ul>
        </div>
      </ul>
      <div className="flex h-full">
        <div className='flex align-items flex-col pl-6 pt-6 gap-4'>
          {System && <button onClick={systemReader} className='btn btn-wide'>SYSTEM</button>}
          {Software && <button onClick={softwareReader} className='btn btn-wide'>SOFTWARE</button>}
          {Security && <button onClick={securityReader} className='btn btn-wide'>SECURITY</button>}
          {Sam && <button onClick={samReader} className='btn btn-wide' >SAM</button>}
        </div>
        <div class="divider divider-horizontal"></div>
        <div className=''>
          {Message && <p className="mt-4">{Message}</p>}
        </div>
      </div>
      <footer className="footer bg-base-300">
        <div className='flex p-2 align-items justify-center gap-4'>
          <p> Loaded Hives: </p>
          <div className='flex gap-1'>
            <div className={`badge ${User ? 'badge-success' : 'badge-error'} badge-sm`} />
            <p> User </p>
          </div>
          <div className='flex gap-1'>
            <div className={`badge ${System ? 'badge-success' : 'badge-error'} badge-sm`} />
            <p> System </p>
          </div>
          <div className='flex gap-1'>
            <div className={`badge ${Security ? 'badge-success' : 'badge-error'} badge-sm`} />
            <p> Security </p>
          </div>
          <div className='flex gap-1'>
            <div className={`badge ${Software ? 'badge-success' : 'badge-error'} badge-sm`} />
            <p> Software </p>
          </div>
          <div className='flex gap-1'>
            <div className={`badge ${Sam ? 'badge-success' : 'badge-error'} badge-sm`}/>
            <p> SAM </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default NewPage;
