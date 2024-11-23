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
  let [loading, setLoading] = useState(false);

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

  const spinner = () => {
    return (
      <div className="flex h-full items-center text-center justify-center gap-3">
        <h1 className="text-1xl">This might take some time...</h1>
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    )
  }

  useEffect(() => {
    if (loading === true) {
      console.log("useEffect triggered!");
      setRside(prevrside => ({...spinner()}));
    }
  }, [loading]);

  const filePathChange = (data) => {
    setFilePath(data['filePath']);
  };

  const setStartupApplications = async () => {
    let res = await invoke('t_get_keys', { keypath: "\\Software\\Microsoft\\Windows\\CurrentVersion\\Run" });
    let res2 = await invoke('t_get_keys', { keypath: "\\Software\\Microsoft\\Windows\\CurrentVersion\\RunOnce" });

    let collected = [res, res2];

    const buildTable = () => {
      return (
        <table className='table table-fixed w-full'>
            <thead>
              <tr className=''>
                <th className='text-base'> Name </th>
                <th className='text-base'> Location </th>
              </tr>
            </thead>
            <tbody>
              {
                collected.map((en) =>
                  Object.keys(en["entries"]).map((e) => {
                    return (
                      <tr>
                        <td> {e} </td>
                        <td> {en["entries"][e].replaceAll("\\\\", "\\").replaceAll("\"", "")} </td>
                      </tr>
                    )
                  })
                )
              }
            </tbody>
          </table>
      )
    }

    setRside(buildTable());
  }

  const setConnectedNetworks = async () => {
    let path = "\\Software\\Microsoft\\Windows NT\\CurrentVersion\\NetworkList\\Profiles";
    let subkeys = await invoke("t_get_subkeys", { keypath: path });

    setLoading(prevLoading => (true));

    warn("Subkeys: " + JSON.stringify(subkeys, null, 2));

    const convertToDate = (originalFileTime) => {

      let dateCreated = originalFileTime.replaceAll(" ", "").split(",");
      warn(dateCreated);

      let nh = [];
      for (let j = 0; j < dateCreated.length; j++) {
        let n = Number.parseInt(dateCreated[j]);
        nh.push(n);
      }

      let year = nh[0] + (nh[1] * 256);
      let month = nh[2];
      let day = nh[6];
      let minute = nh[8];
      let second = nh[10];
      let millisecond = nh[12];

      return new Date(year, month, day, minute, second, millisecond);
    }

    const get_keys = async (new_path) => {
      let values = await invoke("t_get_keys", {keypath: new_path});
      return values;
    }

    const build = async () => {
      let data = [];
      for (let i = 0; i < subkeys["entries"].length; i++) {
        let key = subkeys["entries"][i]["name"];
        let new_path = path + "\\" + key;
        warn(new_path);
        let values = await get_keys(new_path);
        let name = values["entries"]["ProfileName"].replaceAll("\"", "");
        let profile = values["entries"]["Description"].replaceAll("\"", "");

        let dateCreated = values["entries"]["DateCreated"].substring(
          values["entries"]["DateCreated"].indexOf("[") + 1,
          values["entries"]["DateCreated"].indexOf("]")
        );

        let dateLastConnected = values["entries"]["DateLastConnected"].substring(
          values["entries"]["DateLastConnected"].indexOf("[") + 1,
          values["entries"]["DateLastConnected"].indexOf("]")
        );

        dateCreated = convertToDate(dateCreated);
        dateLastConnected = convertToDate(dateLastConnected);

        data.push((
          <tr>
            <td> {name} </td>
            <td> {profile} </td>
            <td> {dateCreated.toString()} </td>
            <td> {dateLastConnected.toString()} </td>
          </tr>
        ))
      }

      return data;
    }

    const buildTable = (innerdata) => {
      return (
        <table className='table table-fixed w-full'>
          <thead>
            <tr className=''>
              <th className='text-base'> Name </th>
              <th className='text-base'> Description </th>
              <th className='text-base'> Date Created </th>
              <th className='text-base'> Last Used </th>
            </tr>
          </thead>
          <tbody>
            {
              innerdata
            }
          </tbody>
        </table>
      )
    }

    let innerdata = await build();
    setRside(buildTable(innerdata));
    setLoading(prevLoading => (false));
  }

  const setUsers = async () => {
    let res = await invoke('t_get_subkeys', { keypath: "\\SAM\\SAM\\Domains\\Account\\Users\\Names" });

    const buildTable = () => {
      return (
        <table className='table table-fixed w-full'>
            <thead>
              <tr className=''>
                <th className='text-base'> Name </th>
              </tr>
            </thead>
            <tbody>
              {
                res["entries"].map((e) => {
                  return (
                    <tr>
                      <td> {e["name"]} </td>
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

  const setApplications = async () => {
    let path = "\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall";
    let subkeys = await invoke("t_get_subkeys", { keypath: path });

    setLoading(prevLoading => (true));

    warn("Subkeys: " + JSON.stringify(subkeys, null, 2));

    const get_keys = async (new_path) => {
      let values = await invoke("t_get_keys", {keypath: new_path});
      return values;
    }

    const build = async () => {
      let data = [];
      for (let i = 0; i < subkeys["entries"].length; i++) {
        let key = subkeys["entries"][i]["name"];
        let new_path = path + "\\" + key;
        let values = await get_keys(new_path);

        if (Object.keys(values["entries"]).length > 0) {
          if ("DisplayName" in values["entries"] && 
             "DisplayVersion" in values["entries"] &&
             "Publisher" in values["entries"]
             ) {
            let displayName = values["entries"]["DisplayName"].replaceAll("\"", "");
            let version = values["entries"]["DisplayVersion"].replaceAll("\"", "");;
            let publisher = values["entries"]["Publisher"].replaceAll("\"", "");;

            data.push((
              <tr>
                <td> {displayName} </td>
                <td> {version} </td>
                <td> {publisher} </td>
              </tr>
            ))
          }
        }
      }
      return data;
    }

    const buildTable = (innerdata) => {
      return (
        <table className='table table-fixed w-full'>
          <thead>
            <tr className=''>
              <th className='text-base'> Name </th>
              <th className='text-base'> Version </th>
              <th className='text-base'> Publisher </th>
            </tr>
          </thead>
          <tbody>
            {
              innerdata
            }
          </tbody>
        </table>
      )
    }

    let innerdata = await build();
    setRside(buildTable(innerdata));
    setLoading(prevLoading => (false));
  }

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
                      <td> {entries[1]} </td>
                      <td> {entries[2]} </td>
                      <td> {entries[3]} </td>
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
    <div className='flex flex-col h-screen w-screen'>
      <Header onChange={filePathChange} />
      <div className="flex h-full overflow-y-scroll">
        <div className='flex align-items flex-col pl-6 pt-6 gap-4 w-2/5 '>
          <ul className="menu menu-xs bg-base-200 rounded-lg w-full overflow-x-auto overflow-y-auto h-5/6">
          <div className='flex flex-col gap-10'>
            <button className='btn btn-primary' onClick={setUsers}> Users </button>
            <button className='btn btn-primary' onClick={setStartupApplications}> Startup Applications </button>
            <button className='btn btn-primary' onClick={setApplications}> Installed Applications </button>
            <button className='btn btn-primary' onClick={setAttachedDevices}> Attached Devices </button>
            <button className='btn btn-primary' onClick={setConnectedNetworks}> Connected Networks </button>
          </div>
          </ul>
        </div>
        <div className="divider divider-horizontal"></div>
        <div className='flex flex-col gap-2 pt-4 overflow-x-auto overflow-y-scroll w-3/5 divide-y divide-slate-200 pr-4'>
        <div className='text-center font-bold text-2xl'> Analyis Pane </div>
        <div className='pt-3 overflow-y-scroll h-full'>
        {
          rSide
        }
        </div>
        </div>
      </div>
      <Footer System={System} Software={Software} Security={Security} User={User} Sam={Sam} mode={"Common"}/>
    </div>
  );
}

export default Common;
