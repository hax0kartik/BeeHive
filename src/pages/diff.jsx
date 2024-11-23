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
  const [filePath1, setFilePath1] = useState(location.state?.filePath1);
  const [filePath2, setFilePath2] = useState(location.state?.filePath2);
  const [tree, setTree] = useState();
  const [rowData, setRowData] = useState([]);
  // Column Definitions: Defines the columns to be displayed.
  const [colDefs, setColDefs] = useState([
    { field: "Key" },
    { field: "Change Type" },
    { field: "Value Name" },
    { field: "Old Value" },
    { field: "New Value" }
  ]);

  const build_diff_nodes = async () => {
    let res = await invoke('t_hive_differ', { filepath1: filePath1, filepath2: filePath2 });
    warn("Back in build_diff_nodes");

    const diff = createPatch(res["nodes"][0], res["nodes"][1]);

    let newRowData = [];

    for (let i = 0; i < diff.length; i++) {
      if (diff[i]["op"] === "remove") {
        let key = diff[i]["path"].replaceAll("/children", "");
        let data = {
          "Key" : key,
          "Change Type" : "Removed",
          "Value Name": "",
          "Old Value": "",
          "New Value" : ""  
        }

        newRowData.push(data);
      } else if (diff[i]["op"] === "add") {
        let key = diff[i]["path"].replaceAll("/children", "");
        let data = {
          "Key" : key,
          "Change Type" : "New Key",
          "Value Name": "",
          "Old Value": "",
          "New Value" : ""  
        }
        newRowData.push(data);

        const recursiveAdd = (children) => {
          Object.keys(children).map((key) => {
            newRowData.push({
              "Key" : children[key]["path"].replaceAll("//ROOT", ""),
              "Change Type" : "New Key",
              "Value Name": "",
              "Old Value": "",
              "New Value" : "",
            });

          Object.keys(children[key]["values"]).map((keyvalue) => {
            newRowData.push({
              "Key" : children[key]["path"].replaceAll("//ROOT", ""),
              "Change Type" : "New Value",
              "Value Name": keyvalue,
              "Old Value": "",
              "New Value" : children[key]["values"][keyvalue]
            });
          });

             if (children[key]["has_children"]) {
               recursiveAdd(children[key]["children"]);
             }
          })
        }

        recursiveAdd(diff[i]["value"]["children"]);

      } else {
        warn("Not handled : " + diff[i]["op"]);
      }
    }

    setRowData(_ => ([...newRowData]));

    //warn(JSON.stringify(diff, null, 2));
  }

  const dummy = async (e, f) => {

  }

  useEffect( async () => {
    build_diff_nodes();
  }, []);

  const content = () => {
    warn("rowData length: " + rowData.length);
    if (rowData.length === 0) {
        return (
          <div className="flex h-full items-center text-center justify-center gap-3">
            <h1 className="text-2xl">Generating diff...</h1>
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        )
    } else {

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
    }
  }

  return (
    <div className='flex flex-col h-screen w-screen overflow-y-hidden'>
      <Header onChange={dummy} />
      {content()}
    </div>
  );
}

export default Diff;