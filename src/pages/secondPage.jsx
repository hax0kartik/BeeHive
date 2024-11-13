import { warn } from '@tauri-apps/plugin-log';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCallback, useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import Header from '../components/header';
import Footer from '../components/footer';
import { message } from '@tauri-apps/plugin-dialog';

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
  const [Table, setTable] = useState({});

  const filePathChange = (data) => {
    // console.log(data);
    // console.log(data['Message']);
    // console.log(data['filePath']);
    setMessage(data['Message']);
    setFilePath(data['filePath']);
  };

  useEffect(() => {
    if (filePath) {
      systemReader(filePath);
      getValidHives();
    }
  }, [filePath]);

  const [tree, setTree] = useState(
    {
      "HKEY_LOCAL_MACHINE" : {
        path: "\\",
        hasChildren: true,
        values: {},
        children: {
          Security : {
            path: "\\Security",
            children: {},
            values: {},
            hasChildren: true
          },
          SAM : {
            path: "\\SAM",
            children: {},
            values: {},
            hasChildren: true
          },
          Software : {
            path: "\\Software",
            children: {},
            values: {},
            hasChildren: true
          },
          System :  {
            path: "\\System",
            children: {},
            values: {},
            hasChildren: true
          }
      }
      }
    }
  );

  const systemReader = (filePath) => {
    if (!filePath) {
      warn('Error: filePath is undefined or empty.');
      return;
    }
    warn("System reader called : " + filePath);
    invoke('t_hive_reader', { filepath: filePath })
      .then((message) => {
        console.log(message);
        setMessage(message);
      })
      .catch((error) => warn('Error invoking t_hive_reader: ' + error));
  };

  const getValidHives = () => {
    // warn("GET VALID HIVES CALLED : ------------------------------------------------");
    // console.log("GET VALID HIVES CALLED : ------------------------------------------------");
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

  const modifyTree = (otree, key, newChildren) => {
    function node_traverse(treeNode, node) {
      let current = node[0];
      // console.log("Current node is " + node)

      if (treeNode[current] !== undefined) {
        if (node.length > 1) {
          node.shift();
          node_traverse(treeNode[current].children, node);
        } else {
          let objs = new Map();
          for (let j = 0; j < newChildren.length; j++) {
            let obj = {
              path: treeNode[current].path + "\\" + newChildren[j]["name"],
              children: {},
              values: {},
              hasChildren: newChildren[j]["has_children"],
            }

            objs.set(newChildren[j]["name"], obj);
          }

          treeNode[current].children = Object.fromEntries(objs);
        }
      }
    }

    let keys = key.split("\\")
    keys[0] = "HKEY_LOCAL_MACHINE";

    let newTree = otree;
    node_traverse(newTree, keys);

    return newTree;
  }

  const modifyTreeAddKeypair = (otree, key, keypair) => {
    function node_traverse(treeNode, node) {
      let current = node[0];
      // console.log("Current node is " + node)

      if (treeNode[current] !== undefined) {
        if (node.length > 1) {
          node.shift();
          node_traverse(treeNode[current].children, node);
        } else {
          treeNode[current].values = keypair;
        }
      }
    }

    let keys = key.split("\\")
    keys[0] = "HKEY_LOCAL_MACHINE";

    let newTree = otree;
    node_traverse(newTree, keys);

    return newTree;
  }

  const get_key_info = async (e) => {
    let res = await invoke('t_get_keys', { keypath: e });
    let nTree = modifyTreeAddKeypair(tree, e, res["entries"]);
    setTree(prevTree => ({...nTree}));
    setTable(prevTable => ({ ...res["entries"] }));
  }

  useEffect(() => {
    systemReader(filePath);
  }, []);

  const handleExtension = async (e) => {
    let res = await invoke('t_get_subkeys', { keypath: e.target.id })
    let nTree = modifyTree(tree, e.target.id, res["entries"]);
    setTree(prevTree => ({...nTree}));
  }

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

  return (
    <div className='flex flex-col h-screen w-screen overflow-y-hidden'>
      <Header onChange={filePathChange} />
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
      <Footer System={System} Software={Software} Security={Security} User={User} Sam={Sam} mode={"Classic"} />
    </div>
  );
}

export default NewPage;
