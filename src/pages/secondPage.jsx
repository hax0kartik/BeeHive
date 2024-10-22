import { warn } from '@tauri-apps/plugin-log';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCallback, useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import Header from '../compenents/header';
import Footer from '../compenents/footer';
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
    [
      {
        name: "HKEY_LOCAL_MACHINE",
        path: "\\",
        hasChildren: true,
        children: [
          {
            name: "Security",
            path: "\\Security",
            children: [],
            hasChildren: true
          },
          {
            name: "SAM",
            path: "\\SAM",
            children: [],
            hasChildren: true
          },
          {
            name: "Software",
            path: "\\Software",
            children: [],
            hasChildren: true
          },
          {
            name: "System",
            path: "\\System",
            children: [],
            hasChildren: true
          }
        ]
      }
    ]
  );

  const systemReader = (filePath) => {
    if (!filePath) {
      warn('Error: filePath is undefined or empty.');
      return;
    }
    warn("System reader called : "+filePath);
    invoke('t_hive_reader', { filepath: filePath })
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

      for (let i = 0; i < treeNode.length; i++) {
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
                name: newChildren[j]["name"],
                path: treeNode[i].path + "\\" + newChildren[j]["name"],
                children: [],
                hasChildren: newChildren[j]["has_children"],
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
    let res = await invoke('t_get_subkeys', { keypath: e.target.id })
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
      <Header onChange={filePathChange} />
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
      <Footer System={System} Software={Software} Security={Security} User={User} Sam={Sam} mode={"Classic"}/>
    </div>
  );
}

export default NewPage;
