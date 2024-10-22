import { warn } from '@tauri-apps/plugin-log';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCallback, useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import Header from '../compenents/header';
import Footer from '../compenents/footer';
import { message } from '@tauri-apps/plugin-dialog';

function Common() {
  const location = useLocation();
  const [filePath, setFilePath] = useState(location.state?.filePath);
  const [System, setSystem] = useState(location.state?.System||false);
  const [Software, setSoftware] = useState(location.state?.Software||false);
  const [Security, setSecurity] = useState(location.state?.Security||false);
  const [Sam, setSam] = useState(location.state?.Sam||false);
  const [User, setUser] = useState(location.state?.user||false);
  const [Message, setMessage] = useState(location.state?.Message);

  const filePathChange = (data) => {
    setMessage(data['Message']);
    setFilePath(data['filePath']);
  };
  return (
    <div className='flex flex-col h-screen w-screen overflow-y-hidden'>
      <Header onChange={filePathChange} />
      <div className="flex h-full">
        <div className='flex align-items flex-col pl-6 pt-6 gap-4 w-2/5'>
          <ul className="menu menu-xs bg-base-200 rounded-lg w-full overflow-x-auto overflow-y-auto h-5/6">
          </ul>
        </div>
        <div className="divider divider-horizontal"></div>
        <div className=''>
        </div>
      </div>
      <Footer System={System} Software={Software} Security={Security} User={User} Sam={Sam} mode={"Common"}/>
    </div>);
}

export default Common;
