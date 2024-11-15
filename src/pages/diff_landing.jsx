import { open } from '@tauri-apps/plugin-dialog';
import { warn } from '@tauri-apps/plugin-log';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';

import Header from '../components/header';

function DiffLanding() {
  const navigate = useNavigate();

  const [filePath1, setFilePath1] = useState("");
  const [filePath2, setFilePath2] = useState("");

  const selectFile = async(e) => {
    const file = await open({
      multiple: false,
      filters: [],
    });
    if (!file) {
      warn("No folder selected");
      return;
    }

    if (e.target.id === "1")
      setFilePath1(file);
    else
      setFilePath2(file);
  }

  const diff = async(e) => {
    navigate("/diff", { state: { filePath1: filePath1, filePath2: filePath2 } })
  }

  const dummy = async(e, f) => {

  }

  return (
    <div className='flex flex-col h-screen w-screen overflow-y-hidden'>
        <Header onChange={dummy} />
        <div className="flex flex-col items-center text-center justify-center pt-[2vh] gap-6">
            <img src="/beehive.svg" className="h-64" alt="Beehive logo" />
            <div className="flex flex-col gap-4 w-2/4">
                <div className="">
                    <p>Welcome to Beehive's diffing mode.</p>
                    <p className="">Click on the buttons below to select your hive files.</p>
                </div>
                <div className="flex gap-6 items-center justify-center">
                    <div className="flex flex-col w-3/4 text-left">
                        <button className="btn btn-primary" onClick={selectFile} id="1">Select Hive 1...</button>
                        <p> {filePath1} </p>
                    </div>
                    <div className="flex flex-col w-3/4 text-left">
                        <button className="btn btn-primary" onClick={selectFile} id="2">Select Hive 2...</button>
                        <p> {filePath2} </p>
                    </div>
                </div>
                <button className="btn btn-primary" onClick={diff}>Show diff</button>
            </div>
        </div>
    </div>
  );
}

export default DiffLanding;
