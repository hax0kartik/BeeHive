import { open } from '@tauri-apps/plugin-dialog';
import { warn } from '@tauri-apps/plugin-log';
import { useNavigate } from 'react-router-dom';
import Header from '../components/header';

function DiffLanding() {
  const navigate = useNavigate();

  async function selectFile() {
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
    navigate('/secondPage', { state: { filePath: file } });
  }

  return (
    <div className='flex flex-col h-screen w-screen overflow-y-hidden'>
        <Header onChange={selectFile} />
        <div className="flex flex-col items-center text-center justify-center pt-[10vh] gap-10">
            <img src="/beehive.svg" className="h-64" alt="Beehive logo" />
            <div className="flex flex-col gap-6 w-2/4">
                <div className="">
                    <p>Welcome to Beehive's diffing mode.</p>
                    <p className="">Click on the buttons below to select your hive files.</p>
                </div>
                <div className="flex gap-6 items-center justify-center">
                    <button className="btn btn-primary w-3/4" onClick={selectFile}>Select Hive 1...</button>
                    <button className="btn btn-primary w-3/4" onClick={selectFile}>Select Hive 2...</button>
                </div>
            </div>
        </div>
    </div>
  );
}

export default DiffLanding;
