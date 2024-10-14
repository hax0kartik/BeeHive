import { open } from '@tauri-apps/plugin-dialog';
import { warn } from '@tauri-apps/plugin-log';
import { useNavigate } from 'react-router-dom';
import '../output.css';

function Home() {
  const navigate = useNavigate();

  async function selectFile() {
    const file = await open({
      multiple: false,
      directory: false,
    });
    warn("File selected: " + file);
    navigate('/secondPage', { state: { filePath: file } });
  }

  return (
    <div className="flex flex-col items-center text-center justify-center pt-[10vh] gap-10">
      <h1 className="text-3xl font-bold">Welcome to Beehive!</h1>
      <img src="/beehive.svg" className="h-64" alt="Beehive logo" />

      <div className="flex flex-col gap-6 w-2/4">
        <p>Click on the Button Below to select a hive file</p>
        <button className="btn btn-primary" onClick={selectFile}>Open a file...</button>
      </div>
    </div>
  );
}

export default Home;
