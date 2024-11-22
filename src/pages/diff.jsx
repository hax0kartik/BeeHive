import { warn } from '@tauri-apps/plugin-log';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCallback, useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import Header from '../components/header';
import { message } from '@tauri-apps/plugin-dialog';
import jiff from 'jiff';
import { createPatch } from 'rfc6902';
import { AgGridReact } from 'ag-grid-react'; // React Data Grid Component
import "ag-grid-community/styles/ag-grid.css"; // Mandatory CSS required by the Data Grid
import "ag-grid-community/styles/ag-theme-quartz.css"; // Optional Theme applied to the Data Grid

function Diff() {
  const navigate = useNavigate();

  const location = useLocation();
  const [filePath1, setFilePath1] = useState("/home/kartika/Desktop/projects/Beehive/tests/prat_hives/prat/security");
  const [filePath2, setFilePath2] = useState("/home/kartika/Desktop/projects/Beehive/tests/raghav_hives/raghav/Security");
  const [tree, setTree] = useState();
  const [rowData, setRowData] = useState([
    { make: "Tesla", model: "Model Y", price: 64950, electric: true },
  ]);

  const build_diff_nodes = async () => {
    let res = await invoke('t_hive_differ', { filepath1: filePath1, filepath2: filePath2 });
    warn("Back in build_diff_nodes");
    warn("Length:" + res["nodes"].length);

    const diff = createPatch(res["nodes"][1], res["nodes"][0]);

    let initial_tree = res["nodes"][0];
    warn(JSON.stringify(diff[0], null, 2));
    warn(JSON.stringify(diff[1], null, 2));
    warn(JSON.stringify(diff, null, 2));
  }

  const dummy = async (e, f) => {

  }

  useEffect(() => {
    build_diff_nodes();
  }, []);

  const content = () => {
    
    // Column Definitions: Defines the columns to be displayed.
    const [colDefs, setColDefs] = useState([
      { field: "Key" },
      { field: "Change Type" },
      { field: "Value Name" },
      { field: "Old Value" },
      { field: "New Value" }
    ]);
     
    // return (
    //   <div className="flex h-full items-center text-center justify-center gap-3">
    //     <h1 className="text-2xl">Generating diff...</h1>
    //     <span className="loading loading-spinner loading-lg"></span>
    //   </div>
    // )

    return (
      <div
        className="ag-theme-quartz-auto-dark" // applying the Data Grid theme
        style={{ height: "inherit", width: "inherit" }} // the Data Grid will fill the size of the parent container
      >
        <AgGridReact
          rowData={rowData}
          columnDefs={colDefs}
        />
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
      {content()}
    </div>
  );
}

export default Diff;