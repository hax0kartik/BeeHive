import { warn } from '@tauri-apps/plugin-log';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCallback, useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import Header from '../components/header';
import Footer from '../components/footer';
import { message } from '@tauri-apps/plugin-dialog';

function Common() {
  const location = useLocation();
  const [filePath, setFilePath] = useState(location.state?.filePath);
 
  const [System, setSystem] = useState(location.state?.System||false);
  const [Software, setSoftware] = useState(location.state?.Software||false);
  const [Security, setSecurity] = useState(location.state?.Security||false);
  const [Sam, setSam] = useState(location.state?.Sam||false);
  const [User, setUser] = useState(location.state?.user||false);

  let [rSide, setRside] = useState();

  const getValidHives = () => {
    const hives = ["System", "SAM", "Software", "Security"];
    const sets = [setSystem, setSam, setSoftware, setSecurity];

    for (let i = 0; i < hives.length; i++) {
      invoke('t_is_hive_valid', { hivename: hives[i] })
        .then((valid) => {
          sets[i](valid);
        })
        .catch((error) => warn('Error invoking t_is_hive_valid: ' + error));
    }
  }

  useEffect(() => {
    getValidHives();
  }, [])

  const filePathChange = (data) => {
    setFilePath(data['filePath']);
  };

  const setAttachedDevices = async () => {
    let res = await invoke('t_get_subkeys', { keypath: "\\System\\ControlSet001\\Enum\\USBSTOR" });

    const buildTable = () => {
      return (
        <table className='table table-fixed w-full'>
            <thead>
              <tr className=''>
                <th className='text-base'> Vendor ID </th>
                <th className='text-base'> Product ID </th>
                <th className='text-base'> Revision </th>
              </tr>
            </thead>
            <tbody>
              {
                res["entries"].map((e) => {
                  let entries = e.name.split("&");
                  return (
                    <tr>
                      <th> {entries[1]} </th>
                      <th> {entries[2]} </th>
                      <th> {entries[3]} </th>
                    </tr>
                  )
                })
              }
            </tbody>
          </table>
      )
    }

    setRside(buildTable());
  }

  return (
    <div className='flex flex-col h-screen w-screen overflow-y-hidden'>
      <Header onChange={filePathChange} />
      <div className="flex h-full">
        <div className='flex align-items flex-col pl-6 pt-6 gap-4 w-2/5'>
          <ul className="menu menu-xs bg-base-200 rounded-lg w-full overflow-x-auto overflow-y-auto h-5/6">
          <div className='flex flex-col gap-5'>
            <button className='btn btn-primary'> System Analysis </button>
            <button className='btn btn-primary' onClick={setAttachedDevices}> Attached Devices </button>
          </div>
          </ul>
        </div>
        <div className="divider divider-horizontal"></div>
        <div className='flex flex-col gap-2 pt-4 overflow-x-auto overflow-y-auto h-5/6 w-3/5 divide-y divide-slate-200 pr-4'>
        <div className='text-center font-bold text-2xl'> Analyis Window </div>
        <div className='pt-3'>
        {
          rSide
        }
        </div>
        </div>
      </div>
      <Footer System={System} Software={Software} Security={Security} User={User} Sam={Sam} mode={"Common"}/>
    </div>);
}

export default Common;
