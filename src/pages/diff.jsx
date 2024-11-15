import { warn } from '@tauri-apps/plugin-log';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCallback, useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import Header from '../components/header';
import { message } from '@tauri-apps/plugin-dialog';

function Diff() {
  const navigate = useNavigate();

  const location = useLocation();
  const [filePath1, setFilePath1] = useState(location.state?.filePath1);
  const [filePath2, setFilePath2] = useState(location.state?.filePath2);

  const build_diff_nodes = async () => {
    let res = await invoke('t_hive_differ', { filepath1: filePath1, filepath2: filePath2 });
    warn("Back in build_diff_nodes");
    warn("Length:" + res["nodes"].length);
  }

  const dummy = async(e, f) => {

  }

  useEffect(() => {
    build_diff_nodes();
  }, []);

  function addMenuEntries(key, treeNode) {
    const hasChildren = treeNode["hasChildren"];
    if (hasChildren) {
      return (
        <li>
          <details>
            <summary onClick={handleExtension} id={treeNode["path"]}>{key}</summary>
            <ul>
              {
                Object.entries(treeNode["children"]).map((entry) => {
                  return addMenuEntries(entry[0], entry[1]);
                })
              }
            </ul>
          </details>
        </li>
      )
    } else {
      return (
        <li onClick={(e) => {
          get_key_info(e.target.id)
        }} id={treeNode["path"]}>
          <a id={treeNode["path"]}>
            {key}
          </a>
        </li>
      )
    }
  }

  const content = () => {
    return (
      <div className="flex h-full items-center text-center justify-center gap-3">
        <h1 className="text-2xl">Generating diff...</h1>
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    )

    return (
      <div className="flex h-full">
        <div className='flex align-items flex-col pl-6 pt-6 gap-4 w-2/5'>
          <ul className="menu menu-xs bg-base-200 rounded-lg w-full overflow-x-auto overflow-y-auto h-5/6">
            {
              Object.entries(tree).map(entry => {
                return addMenuEntries(entry[0], entry[1]);
              })
            }
          </ul>
        </div>
        <div className="divider divider-horizontal"></div>
        <div className='w-full'>
          <table className='table table-fixed'>
            <thead>
              <tr className=''>
                <th className='text-base'> Key </th>
                <th className='text-base'> Value </th>
              </tr>
            </thead>
            <tbody>
              {
                Object.entries(Table).map(entry => {
                  return (
                    <tr>
                      <th> {entry[0]} </th>
                      <th> {entry[1]} </th>
                    </tr>
                  )
                })
              }
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  return (
    <div className='flex flex-col h-screen w-screen overflow-y-hidden'>
      <Header onChange={dummy} />
      { content() }
    </div>
  );
}

export default Diff;