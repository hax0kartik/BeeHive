// Learn more about Tauri commands at https://v2.tauri.app/develop/calling-rust/

use std::sync::Mutex;
use forensic_rs::prelude::*;
use frnsc_hive::reader::HiveRegistryReader;
use frnsc_hive::reader::open_hive_with_logs;
use tauri::State;

struct AppStorage {
    is_system_present : Mutex<bool>,
    is_software_present: Mutex<bool>,
    is_security_present: Mutex<bool>,
    is_sam_present: Mutex<bool>
}

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

pub fn from_fs_custom(mut reader: HiveRegistryReader, mut fs: Box<dyn VirtualFileSystem>, storage: &State<AppStorage>) -> ForensicResult<Box<dyn RegistryReader>> {
    let config_folder = std::path::Path::new(".\\");

    if let Some(hive) = open_hive_with_logs(&mut fs, config_folder, "SYSTEM") {
        reader.set_system(hive);
        *storage.is_system_present.lock().unwrap() = true;
    }

    if let Some(hive) = open_hive_with_logs(&mut fs, config_folder, "SOFTWARE") {
        reader.set_software(hive);
        *storage.is_software_present.lock().unwrap() = true;
    }

    if let Some(hive) = open_hive_with_logs(&mut fs, config_folder, "SECURITY") {
        reader.set_security(hive);
        *storage.is_security_present.lock().unwrap() = true;
    }

    if let Some(hive) = open_hive_with_logs(&mut fs, config_folder, "SAM") {
        reader.set_sam(hive);
        *storage.is_sam_present.lock().unwrap() = true;
    }

    match reader.load_user_hives(&mut fs) {
        Ok(_) => {}
        Err(e) => { 
            notify_low!(
                NotificationType::Informational,
                "Error loading user hives: {:?}",
                e
            );
        }
    };
    Ok(Box::new(reader))
}

#[tauri::command]
fn fileexists(filepath: &str, storage: State<AppStorage>) -> String {
    let fs = Box::new(forensic_rs::core::fs::ChRootFileSystem::new(filepath, Box::new(forensic_rs::core::fs::StdVirtualFS::new())));
    let hreader = HiveRegistryReader::new();
    from_fs_custom(hreader, fs, &storage).unwrap();
    // println!("File exists executed {}",filepath);

    let system = *storage.is_system_present.lock().unwrap();
    let software = *storage.is_software_present.lock().unwrap();
    let security = *storage.is_security_present.lock().unwrap();
    let sam = *storage.is_sam_present.lock().unwrap();

    // println!("{:?}", sam);

    format!("{:?}:{:?}:{:?}:{:?}", system, software, security, sam)
}

#[tauri::command]
fn hive_system_reader(filepath: &str, storage: State<AppStorage>) -> String  {
    let fs = Box::new(forensic_rs::core::fs::ChRootFileSystem::new(filepath, Box::new(forensic_rs::core::fs::StdVirtualFS::new())));
    let hreader = HiveRegistryReader::new();
    let reader = from_fs_custom(hreader, fs, &storage).unwrap();
    // let res = reader.open_key(HKLM, r"SAM\Domains\Account\Users\Names");
    let mut s = String::new();

    if *storage.is_sam_present.lock().unwrap() {
        let user_names_key = reader.open_key(HKLM, r"SAM\Domains\Account\Users\Names").expect("Should list all user names");
        let users = reader.enumerate_keys(user_names_key).expect("Should enumerate users");
        println!("Users: {:?}", users);
        s.push_str(&users.join(", "));
    }

    format!("{}", s)
}
#[tauri::command]
fn hive_software_reader(filepath: &str, storage: State<AppStorage>) -> String  {
    let fs = Box::new(forensic_rs::core::fs::ChRootFileSystem::new(filepath, Box::new(forensic_rs::core::fs::StdVirtualFS::new())));
    let hreader = HiveRegistryReader::new();
    let reader = from_fs_custom(hreader, fs, &storage).unwrap();
    // let res = reader.open_key(HKLM, r"SAM\Domains\Account\Users\Names");
    let mut s = String::new();

    if *storage.is_software_present.lock().unwrap() {
        let network_cards = reader.open_key(HKLM, r"SOFTWARE\Microsoft\Windows NT\CurrentVersion\NetworkCards").unwrap();
        let network_cards_values = reader.enumerate_keys(network_cards).unwrap();
        println!("Network Cards: {:?}", network_cards_values);
        s.push_str(&network_cards_values.join(", "));
    
        let run_apps = reader.open_key(HKLM, r"SOFTWARE\RegisteredApplications").unwrap();
        let run_apps_values = reader.enumerate_values(run_apps).unwrap();
    
        println!("\n---/ Registered Applications /----");
        for value in run_apps_values.iter() {
            let val = reader.read_value(run_apps, &value).unwrap();
            println!("{:?} : {:?}", value, val);
        }
        s.push_str(&run_apps_values.join(", "));
    }

    format!("{}", s)
}
#[tauri::command]
fn hive_security_reader(filepath: &str, storage: State<AppStorage>) -> String  {
    let fs = Box::new(forensic_rs::core::fs::ChRootFileSystem::new(filepath, Box::new(forensic_rs::core::fs::StdVirtualFS::new())));
    let hreader = HiveRegistryReader::new();
    let reader = from_fs_custom(hreader, fs, &storage).unwrap();
    // let res = reader.open_key(HKLM, r"SAM\Domains\Account\Users\Names");
    let mut s = String::new();

    if *storage.is_sam_present.lock().unwrap() {
        let user_names_key = reader.open_key(HKLM, r"SAM\Domains\Account\Users\Names").expect("Should list all user names");
        let users = reader.enumerate_keys(user_names_key).expect("Should enumerate users");
        println!("Users: {:?}", users);
        s.push_str(&users.join(", "));
    }

    format!("{}", s)
}
#[tauri::command]
fn hive_sam_reader(filepath: &str, storage: State<AppStorage>) -> String  {
    let fs = Box::new(forensic_rs::core::fs::ChRootFileSystem::new(filepath, Box::new(forensic_rs::core::fs::StdVirtualFS::new())));
    let hreader = HiveRegistryReader::new();
    let reader = from_fs_custom(hreader, fs, &storage).unwrap();
    // let res = reader.open_key(HKLM, r"SAM\Domains\Account\Users\Names");
    let mut s = String::new();

    if *storage.is_sam_present.lock().unwrap() {
        let user_names_key = reader.open_key(HKLM, r"SAM\Domains\Account\Users\Names").expect("Should list all user names");
        let users = reader.enumerate_keys(user_names_key).expect("Should enumerate users");
        println!("Users: {:?}", users);
        s.push_str(&users.join(", "));
    }

    format!("{}", s)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .manage(AppStorage {
            is_system_present : Default::default(),
            is_software_present : Default::default(),
            is_security_present : Default::default(),
            is_sam_present : Default::default()
        })
        .plugin(tauri_plugin_log::Builder::new().build())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![greet, fileexists, hive_system_reader, hive_software_reader, hive_security_reader, hive_sam_reader])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
