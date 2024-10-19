import { open } from '@tauri-apps/plugin-dialog';
import { warn } from '@tauri-apps/plugin-log';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCallback, useEffect, useState } from 'react';
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

  const [tree, setTree] = useState(
    [
      {
        name : "HKEY_LOCAL_MACHINE",
        path : "\\",
        hasChildren : true,
        children : [
          {
            name : "Security",
            path : "\\Security",
            children : [],
            hasChildren : true
          },
          {
            name : "SAM",
            path : "\\SAM",
            children : [],
            hasChildren : true
          },
          {
            name : "Software",
            path : "\\Software",
            children : [],
            hasChildren : true
          },
          {
            name : "System",
            path : "\\System",
            children : [],
            hasChildren : true
          }
        ]
      }
    ]
  );

  const systemReader = (file) => {
    warn("System reader called");
    invoke('t_hive_reader', { filepath: file })
    .then((message) => {
      console.log(message);
      setMessage(message);
    })
    .catch((error) => warn('Error invoking t_hive_reader: ' + error));
  };

  useEffect(() => {
    systemReader(filePath);
  }, []);

  const getValidHives = () => {
    const hives = ["System", "SAM", "Software", "Security"];
    const sets = [setSystem, setSam, setSoftware, setSecurity];

    for (let i = 0; i < hives.length; i++) {
      invoke('t_is_hive_valid', {hivename: hives[i]})
      .then((valid) => {
        sets[i](valid);
      })
      .catch((error) => warn('Error invoking t_is_hive_valid: ' + error));
    }
  }

  useEffect(() => {
    getValidHives();
  }, [])

  const handleBackClick = () => {
    navigate(-1);
  };

  async function selectFile() {
    warn("Select file called");

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
    systemReader(file);
    getValidHives();
  }

  const modifyTree = (otree, key, newChildren) => {
    function node_traverse(treeNode, node) {
      let current = node[0];
      // console.log("Current node is " + node)

      for(let i = 0; i < treeNode.length; i++) {
        warn(treeNode[i].name, current)
        if (treeNode[i].name === current) {
          if (node.length > 1) {
            node.shift();
            node_traverse(treeNode[i].children, node);
          } else {
            // warn("Node len < 1 " + node)
            // warn("No of newChildren" + newChildren.length);
            for (let j = 0; j < newChildren.length; j++) {
              let obj = {
                name : newChildren[j]["name"],
                path : treeNode[i].path + "\\" + newChildren[j]["name"],
                children : [],
                hasChildren : newChildren[j]["has_children"],
              }
              treeNode[i].children.push(obj);
            }
          }
        }
      }
    }

    let keys = key.split("\\")
    keys[0] = "HKEY_LOCAL_MACHINE";

    let newTree = otree;
    node_traverse(newTree, keys);

    return newTree;
  }

  const handleExtension = async (e) => {
    let res = await invoke('t_get_subkeys', { keypath: e.target.id})
    let nTree = modifyTree(tree, e.target.id, res["entries"]);
    setTree(prevTree => ([...nTree]));
  }

  function addMenuEntries(treeNode) {
    const hasChildren = treeNode["hasChildren"];
    if (hasChildren) {
      return (
        <li>
          <details>
            <summary onClick={handleExtension} id={treeNode["path"]}>{treeNode["name"]}</summary>
            <ul>
              {
                treeNode["children"].map((entry) => {
                  return addMenuEntries(entry);
                })
              }
            </ul>
          </details>
        </li>
      )
    } else {
      return (
        <li onClick={console.log("Li element pressed")}  >
          <a>
            {treeNode["name"]}
          </a>
        </li>
      )
    }
  }

  return (
    <div className='flex flex-col h-screen w-screen overflow-y-hidden'>
      <ul className='menu menu-horizontal gap-2 bg-base-300'>
      <div className='dropdown dropdown-hover'>
          <div className='btn btn-ghost btn-sm'>Folder</div>
          <ul className='dropdown-content menu bg-base-100 shadow w-40 rounded-box z-10'>
            <li><a onClick={selectFile}>Open Folder</a></li>
            <li><a>Create Backup</a></li>
          </ul>
        </div>
        <div className='dropdown dropdown-hover'>
          <div className='btn btn-ghost btn-sm'>Mode</div>
          <ul className='dropdown-content menu bg-base-100 shadow w-40 rounded-box z-10'>
            <li className=''><a>Classic</a></li>
            <li className=''><a>Diff View</a></li>
          </ul>
        </div>
        <div className='dropdown dropdown-hover'>
          <div className='btn btn-ghost btn-sm'>Help</div>
          <ul className='dropdown-content menu bg-base-100 shadow w-40 rounded-box z-10'>
            <li className='' onClick={handleBackClick}><a>Welcome</a></li>
            <li className=''><a>Preferences...</a></li>
            <li className=''><a>About</a></li>
          </ul>
        </div>
      </ul>
      <div className="flex h-full">
        <div className='flex align-items flex-col pl-6 pt-6 gap-4 w-2/5'>
        <ul className="menu menu-xs bg-base-200 rounded-lg w-full overflow-x-auto overflow-y-auto h-5/6">
          {
            tree.map((entry) => {         
                return addMenuEntries(entry);
              })
          }
        </ul>
        </div>
        <div className="divider divider-horizontal"></div>
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
