// Learn more about Tauri commands at https://v2.tauri.app/develop/calling-rust/

use std::sync::Mutex;
use tauri::State;
use nt_hive2::{KeyNode, SubPath, RegistryValue};
use std::fs::File;
use std::cell::RefCell;
use std::rc::Rc;

mod hives;
mod trees;

struct AppStorage {
    hive_reader: Mutex<hives::Hives>
}

#[tauri::command(async)]
fn t_get_keys(keypath: &str, storage: State<AppStorage>) -> trees::KeyValue {
    println!("{}", keypath);
    let mut res = trees::KeyValue::new();

    let subkeys = keypath.split("\\").collect::<Vec<_>>();

    if subkeys.len() < 2 {
        return res;
    }

    let mut hive_reader = storage.hive_reader.lock().unwrap();

    let hive = match subkeys[1] {
        "Security" | "System" | "User" | "SAM" | "Software" => {
            hive_reader.get_hive_by_name(subkeys[1]).unwrap()
        }

        "" => return res,

        _ => {
            println!("Hive name : {:?}", subkeys[1]);
            unimplemented!()
        }
    };

    let key_node = hive.get_root_node().unwrap();
    let mut read_location : Vec<&str> = Vec::new();
    read_location.extend_from_slice(&subkeys[2..]);

    if read_location.len() > 0 { 
        let rnode = key_node.subpath(&read_location, hive.hive.as_mut().unwrap());
        let node = rnode.unwrap().unwrap();

        for value in node.borrow().values().iter() {
            let valstr = match value.value() {
                RegistryValue::RegNone | RegistryValue::RegUnknown | RegistryValue::RegFileTime => format!(""),
                RegistryValue::RegDWord(val) | RegistryValue::RegDWordBigEndian(val) => format!("0x{:08X}", val),
                RegistryValue::RegSZ(val) => format!("{:?}", val),
                val => format!("{:?}", val)
            };

            res.push_key(value.name(), &valstr);
            println!("Key pair: {:?}, {:?}", value.name(), valstr);
        }
    }

    return res;
}

#[tauri::command(async)]
fn t_get_subkeys(keypath: &str, storage: State<AppStorage>) -> trees::Entries {
    println!("{}", keypath);
    let mut res = trees::Entries::new();

    let subkeys = keypath.split("\\").collect::<Vec<_>>();

    if subkeys.len() < 2 {
        return res;
    }

    let mut hive_reader = storage.hive_reader.lock().unwrap();

    let hive = match subkeys[1] {
        "Security" | "System" | "User" | "SAM" | "Software" => {
            hive_reader.get_hive_by_name(subkeys[1]).unwrap()
        }

        "" => return res,

        _ => {
            println!("Hive name : {:?}", subkeys[1]);
            unimplemented!()
        }
    };

    let key_node = hive.get_root_node().unwrap();
    let mut read_location : Vec<&str> = Vec::new();
    read_location.extend_from_slice(&subkeys[2..]);

    if read_location.len() > 0 { 
        let rnode = key_node.subpath(&read_location, hive.hive.as_mut().unwrap());
        let node = rnode.unwrap().unwrap();

        for subkey in node.borrow().subkeys(hive.hive.as_mut().unwrap()).expect("FAILED!").iter() {
            res.push_key(subkey.borrow().name(), subkey.borrow().subkey_count() > 0);
        }
    } else {
        for subkey in key_node.subkeys(hive.hive.as_mut().unwrap()).expect("FAILED!").iter() {
            res.push_key(subkey.borrow().name(), subkey.borrow().subkey_count() > 0);
            println!("node -> {:?} child -> {:?}", key_node.name(), subkey.borrow().name());
        }
    }

    return res;
}

/*
    Kartik's Note: No need to cache this. It is performant.
*/
#[tauri::command]
fn t_is_hive_valid(hivename: &str, storage: State<AppStorage>) -> bool {
    let mut hive_reader = storage.hive_reader.lock().unwrap();

    let hive = match hivename {
        "Security" | "System" | "User" | "SAM" | "Software" => {
            hive_reader.get_hive_by_name(hivename)
        }

        _ => {
            println!("Hive name : {:?}", hivename);
            unimplemented!()
        }
    };

    return hive.is_some();
}

#[allow(dead_code)]
fn key_recurse(key_node: &Rc<RefCell<KeyNode>>, hive: &mut nt_hive2::Hive<File, nt_hive2::CleanHive>, c : u32) {
    for _ in 0..c {
        print!("--");
    }

    println!("{}", key_node.borrow().name());

    for subkey in key_node.borrow().subkeys(hive).expect("FAILED!").iter() {
        key_recurse(subkey, hive, c + 1);
    }
}

fn build_tree(key_node: &Rc<RefCell<KeyNode>>, hive: &mut nt_hive2::Hive<File, nt_hive2::CleanHive>, path: &str) -> (String, trees::Node) {
    let knode = key_node.borrow();
    let name = knode.name();
    let new_path = format!("{path}/{name}");

    let mut node = trees::Node::new(&new_path, knode.subkey_count() > 0);

    for value in knode.values().iter() {
        let valstr = match value.value() {
            RegistryValue::RegNone | RegistryValue::RegUnknown | RegistryValue::RegFileTime => format!(""),
            RegistryValue::RegDWord(val) | RegistryValue::RegDWordBigEndian(val) => format!("0x{:08X}", val),
            RegistryValue::RegSZ(val) => format!("{:?}", val),
            val => format!("{:?}", val)
        };

        node.insert_value(value.name(), &valstr);
    }

    for subkey in knode.subkeys(hive).expect("FAILED while getting subkey!").iter() {
        let (childname, child) = build_tree(subkey, hive, &new_path);
        node.insert_child(&childname, child);
    }

    return (name.to_string(), node);
}

#[tauri::command]
fn t_hive_differ(filepath1: &str, filepath2: &str, _storage: State<AppStorage>) -> trees::Nodes {
    println!("t_hive_differ called");

    let mut nodes = trees::Nodes::new();

    let mut hive1 = hives::Hive::new(filepath1);
    let mut hive2 = hives::Hive::new(filepath2);

    hive1.create_internal_hive();
    hive2.create_internal_hive();

    let key_node1 = hive1.get_root_node().unwrap();
    let key_node2 = hive2.get_root_node().unwrap();

    let (_, tree1) = build_tree(&Rc::new(RefCell::new(key_node1)), hive1.hive.as_mut().unwrap(), "/");
    let (_, tree2) = build_tree(&Rc::new(RefCell::new(key_node2)), hive2.hive.as_mut().unwrap(), "/");

    nodes.push_node(tree1);
    nodes.push_node(tree2);

    return nodes;
}
/* 
    Kartik's Note: DO NOT modify. Primary function required to read hives from disk.
*/
#[tauri::command]
fn t_hive_reader(filepath: &str, storage: State<AppStorage>) {
    println!("t_hive_reader called");

    let mut hive_reader = hives::Hives::new();
    hive_reader.look_for_hives(filepath);
    *storage.hive_reader.lock().unwrap() = hive_reader;
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .manage(AppStorage {
            hive_reader : Default::default()
        })
        .plugin(tauri_plugin_log::Builder::new().build())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![t_hive_reader, t_is_hive_valid, t_get_subkeys, t_get_keys, t_hive_differ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
